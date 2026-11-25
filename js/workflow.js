/* ==========================================================
   workflow.js — AI Content Workflow (5 bước)
   LƯU Ý: Đây là bản DEMO chạy bằng JavaScript với dữ liệu và
   quy tắc mô phỏng. Không có mô hình AI thật nào được gọi.
   ========================================================== */
(function () {
  const A = window.ADP;
  const KEY = 'adp-workflow';
  let mem = {};
  const store = {
    get() { try { return JSON.parse(sessionStorage.getItem(KEY)) || mem; } catch (e) { return mem; } },
    set(patch) { const v = Object.assign({}, this.get(), patch); mem = v; try { sessionStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} return v; }
  };
  A.wf = store;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const STEPS = A.workflowSteps;

  /* ---------- Progress bar & step nav ---------- */
  function renderProgress(current) {
    const host = $('#wfProgress'); if (!host) return;
    const max = Math.max(store.get().maxStep || 1, current);
    host.innerHTML = `<div class="fill" style="width:${((current - 1) / 4) * 80}%"></div>` + STEPS.map(s => {
      const cls = s.n < current ? 'done' : s.n === current ? 'current' : (s.n > max ? 'locked' : '');
      return `<a class="wf-p ${cls}" href="${A.u(s.url)}" aria-label="Bước ${s.n}: ${s.name}" ${s.n === current ? 'aria-current="step"' : ''}><span class="dot">${s.n < current ? A.icon('check') : A.icon(s.icon)}</span><span>${String(s.n).padStart(2, '0')} · ${s.name}</span></a>`;
    }).join('');
    store.set({ maxStep: max });
  }
  function renderNav(current) {
    const host = $('#wfNav'); if (!host) return;
    const prev = STEPS[current - 2], next = STEPS[current];
    host.innerHTML = (prev ? `<a class="btn btn-secondary" href="${A.u(prev.url)}">${A.icon('arrow-left')}Bước trước: ${prev.name}</a>` : `<a class="btn btn-secondary" href="${A.u('pages/ai-experience.html#workflow')}">${A.icon('layout-grid')}Tổng quan workflow</a>`)
      + (next ? `<a class="btn btn-primary" id="wfNext" href="${A.u(next.url)}">Bước tiếp: ${next.name}${A.icon('arrow-right')}</a>` : `<a class="btn btn-primary" href="${A.u('pages/knowledge-hub.html')}">Khám phá thư viện tri thức${A.icon('arrow-right')}</a>`);
  }

  /* ---------- Overview (ai-experience + home share) ---------- */
  function initOverview() {
    const host = $('#wfOverview'); if (!host) return;
    const max = store.get().maxStep || 1;
    host.innerHTML = STEPS.map(s => `
      <article class="card how-card step-card" style="padding-top:1.5rem">
        <div class="ti">${A.icon(s.icon)}</div>
        <span class="caption text-cyan upper" style="letter-spacing:.14em;font-weight:700">Bước ${String(s.n).padStart(2, '0')}</span>
        <h3 style="font-size:1.05rem;margin-top:.2rem">${s.name}</h3>
        <p>${s.desc}</p>
        <a class="btn ${s.n <= max ? 'btn-primary' : 'btn-secondary'} btn-sm" style="margin-top:1rem" href="${A.u(s.url)}">${s.n === 1 ? 'Bắt đầu' : s.n <= max ? 'Tiếp tục' : 'Mở bước này'}${A.icon('arrow-right')}</a>
      </article>`).join('');
    const bar = $('#wfOverviewProgress');
    if (bar) {
      bar.innerHTML = STEPS.map(s => `<a class="wf-p ${s.n < max ? 'done' : s.n === max ? 'current' : ''}" href="${A.u(s.url)}"><span class="dot">${s.n < max ? A.icon('check') : A.icon(s.icon)}</span><span>${String(s.n).padStart(2, '0')} · ${s.name}</span></a>`).join('') + `<div class="fill" style="width:${((max - 1) / 4) * 80}%"></div>`;
    }
    const reset = $('#wfReset'); if (reset) reset.addEventListener('click', () => { try { sessionStorage.removeItem(KEY); } catch (e) {} mem = {}; A.toast('Đã đặt lại tiến trình workflow.', 'rotate-ccw'); setTimeout(() => location.reload(), 500); });
  }

  /* ================= STEP 1 — RESEARCH ================= */
  const STOP = new Set(['va','la','cua','cho','trong','voi','mot','nhung','cac','duoc','the','nao','khi','den','tu','ve']);
  function research() {
    const topic = $('#topic'), genre = $('#genre'), aud = $('#audience'), btn = $('#analyze'), res = $('#analysisResult'), refs = $('#references');
    const s = store.get(); if (s.topic) topic.value = s.topic; if (s.genre) genre.value = s.genre; if (s.audience) aud.value = s.audience;
    const REFS = [
      ['Báo cáo ngành xuất bản', 'file-bar-chart', A.resources.filter(r => r.type === 'Báo cáo')],
      ['Nghiên cứu công nghệ AI', 'cpu', A.resources.filter(r => r.tool === 'Generative AI' || r.tool === 'AI Research')],
      ['Tạp chí học thuật (mẫu)', 'graduation-cap', null]
    ];
    const ACADEMIC = ['Tạp chí Xuất bản & Truyền thông số (số mẫu 03/2026)', 'Journal of Digital Publishing Studies (mẫu)', 'Kỷ yếu hội thảo AI trong truyền thông (mẫu)'];
    btn.addEventListener('click', async () => {
      const t = topic.value.trim();
      if (!t) { A.toast('Vui lòng nhập chủ đề cần phân tích.', 'alert-circle'); topic.focus(); return; }
      store.set({ topic: t, genre: genre.value, audience: aud.value });
      btn.disabled = true; btn.innerHTML = `${A.icon('loader-circle', 'spin')}Đang phân tích...`; A.refreshIcons();
      res.innerHTML = `<div class="placeholder-state">${A.icon('loader-circle', 'spin')}<p>Đang mô phỏng phân tích chủ đề “${A.esc(t)}”...</p></div>`; A.refreshIcons();
      await sleep(900);
      const words = t.split(/\s+/).filter(w => !STOP.has(A.norm(w)) && w.length > 1);
      const base = words.slice(0, 3).join(' ') || t;
      const kws = [...new Set([t, base, ...words.slice(0, 4), 'xuất bản số', 'trí tuệ nhân tạo', 'trải nghiệm độc giả', 'quy trình biên tập'])].slice(0, 9);
      const related = [`${base} và cá nhân hóa nội dung`, `Bản quyền trong ${base}`, `Dữ liệu độc giả và ${base}`, `Case study ứng dụng ${base}`];
      const dirs = [`Khảo sát hiện trạng ${base} tại các đơn vị xuất bản trong nước.`, `So sánh ba mô hình triển khai ${base} theo chi phí và rủi ro.`, `Phỏng vấn biên tập viên về giới hạn của công cụ tự động.`];
      const struct = ['Mở đầu: bối cảnh và câu hỏi chính', 'Nền tảng công nghệ và thuật ngữ', `Ứng dụng ${base} trong thực tế`, 'Rủi ro, đạo đức và bản quyền', 'Khuyến nghị cho ' + aud.value.toLowerCase()];
      res.innerHTML = `
        <div class="stack" style="--stack:1.1rem">
          <div><h4 class="label" style="margin-bottom:.5rem">Từ khóa gợi ý</h4><div class="kw-list">${kws.map(k => `<span class="chip">${A.esc(k)}</span>`).join('')}</div></div>
          <div><h4 class="label" style="margin-bottom:.5rem">Chủ đề liên quan</h4><div class="stack" style="--stack:.5rem">${related.map(r => `<div class="result-item">${A.icon('link-2')} ${A.esc(r)}</div>`).join('')}</div></div>
          <div><h4 class="label" style="margin-bottom:.5rem">Gợi ý hướng nghiên cứu</h4><div class="stack" style="--stack:.5rem">${dirs.map((r, i) => `<div class="result-item"><b>Hướng ${i + 1}</b>${A.esc(r)}</div>`).join('')}</div></div>
          <div><h4 class="label" style="margin-bottom:.5rem">Đề xuất cấu trúc nội dung</h4><ol class="toc-list">${struct.map(x => `<li>${A.esc(x)}</li>`).join('')}</ol></div>
        </div>`;
      refs.innerHTML = REFS.map(([name, ic, list]) => `
        <div><h4 class="label" style="margin-bottom:.6rem;display:flex;gap:.5rem;align-items:center"><span class="text-cyan">${A.icon(ic)}</span>${name}</h4>
        <div class="stack" style="--stack:.5rem">${list ? list.slice(0, 2).map(r => `<a class="result-item" style="display:block" href="${A.u('pages/resource-detail.html?id=' + r.id)}"><b>${A.esc(r.title)}</b><span class="caption">${r.type} · ${r.format} · ${r.size}</span></a>`).join('') : ACADEMIC.map(x => `<div class="result-item">${A.esc(x)}</div>`).join('')}</div></div>`).join('');
      btn.disabled = false; btn.innerHTML = `${A.icon('sparkles')}Phân tích lại`; A.refreshIcons();
      A.toast('Đã tạo kết quả phân tích mô phỏng.', 'sparkles');
    });
  }

  /* ================= STEP 2 — WRITING ================= */
  function writing() {
    const f = { topic: $('#wTopic'), genre: $('#wGenre'), style: $('#wStyle'), len: $('#wLength'), aud: $('#wAudience') };
    const out = $('#wOutput'), gen = $('#wGenerate'), re = $('#wRewrite'), cp = $('#wCopy'), clr = $('#wClear'), count = $('#wCount');
    const s = store.get(); if (s.topic) f.topic.value = s.topic; if (s.genre) f.genre.value = s.genre; if (s.audience) f.aud.value = s.audience;
    let variant = 0, busy = false;
    const LEN = { 'Ngắn (~120 từ)': 1, 'Vừa (~250 từ)': 2, 'Dài (~400 từ)': 3 };
    const TONE = {
      'Học thuật': ['Xét từ góc độ nghiên cứu', 'Các số liệu khảo sát cho thấy', 'Do đó, có thể kết luận rằng'],
      'Báo chí': ['Trong bối cảnh ngành đang chuyển động mạnh', 'Theo nhiều đơn vị xuất bản', 'Điều đáng chú ý là'],
      'Gần gũi': ['Hãy thử hình dung', 'Thực tế là', 'Và đây là điều thú vị']
    };
    function compose() {
      const t = f.topic.value.trim(), g = f.genre.value, a = f.aud.value, tone = TONE[f.style.value] || TONE['Báo chí'], L = LEN[f.len.value] || 2;
      const paras = [
        `${tone[0]}, “${t}” đang trở thành một chủ đề được ${a.toLowerCase()} đặc biệt quan tâm. Bài viết thể loại ${g.toLowerCase()} này đi vào những điểm cốt lõi, giúp người đọc nắm được bối cảnh trước khi quyết định bước tiếp theo.`,
        `${tone[1]}, giá trị lớn nhất của ${t.toLowerCase()} nằm ở việc rút ngắn các khâu lặp lại như tra cứu, soạn thảo nháp và chuẩn hóa định dạng, để con người dành thời gian cho phần cần phán đoán: ý tưởng, giọng văn và trách nhiệm với độc giả.`,
        `Tuy vậy, mọi kết quả do máy đề xuất đều cần được kiểm chứng. Nguồn dữ liệu, bản quyền và mức độ chính xác phải được ghi nhận rõ ràng trong từng bước của quy trình biên tập.`,
        `${tone[2]}, nhà xuất bản nên bắt đầu từ một quy trình nhỏ, đo lường kết quả và mở rộng dần. Cách tiếp cận này giúp giảm rủi ro, đồng thời tạo ra bằng chứng cụ thể để thuyết phục các bên liên quan.`
      ];
      const alt = [
        `Câu hỏi không còn là “có nên dùng” mà là “dùng như thế nào” khi nói đến ${t.toLowerCase()}. Với ${a.toLowerCase()}, câu trả lời bắt đầu từ việc xác định rõ mục tiêu của từng ấn phẩm.`,
        `${tone[1]}, những đơn vị đạt kết quả tốt nhất thường giữ con người ở trung tâm: máy hỗ trợ ý tưởng, biên tập viên quyết định lựa chọn cuối cùng.`,
        `Một bộ nguyên tắc ngắn gọn về minh bạch, kiểm chứng và bảo vệ dữ liệu sẽ giúp đội ngũ yên tâm hơn khi thử nghiệm công cụ mới.`,
        `${tone[2]}, hành trình này không có điểm kết thúc: mỗi ấn phẩm là một lần học hỏi để quy trình tốt hơn.`
      ];
      return (variant % 2 ? alt : paras).slice(0, L + 1).join('\n\n') + '\n\n— Nội dung mẫu do hệ thống demo mô phỏng, không phải kết quả của mô hình AI thật.';
    }
    async function typeOut(text) {
      busy = true; out.classList.add('typing'); out.textContent = '';
      const step = Math.max(2, Math.round(text.length / 120));
      for (let i = 0; i < text.length; i += step) { out.textContent = text.slice(0, i + step); await sleep(14); }
      out.textContent = text; out.classList.remove('typing'); busy = false; update();
    }
    function update() { const n = out.textContent.trim().split(/\s+/).filter(Boolean).length; count.textContent = out.dataset.empty === '1' ? '0 từ' : n + ' từ'; }
    function needTopic() { if (!f.topic.value.trim()) { A.toast('Vui lòng nhập chủ đề trước khi tạo nội dung.', 'alert-circle'); f.topic.focus(); return true; } }
    gen.addEventListener('click', () => { if (busy || needTopic()) return; variant = 0; out.dataset.empty = '0'; store.set({ topic: f.topic.value.trim(), genre: f.genre.value, audience: f.aud.value }); const txt = compose(); store.set({ content: txt }); typeOut(txt); A.toast('Đã tạo nội dung mẫu.', 'sparkles'); });
    re.addEventListener('click', () => { if (busy) return; if (out.dataset.empty !== '0') { A.toast('Hãy tạo nội dung trước khi viết lại.', 'alert-circle'); return; } variant++; const txt = compose(); store.set({ content: txt }); typeOut(txt); A.toast('Đã viết lại với phiên bản khác.', 'refresh-cw'); });
    cp.addEventListener('click', async () => {
      if (out.dataset.empty !== '0') { A.toast('Chưa có nội dung để sao chép.', 'alert-circle'); return; }
      try { await navigator.clipboard.writeText(out.textContent); } catch (e) { const r = document.createRange(); r.selectNodeContents(out); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); document.execCommand('copy'); sel.removeAllRanges(); }
      A.toast('Đã sao chép nội dung vào clipboard.', 'copy');
    });
    clr.addEventListener('click', () => { out.innerHTML = `<span class="text-sub">Nội dung sẽ xuất hiện ở đây sau khi bạn nhấn “Tạo nội dung”.</span>`; out.dataset.empty = '1'; store.set({ content: '' }); update(); A.toast('Đã xóa nội dung.', 'trash-2'); });
    if (s.content) { out.textContent = s.content; out.dataset.empty = '0'; update(); }
    out.contentEditable = 'true'; out.addEventListener('input', () => { out.dataset.empty = '0'; store.set({ content: out.textContent }); update(); });
    out.addEventListener('focus', () => { if (out.dataset.empty === '1') { out.textContent = ''; } });
    update();
  }

  /* ================= STEP 3 — EDITING ================= */
  const SAMPLE = `Trí tuệ nhân tạo đang ảnh hưỡng mạnh tới nghành xuất bản . Các nhà xuất bản sử lý bản thảo nhanh hơn , nhưng dữ liệu cần được kiểm tra chính sác trước khi in.

Công cụ hiệu đính giành cho biên tập viên giúp phát hiện lỗi rất là nhanh, và hỗ trợ  tối ưu bố cục. Nhiều đơn vị đang dùng AI để hỗ trợ soạn thảo, còn A.I. chỉ được xem là công cụ phụ trợ. Sách điện tử (ebook) ngày càng phổ biến, trong khi e-book tương tác vẫn đang ở giai đoạn thử nghiệm, và việc kết hợp giữa nhiều định dạng cùng lúc đòi hỏi quy trình kiểm soát chất lượng chặt chẽ hơn rất nhiều so với trước đây, nhất là khi nội dung được cập nhật liên tục theo phản hồi của độc giả.

kết quả cuối cùng vẫn do con người quyết định.`;
  const RULES = {
    spell: [['ảnh hưỡng', 'ảnh hưởng'], ['nghành', 'ngành'], ['sử lý', 'xử lý'], ['chính sác', 'chính xác'], ['giành cho', 'dành cho']],
    grammar: [[/ +([,.;:!?])/g, '$1', 'Thừa khoảng trắng trước dấu câu'], [/([^\s]) {2,}([^\s])/g, '$1 $2', 'Thừa khoảng trắng giữa các từ'], [/(^|[.!?]\s+|\n\n)([a-zà-ỹ])/g, null, 'Câu bắt đầu bằng chữ thường']],
    style: [['rất là', 'rất', 'Cụm “rất là” dư từ'], ['hỗ trợ  tối ưu', 'hỗ trợ tối ưu', null]]
  };
  function analyze(text) {
    const out = [];
    RULES.spell.forEach(([w, r]) => { if (text.includes(w)) out.push({ tab: 'spell', prio: 'high', msg: 'Lỗi chính tả', found: w, fix: r }); });
    if (/ +[,.;:!?]/.test(text)) { const m = text.match(/\S+ +[,.;:!?]/); out.push({ tab: 'grammar', prio: 'mid', msg: 'Thừa khoảng trắng trước dấu câu', found: m[0], fix: m[0].replace(/ +/g, ''), all: /( +)([,.;:!?])/g, allRep: '$2' }); }
    if (/\S {2,}\S/.test(text)) { const m = text.match(/\S {2,}\S/); out.push({ tab: 'grammar', prio: 'low', msg: 'Thừa khoảng trắng giữa các từ', found: m[0], fix: m[0].replace(/ {2,}/, ' '), all: /(\S) {2,}(?=\S)/g, allRep: '$1 ' }); }
    const re = /(^|\n\n|(?<=[a-zà-ỹ0-9)])[.!?] )([a-zà-ỹ]\S*)/g; let m;
    while ((m = re.exec(text))) { const w = m[2].replace(/[.,;:!?]+$/, ''); out.push({ tab: 'grammar', prio: 'mid', msg: 'Câu bắt đầu bằng chữ thường', found: w, show: w, fix: w.charAt(0).toUpperCase() + w.slice(1), ctx: m[1] + w, ctxFix: m[1] + w.charAt(0).toUpperCase() + w.slice(1) }); }
    if (text.includes('rất là')) out.push({ tab: 'style', prio: 'low', msg: 'Cụm “rất là” dư từ, nên rút gọn', found: 'rất là', fix: 'rất' });
    text.split(/(?<=[.!?])\s+/).forEach(sn => { const n = sn.trim().split(/\s+/).length; if (n > 40) out.push({ tab: 'style', prio: 'mid', msg: `Câu dài ${n} từ, nên tách ý`, found: sn.slice(0, 60) + '…', fix: null, advice: 'Tách thành 2–3 câu: nêu định dạng, nêu quy trình kiểm soát, rồi nêu lý do cập nhật liên tục.' }); });
    if (/\bA\.I\./.test(text)) out.push({ tab: 'consistency', prio: 'high', msg: 'Viết không thống nhất: “A.I.” và “AI”', found: 'A.I.', fix: 'AI' });
    if (/\bebook\b/.test(text) && /\be-book\b/.test(text)) out.push({ tab: 'consistency', prio: 'mid', msg: 'Viết không thống nhất: “ebook” và “e-book”', found: 'ebook', fix: 'e-book' });
    return out;
  }
  function editing() {
    const ms = $('#manuscript'), list = $('#issueList'), tabs = $('#editTabs'), btn = $('#checkBtn'), applyAll = $('#applyAll'), cp = $('#editCopy'), sum = $('#editSummary');
    const s = store.get(); ms.value = s.manuscript || SAMPLE;
    const load = $('#loadContent'); if (load) load.addEventListener('click', () => { const c = store.get().content; if (!c) { A.toast('Chưa có nội dung từ bước Viết. Đang dùng bản thảo mẫu.', 'alert-circle'); return; } ms.value = c.replace(/\n\n— Nội dung mẫu.*$/s, ''); store.set({ manuscript: ms.value }); checked = false; render(); A.toast('Đã nạp nội dung từ bước Viết.', 'download'); });
    const sampleBtn = $('#loadSample'); if (sampleBtn) sampleBtn.addEventListener('click', () => { ms.value = SAMPLE; store.set({ manuscript: SAMPLE }); checked = false; render(); A.toast('Đã nạp bản thảo mẫu có lỗi.', 'file-text'); });
    const TABN = { spell: 'Chính tả', grammar: 'Ngữ pháp', style: 'Diễn đạt', consistency: 'Nhất quán' };
    const PR = { high: ['Cao', 'alert-triangle'], mid: ['Trung bình', 'alert-circle'], low: ['Thấp', 'info'] };
    let issues = [], tab = 'spell', checked = false;
    function replaceOne(text, it) {
      if (it.all) return text.replace(it.all, it.allRep);
      if (it.ctx) return text.replace(it.ctx, it.ctxFix);
      return text.split(it.found).join(it.fix);
    }
    function render() {
      tabs.innerHTML = Object.entries(TABN).map(([k, n]) => `<button class="tab ${tab === k ? 'active' : ''}" data-tab="${k}" role="tab" aria-selected="${tab === k}">${n}<span class="count">${checked ? issues.filter(i => i.tab === k).length : '–'}</span></button>`).join('');
      if (!checked) { list.innerHTML = `<div class="placeholder-state">${A.icon('scan-search')}<p>Nhấn “Kiểm tra bản thảo” để phân tích. Bạn có thể chỉnh sửa trực tiếp văn bản ở cột bên trái.</p></div>`; sum.textContent = ''; A.refreshIcons(); return; }
      const cur = issues.filter(i => i.tab === tab);
      sum.innerHTML = `Tổng <b>${issues.length}</b> vấn đề · <b>${issues.filter(i => i.prio === 'high').length}</b> ưu tiên cao`;
      list.innerHTML = cur.length ? cur.map(it => `
        <div class="issue"><div class="head"><span class="prio ${it.prio}">${A.icon(PR[it.prio][1])}Ưu tiên ${PR[it.prio][0].toLowerCase()}</span><b class="small">${it.msg}</b></div>
          <div class="small">Phát hiện: <del>${A.esc(it.found)}</del></div>
          ${it.fix ? `<div class="small">Gợi ý: <ins>${A.esc(it.fix)}</ins></div><div><button class="btn btn-secondary btn-sm" data-apply="${issues.indexOf(it)}">${A.icon('check')}Áp dụng</button></div>` : `<div class="small text-sub">${A.esc(it.advice || '')}</div>`}
        </div>`).join('') : `<div class="placeholder-state">${A.icon('badge-check')}<p>Không phát hiện vấn đề ở mục “${TABN[tab]}”.</p></div>`;
      A.refreshIcons();
    }
    function run(silent) { issues = analyze(ms.value); checked = true; store.set({ manuscript: ms.value }); const first = Object.keys(TABN).find(k => issues.some(i => i.tab === k)); if (!silent && first && !issues.some(i => i.tab === tab)) tab = first; render(); }
    btn.addEventListener('click', async () => { btn.disabled = true; btn.innerHTML = `${A.icon('loader-circle', 'spin')}Đang kiểm tra...`; A.refreshIcons(); await sleep(700); run(); btn.disabled = false; btn.innerHTML = `${A.icon('scan-search')}Kiểm tra bản thảo`; A.refreshIcons(); A.toast(issues.length ? `Phát hiện ${issues.length} vấn đề (mô phỏng theo quy tắc).` : 'Không phát hiện vấn đề nào.', 'scan-search'); });
    tabs.addEventListener('click', e => { const t = e.target.closest('[data-tab]'); if (t) { tab = t.dataset.tab; render(); } });
    list.addEventListener('click', e => { const b = e.target.closest('[data-apply]'); if (!b) return; ms.value = replaceOne(ms.value, issues[+b.dataset.apply]); run(true); A.toast('Đã áp dụng gợi ý.', 'check'); });
    applyAll.addEventListener('click', () => { if (!checked) { A.toast('Hãy kiểm tra bản thảo trước.', 'alert-circle'); return; } let n = 0; issues.filter(i => i.fix).forEach(it => { const b = ms.value; ms.value = replaceOne(ms.value, it); if (b !== ms.value) n++; }); run(true); A.toast(n ? `Đã áp dụng ${n} gợi ý.` : 'Không còn gợi ý để áp dụng.', 'check-check'); });
    cp.addEventListener('click', async () => { try { await navigator.clipboard.writeText(ms.value); } catch (e) { ms.select(); document.execCommand('copy'); } A.toast('Đã sao chép nội dung.', 'copy'); });
    ms.addEventListener('input', () => { store.set({ manuscript: ms.value }); });
    render();
  }

  /* ================= STEP 4 — DESIGN ================= */
  const PALETTES = { navy: ['Midnight Navy', '--color-primary', '--color-blue'], blue: ['Electric Blue', '--color-blue', '--color-cyan'], cyan: ['Cyan', '--color-cyan', '--color-blue'], silver: ['Silver', '--color-silver', '--color-primary'] };
  A.makeBook = function (o) {
    const p = PALETTES[o.palette] || PALETTES.navy, title = A.esc(o.title || 'Tiêu đề sách'), author = A.esc(o.author || 'Tên tác giả');
    const art = A.u(o.art || 'assets/images/scene-brain.svg');
    return `<div class="bk bk-${o.layout || 1}" style="--bk-a:var(${p[1]});--bk-b:var(${p[2]})"><img class="bk-art" src="${art}" alt=""><div class="bk-genre">${A.esc(o.genre || 'Công nghệ')}</div><div class="bk-title">${title}</div><div class="bk-line"></div><div class="bk-author">${author}</div></div>`;
  };
  const ARTS = ['assets/images/scene-brain.svg', 'assets/images/scene-globe.svg', 'assets/images/scene-library.svg'];
  function design() {
    const f = { genre: $('#dGenre'), style: $('#dStyle'), layout: $('#dLayout'), title: $('#dTitle'), author: $('#dAuthor') };
    const opts = $('#coverOptions'), big = $('#bigPreview'), label = $('#selectedLabel'), sw = $('#swatches');
    const s = store.get(); let palette = s.palette || 'navy', sel = s.coverIdx != null ? s.coverIdx : 0;
    f.title.value = s.title || (s.topic ? s.topic.charAt(0).toUpperCase() + s.topic.slice(1) : 'Tương lai xuất bản thông minh'); f.author.value = s.author || 'Nguyễn Minh Anh';
    if (s.dGenre) f.genre.value = s.dGenre;
    sw.innerHTML = Object.entries(PALETTES).map(([k, v]) => `<button type="button" class="swatch ${k === palette ? 'selected' : ''}" data-p="${k}" style="background:linear-gradient(135deg,var(${v[1]}),var(${v[2]}))" aria-label="Bảng màu ${v[0]}" title="${v[0]}"></button>`).join('');
    const names = ['Mẫu bìa 1 — Mạng tri thức', 'Mẫu bìa 2 — Hành tinh dữ liệu', 'Mẫu bìa 3 — Thư viện số'];
    function data(i) { return { title: f.title.value, author: f.author.value, genre: f.genre.value, palette, layout: i + 1, art: ARTS[(i + (f.style.value === 'Tối giản' ? 1 : 0)) % 3] }; }
    function render() {
      opts.innerHTML = [0, 1, 2].map(i => `<button type="button" class="cover-opt ${i === sel ? 'selected' : ''}" data-i="${i}" aria-pressed="${i === sel}"><div class="cv-wrap">${A.makeBook(data(i))}</div>Mẫu ${i + 1}</button>`).join('');
      big.innerHTML = A.makeBook(data(sel)); label.textContent = 'Đã chọn: ' + names[sel];
      store.set({ title: f.title.value, author: f.author.value, palette, coverIdx: sel, dGenre: f.genre.value, coverData: data(sel) });
    }
    opts.addEventListener('click', e => { const b = e.target.closest('[data-i]'); if (!b) return; sel = +b.dataset.i; render(); A.toast('Đã chọn ' + names[sel].split(' — ')[0].toLowerCase() + '.', 'check'); });
    sw.addEventListener('click', e => { const b = e.target.closest('[data-p]'); if (!b) return; palette = b.dataset.p; $$('.swatch', sw).forEach(x => x.classList.toggle('selected', x === b)); render(); });
    Object.values(f).forEach(el => el.addEventListener('input', render));
    f.layout.addEventListener('change', () => { sel = +f.layout.value; render(); });
    $('#dGenerate').addEventListener('click', async e => { const b = e.currentTarget; b.disabled = true; b.innerHTML = `${A.icon('loader-circle', 'spin')}Đang tạo...`; A.refreshIcons(); opts.style.opacity = .3; await sleep(800); opts.style.opacity = 1; render(); b.disabled = false; b.innerHTML = `${A.icon('wand-sparkles')}Tạo phương án bìa`; A.refreshIcons(); A.toast('Đã tạo 3 phương án bìa (mô phỏng từ mẫu có sẵn).', 'sparkles'); });
    render();
  }

  /* ================= STEP 5 — PUBLISHING ================= */
  function publishing() {
    const s = store.get(), prev = $('#pubCover'), info = $('#pubInfo'), fmts = $('#formats'), checks = $('#pubChecks'), btn = $('#publishBtn'), detail = $('#pubDetail'), status = $('#pubStatus'), bar = $('#pubBar'), barWrap = $('#pubBarWrap');
    const cd = s.coverData || { title: s.title || 'Tương lai xuất bản thông minh', author: s.author || 'Nguyễn Minh Anh', genre: 'Công nghệ', palette: 'navy', layout: 1, art: ARTS[0] };
    prev.innerHTML = A.makeBook(cd);
    info.innerHTML = [['Tiêu đề', cd.title], ['Tác giả', cd.author], ['Thể loại', cd.genre], ['Chủ đề', s.topic || 'AI trong xuất bản'], ['Số từ', s.content ? s.content.trim().split(/\s+/).length + ' từ' : 'Chưa có nội dung']].map(([k, v]) => `<div class="spec"><div><small>${k}</small><b>${A.esc(v)}</b></div></div>`).join('');
    const FM = [['EPUB', 'book-open', 'Tương thích hầu hết ứng dụng đọc'], ['PDF', 'file-text', 'Giữ nguyên bố cục để in và chia sẻ'], ['Sách điện tử tương tác', 'sparkles', 'Hỗ trợ âm thanh, hoạt họa và ghi chú']];
    let fmt = s.format || 'EPUB';
    fmts.innerHTML = FM.map(([n, ic, d]) => `<button type="button" class="format-opt ${n === fmt ? 'selected' : ''}" data-f="${n}"><span class="fi">${A.icon(ic)}</span><span><b>${n}</b><small>${d}</small></span></button>`).join('');
    const items = [['Nội dung đã soạn', !!s.content], ['Bản thảo đã hiệu đính', !!s.manuscript], ['Bìa sách đã chọn', s.coverIdx != null], ['Định dạng đã chọn', true]];
    const drawChecks = () => { checks.innerHTML = items.map(([n, ok]) => `<li class="${ok ? 'ok' : ''}">${A.icon(ok ? 'check-circle-2' : 'circle-dashed')}${n}${ok ? '' : ' <span class="caption">(tùy chọn trong demo)</span>'}</li>`).join(''); A.refreshIcons(); };
    drawChecks();
    const done = items.filter(i => i[1]).length; $('#pubScore').textContent = Math.round(done / items.length * 100) + '%';
    fmts.addEventListener('click', e => { const b = e.target.closest('[data-f]'); if (!b) return; fmt = b.dataset.f; $$('.format-opt', fmts).forEach(x => x.classList.toggle('selected', x === b)); store.set({ format: fmt }); A.toast('Đã chọn định dạng ' + fmt + '.', 'check'); });
    let published = false;
    const demoLink = () => {
      const body = (s.content || 'Nội dung demo của ấn phẩm.').split('\n\n').map(p => `<p>${A.esc(p)}</p>`).join('');
      const html = `<!doctype html><meta charset="utf-8"><title>${A.esc(cd.title)} — bản demo</title><body style="font-family:system-ui;background:#101D36;color:#F3F6FA;max-width:680px;margin:3rem auto;padding:0 1.2rem;line-height:1.8"><p style="color:#47C9DF;letter-spacing:.14em;text-transform:uppercase;font-size:.8rem">AI &amp; Digital Publishing · ${A.esc(fmt)} (demo)</p><h1>${A.esc(cd.title)}</h1><p style="color:#9DAFC5">${A.esc(cd.author)}</p><hr style="border-color:#47C9DF55">${body}<p style="color:#9DAFC5;font-size:.85rem;margin-top:3rem">Đây là bản xem thử mô phỏng, không phải tệp ${A.esc(fmt)} thực.</p>`;
      return URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
    };
    btn.addEventListener('click', async () => {
      if (published) { window.open(demoLink(), '_blank'); return; }
      btn.disabled = true; barWrap.hidden = false;
      const phases = ['Kiểm tra cấu trúc nội dung...', 'Đóng gói bìa và phông chữ...', `Chuyển đổi sang ${fmt}...`, 'Kiểm tra chất lượng cuối...', 'Hoàn tất!'];
      for (let i = 0; i < phases.length; i++) { status.textContent = phases[i]; bar.style.width = ((i + 1) / phases.length * 100) + '%'; await sleep(650); }
      published = true; btn.disabled = false; btn.innerHTML = `${A.icon('external-link')}Mở bản demo`;
      barWrap.hidden = true; status.innerHTML = '';
      $('#pubDone').hidden = false; $('#pubFormatDone').textContent = `Ấn phẩm “${cd.title}” đã được đóng gói (mô phỏng) ở định dạng ${fmt}.`; store.set({ maxStep: 5, published: true });
      A.toast('Xuất bản mô phỏng hoàn tất!', 'party-popper'); A.refreshIcons();
    });
    detail.addEventListener('click', () => A.modal({ title: 'Chi tiết ấn phẩm', body: `<div class="grid grid-2" style="--gap:1.4rem;align-items:start"><div style="max-width:240px;aspect-ratio:3/4;border-radius:12px;overflow:hidden">${A.makeBook(cd)}</div><div class="stack" style="--stack:.6rem"><h3>${A.esc(cd.title)}</h3><p class="text-sub">${A.esc(cd.author)} · ${A.esc(cd.genre)}</p><p>Định dạng: <b>${A.esc(fmt)}</b></p><p>Trạng thái: <b>${published ? 'Đã xuất bản (demo)' : 'Chưa xuất bản'}</b></p><p class="text-sub small">Dữ liệu được lấy từ các bước trước trong workflow.</p></div></div>`, actions: [{ label: 'Đóng' }] }));
  }

  /* ---------- Boot ---------- */
  A.onReady = A.onReady || [];
  A.onReady.push(function () {
    const page = document.body.dataset.wf;
    initOverview();
    if (!page) return;
    const n = STEPS.findIndex(s => s.id === page) + 1;
    renderProgress(n); renderNav(n);
    ({ research, writing, editing, design, publishing })[page]();
    A.refreshIcons();
  });
})();
