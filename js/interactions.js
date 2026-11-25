/* ==========================================================
   interactions.js — bài viết, tài nguyên, timeline, trợ lý đọc,
   bộ lọc bài viết, trang chủ
   ========================================================== */
(function () {
  const A = window.ADP;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const param = k => new URLSearchParams(location.search).get(k);

  /* ---------- Home ---------- */
  function home() {
    const f = $('#homeFeatured'); if (!f) return;
    const [a, b, c] = ['ai-va-nganh-xuat-ban', 'xu-huong-xuat-ban-thong-minh', 'chatgpt-hanh-trinh-doc-sach'].map(id => A.articles.find(x => x.id === id));
    f.innerHTML = A.cardFeature(a) + `<div class="stack-col">${A.cardOverlay(b)}${A.cardOverlay(c)}</div>`;
    $('#homeTopics').innerHTML = Object.values(A.categories).map(A.cardTopic).join('');
    const wf = $('#homeWorkflow');
    wf.innerHTML = A.workflowSteps.map(s => `<a class="wf-card" href="${A.u(s.url)}"><span class="wf-num">${String(s.n).padStart(2, '0')}</span><span class="wf-icon">${A.icon(s.icon)}</span><div><h3>${s.name}</h3><p>${s.desc}</p></div></a>`).join('');
    const HUB = [
      ['Thư viện tri thức AI & Xuất bản', 'library', 'assets/images/scene-library.svg', 'Kho bài viết, nghiên cứu và bộ chỉ dẫn.', 'pages/knowledge-hub.html#resources'],
      ['E-book & Tài liệu số', 'book-text', 'assets/images/scene-tablet.svg', 'Sách điện tử và cẩm nang tải về.', 'pages/knowledge-hub.html?type=E-book#resources'],
      ['Công cụ hỗ trợ', 'wrench', 'assets/images/scene-laptop.svg', 'Mẫu biểu, checklist và công cụ demo.', 'pages/knowledge-hub.html?type=C%C3%B4ng%20c%E1%BB%A5#resources'],
      ['Báo cáo chuyên sâu', 'file-bar-chart', 'assets/images/scene-chart.svg', 'Số liệu và phân tích thị trường.', 'pages/knowledge-hub.html?type=B%C3%A1o%20c%C3%A1o#resources'],
      ['Cộng đồng độc giả', 'users', 'assets/images/scene-globe.svg', 'Nơi trao đổi, góp ý và chia sẻ.', 'pages/search.html?q=c%E1%BB%99ng%20%C4%91%E1%BB%93ng']
    ];
    $('#homeHub').innerHTML = HUB.map(h => `<article class="card hub-card"><div class="card-media"><img src="${A.u(h[2])}" alt="" loading="lazy"></div><div class="hub-body"><span class="hub-ico">${A.icon(h[1])}</span><h3 class="card-title">${h[0]}</h3><p>${h[3]}</p><span class="link-more">Khám phá ${A.icon('arrow-right')}</span></div><a class="card-link" href="${A.u(h[4])}" aria-label="${h[0]}"></a></article>`).join('');
  }

  /* ---------- Category pages: article lists ---------- */
  function lists() {
    $$('[data-articles]').forEach(el => {
      const [cat, n, mode] = el.dataset.articles.split(':');
      let list = A.articles.filter(a => cat === 'all' || a.cat === cat);
      if (el.dataset.skip) list = list.slice(+el.dataset.skip);
      list = list.slice(0, +n || 6);
      el.innerHTML = list.map(a => mode === 'h' ? A.cardArticle(a, { horizontal: true }) : A.cardArticle(a)).join('');
    });
    $$('[data-feature]').forEach(el => { const a = A.articles.find(x => x.id === el.dataset.feature); if (a) el.innerHTML = A.cardFeature(a); });
    $$('[data-resources]').forEach(el => { const n = +el.dataset.resources || 3, type = el.dataset.type; el.innerHTML = A.resources.filter(r => !type || type.split('|').includes(r.type)).slice(0, n).map(A.cardResource).join(''); });
    /* article filter chips (latest stories) */
    const fb = $('#articleFilter');
    if (fb) {
      const tags = [...new Set(A.articles.filter(a => a.cat === fb.dataset.cat).flatMap(a => a.tags))];
      const out = $('#latestList'); let active = 'Tất cả', page = 1; const PER = 3;
      const render = () => {
        const list = A.articles.filter(a => a.cat === fb.dataset.cat && (active === 'Tất cả' || a.tags.includes(active)));
        const pages = Math.max(1, Math.ceil(list.length / PER)); page = Math.min(page, pages);
        out.innerHTML = list.length ? list.slice((page - 1) * PER, page * PER).map(a => A.cardArticle(a)).join('') : `<div class="empty" style="grid-column:1/-1">${A.icon('file-search')}<h3>Chưa có bài viết</h3><p>Chưa có bài phù hợp với thẻ này.</p></div>`;
        $('#latestPag').innerHTML = A.pagination(page, pages); A.refreshIcons();
      };
      fb.innerHTML = ['Tất cả', ...tags].map(t => `<button class="chip ${t === 'Tất cả' ? 'active' : ''}" data-tag="${t}">${t}</button>`).join('');
      fb.addEventListener('click', e => { const c = e.target.closest('[data-tag]'); if (!c) return; active = c.dataset.tag; page = 1; $$('.chip', fb).forEach(x => x.classList.toggle('active', x === c)); render(); });
      $('#latestPag').addEventListener('click', e => { const b = e.target.closest('[data-page]'); if (b && !b.disabled) { page = +b.dataset.page; render(); } });
      render();
    }
  }

  function extras() {
    const tg = $('#toolGrid'); if (tg) tg.innerHTML = A.tools.map(t => `<article class="card tech-card"><span class="ti">${A.icon(t.icon)}</span><h3 style="font-size:1.05rem">${t.title}</h3><p>${t.desc}</p><span class="link-more">Mở công cụ ${A.icon('arrow-right')}</span><a class="card-link" href="${A.u(t.url)}" aria-label="${t.title}"></a></article>`).join('');
    const st = $('#insightStats'); if (st) st.innerHTML = A.statCard('newspaper', A.articles.filter(a => a.cat === 'insight').length, 'Bài viết trong chuyên mục') + A.statCard('cpu', '4', 'Công nghệ nền tảng được theo dõi') + A.statCard('file-bar-chart', A.resources.filter(r => r.type === 'Báo cáo').length, 'Báo cáo & nghiên cứu');
    const nl = $('#newestList'); if (nl) nl.innerHTML = [...A.resources].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4).map(x => `<article class="card res-row"><div class="res-cover">${A.coverHTML(x)}</div><div><div class="meta-row"><span class="badge badge-outline">${x.type}</span><span>${A.icon('calendar')}${A.fmtDate(x.date)}</span><span>${A.icon('file')}${x.format} · ${x.size}</span></div><h3 class="card-title" style="font-size:1.05rem;margin-block:.4rem .2rem">${x.title}</h3><p class="small text-sub">${x.desc}</p></div><div class="row" style="--gap:.5rem;position:relative;z-index:3"><button class="btn btn-secondary btn-sm" data-preview="${x.id}">${A.icon('eye')}Xem trước</button><button class="btn btn-primary btn-sm" data-download="${x.id}">${A.icon('download')}Tải xuống</button></div><a class="card-link" href="${A.u('pages/resource-detail.html?id=' + x.id)}" aria-label="${A.esc(x.title)}" style="z-index:1"></a></article>`).join('');
  }

  /* ---------- Article detail ---------- */
  const BODY = {
    h2a: 'Bức tranh tổng quan', h2b: 'Cơ hội dành cho nhà xuất bản', h2c: 'Thách thức cần nhìn thẳng', h2d: 'Quy trình đề xuất', h2e: 'Kết luận'
  };
  function article() {
    const root = $('#articleRoot'); if (!root) return;
    const a = A.articles.find(x => x.id === param('id')) || A.articles[0], cat = A.categories[a.cat];
    document.title = a.title + ' — AI & Digital Publishing';
    $('#bcCat').innerHTML = `<a href="${A.u(cat.url)}">${cat.name}</a>`; $('#bcTitle').textContent = a.title.length > 48 ? a.title.slice(0, 48) + '…' : a.title;
    $('#aBadge').textContent = cat.name; $('#aTitle').textContent = a.title; $('#aSapo').textContent = a.desc;
    $('#aAuthor').textContent = a.author; $('#aInit').textContent = a.author.split(' ').slice(-2).map(w => w[0]).join('');
    $('#aDate').textContent = A.fmtDate(a.date); $('#aRead').textContent = a.read + ' phút đọc';
    const img = $('#aCover'); img.src = A.u(a.img); img.alt = a.title;
    $('#aCaption').textContent = 'Hình minh họa: ' + a.title;
    $('#aTags').innerHTML = a.tags.map(t => `<a class="chip" href="${A.u('pages/search.html?q=' + encodeURIComponent(t))}">#${t}</a>`).join('');
    const t = a.title.charAt(0).toLowerCase() + a.title.slice(1);
    $('#proseBody').innerHTML = `
      <p class="lead">${a.desc} Bài viết này đặt vấn đề trong bối cảnh ngành xuất bản đang chuyển mình, và đề xuất một cách tiếp cận có thể áp dụng ngay cho các đơn vị vừa và nhỏ.</p>
      <h2 id="s1">${BODY.h2a}</h2>
      <p>Trong ba năm gần đây, các công cụ trí tuệ nhân tạo đã đi từ phòng thí nghiệm vào bàn làm việc của biên tập viên. Từ việc tóm tắt tài liệu, gợi ý tiêu đề cho tới kiểm tra nhất quán thuật ngữ, AI đang len vào từng khâu của chuỗi giá trị xuất bản.</p>
      <h3 id="s1a">Từ công cụ đơn lẻ đến quy trình</h3>
      <p>Điểm khác biệt không nằm ở một tính năng đột phá, mà ở việc các công cụ nhỏ được nối thành quy trình: nghiên cứu, viết, biên tập, thiết kế và phát hành. Đây chính là tinh thần của <a href="${A.u('pages/ai-experience.html#workflow')}">AI Content Workflow</a> mà nền tảng này giới thiệu.</p>
      <figure><img src="${A.u('assets/images/hero/hero-ai-panels.jpg')}" alt="Các bảng dữ liệu AI xoay quanh cuốn sách mở" loading="lazy"><figcaption>Quy trình xuất bản số kết nối nhiều lớp dữ liệu quanh nội dung cốt lõi.</figcaption></figure>
      <blockquote class="quote-block"><p>Công nghệ chỉ thật sự có giá trị khi nó giúp con người có thêm thời gian để làm những việc chỉ con người làm được: phán đoán, đồng cảm và chịu trách nhiệm.</p><cite>— Nhận định của một biên tập viên (nội dung minh họa)</cite></blockquote>
      <h2 id="s2">${BODY.h2b}</h2>
      <p>Cơ hội lớn nhất nằm ở việc giải phóng thời gian cho những khâu cần sáng tạo, đồng thời mở rộng khả năng tiếp cận độc giả bằng các định dạng mới.</p>
      <ul><li>Rút ngắn thời gian tra cứu và chuẩn bị tư liệu.</li><li>Phát hiện lỗi chính tả, nhất quán và bố cục sớm hơn.</li><li>Cá nhân hóa gợi ý đọc và tóm tắt cho từng nhóm độc giả.</li><li>Mở rộng sang sách nói, sách tương tác với chi phí hợp lý.</li></ul>
      <div class="callout">${A.icon('lightbulb')}<div><strong>Thông tin nổi bật</strong><p>Các đơn vị thí điểm theo cách “con người trong vòng lặp” thường đạt hiệu quả ổn định hơn so với tự động hóa toàn phần.</p></div></div>
      <h3 id="s2a">Hiệu quả ở từng khâu</h3>
      <div class="infographic"><h4>Mức độ hỗ trợ ước tính theo khâu (số liệu minh họa)</h4><div class="bars">
        ${[['Nghiên cứu', 78], ['Soạn thảo', 62], ['Hiệu đính', 71], ['Thiết kế bìa', 54], ['Phát hành', 66]].map(([n, v]) => `<div class="bar-row"><span>${n}</span><div class="bar-track"><i data-w="${v}"></i></div><b>${v}%</b></div>`).join('')}</div></div>
      <h2 id="s3">${BODY.h2c}</h2>
      <p>Bản quyền dữ liệu huấn luyện, độ tin cậy của nội dung sinh ra và quyền riêng tư của độc giả là ba nhóm rủi ro cần được đặt trong chính sách ngay từ đầu.</p>
      <h3 id="s3a">Bảng so sánh mức độ rủi ro</h3>
      <div class="table-wrap"><table><thead><tr><th>Nhóm rủi ro</th><th>Biểu hiện</th><th>Biện pháp</th></tr></thead><tbody>
        <tr><td>Bản quyền</td><td>Nguồn huấn luyện không rõ ràng</td><td>Điều khoản hợp đồng, công bố sử dụng</td></tr>
        <tr><td>Chính xác</td><td>“Ảo giác” trong nội dung sinh</td><td>Kiểm chứng ba lớp bởi biên tập viên</td></tr>
        <tr><td>Dữ liệu độc giả</td><td>Thu thập quá mức</td><td>Thu thập tối thiểu, cho phép từ chối</td></tr></tbody></table></div>
      <h4 id="s3b">Nguyên tắc ba lớp kiểm chứng</h4>
      <p>Mỗi nội dung có AI tham gia cần được kiểm tra nguồn, kiểm tra logic và kiểm tra văn phong trước khi xuất bản.</p>
      <h2 id="s4">${BODY.h2d}</h2>
      <p>Chúng tôi đề xuất bắt đầu từ một dự án nhỏ, ghi lại số liệu trước – sau và mở rộng dần. Bạn có thể thử từng bước ngay trong <a href="${A.u('pages/workflow/research.html')}">AI Research</a> hoặc <a href="${A.u('pages/workflow/writing.html')}">AI Writing</a>.</p>
      <h2 id="s5">${BODY.h2e}</h2>
      <p>${a.title.replace(/[:?]$/, '')} không phải câu chuyện của công nghệ đơn thuần. Đó là câu chuyện về cách người làm xuất bản giữ vững giá trị cốt lõi trong khi tận dụng công cụ mới.</p>
      <div class="refs"><h4 id="s6">Nguồn tham khảo</h4><ol>
        <li>Viện Nghiên cứu Xuất bản (2026). <i>Báo cáo thị trường sách số 2026</i> (tài liệu minh họa).</li>
        <li>Nhóm Biên tập ADP (2026). <i>Cẩm nang AI cho nhà xuất bản</i> (tài liệu minh họa).</li>
        <li>Đặng Khánh Linh (2026). <i>Đạo đức AI trong xuất bản</i> (tài liệu minh họa).</li></ol></div>`;

    /* TOC */
    const heads = $$('#proseBody h2, #proseBody h3, #proseBody h4[id]');
    const tocHTML = heads.map(h => `<li><a href="#${h.id}" class="${h.tagName === 'H2' ? '' : 'sub'}">${h.textContent}</a></li>`).join('');
    $('#tocList').innerHTML = tocHTML; $('#tocListM').innerHTML = tocHTML;
    const links = $$('#tocList a'), map = new Map(heads.map((h, i) => [h, links[i]]));
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { links.forEach(l => l.classList.remove('active')); map.get(en.target).classList.add('active'); } }), { rootMargin: '-20% 0px -70% 0px' });
    heads.forEach(h => io.observe(h));
    const prog = $('#tocProgress'), body = $('#proseBody');
    addEventListener('scroll', () => { const r = body.getBoundingClientRect(), p = Math.min(1, Math.max(0, (innerHeight * .3 - r.top) / r.height)); prog.style.width = (p * 100) + '%'; }, { passive: true });
    /* bars */
    const bio = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { $$('i[data-w]', en.target).forEach(i => i.style.width = i.dataset.w + '%'); bio.unobserve(en.target); } }));
    $$('.infographic').forEach(i => bio.observe(i));
    /* sidebar */
    $('#sideStats').innerHTML = A.statCard('clock', a.read + ' phút', 'Thời gian đọc ước tính') + A.statCard('trending-up', '78%', 'Mức hỗ trợ cao nhất ở khâu nghiên cứu') + A.statCard('users', '1,2K', 'Lượt đọc (số liệu minh họa)');
    const rel = A.articles.filter(x => x.id !== a.id && (x.cat === a.cat || x.tags.some(t => a.tags.includes(t)))).slice(0, 3);
    $('#sideRelated').innerHTML = rel.map(r => `<a href="${A.u('pages/article-detail.html?id=' + r.id)}">${A.icon('arrow-up-right')}<span>${r.title}</span></a>`).join('');
    const pool = A.articles.filter(x => x.id !== a.id);
    $('#relatedGrid').innerHTML = pool.filter(x => x.cat === a.cat).concat(pool.filter(x => x.cat !== a.cat)).slice(0, 3).map(r => A.cardArticle(r)).join('');
    const nx = A.articles[(A.articles.indexOf(a) + 1) % A.articles.length];
    $('#nextArticle').innerHTML = `<div class="nimg"><img src="${A.u(nx.img)}" alt=""></div><div><span class="caption text-cyan upper">Bài viết tiếp theo</span><h3 class="card-title" style="font-size:1.1rem;margin-top:.3rem">${nx.title}</h3></div><span class="btn btn-secondary btn-sm">Đọc tiếp ${A.icon('arrow-right')}</span><a class="card-link" href="${A.u('pages/article-detail.html?id=' + nx.id)}" aria-label="${nx.title}"></a>`;
    /* share + rating */
    $$('[data-share]').forEach(b => b.addEventListener('click', async () => {
      const k = b.dataset.share;
      if (k === 'copy') { try { await navigator.clipboard.writeText(location.href); } catch (e) {} A.toast('Đã sao chép liên kết bài viết.', 'link'); }
      else A.toast('Chia sẻ qua ' + k + ' là chức năng demo.', 'share-2');
    }));
    const stars = $$('#rating button'); let val = 0;
    try { val = +localStorage.getItem('rate-' + a.id) || 0; } catch (e) {}
    const paint = n => stars.forEach((s, i) => s.classList.toggle('on', i < n));
    paint(val);
    stars.forEach((s, i) => { s.addEventListener('mouseenter', () => paint(i + 1)); s.addEventListener('mouseleave', () => paint(val)); s.addEventListener('click', () => { val = i + 1; paint(val); try { localStorage.setItem('rate-' + a.id, val); } catch (e) {} $('#ratingMsg').textContent = 'Cảm ơn bạn đã đánh giá ' + val + '/5.'; A.toast('Đã ghi nhận đánh giá ' + val + '/5.', 'star'); }); });
  }

  /* ---------- Resource detail ---------- */
  function resource() {
    const root = $('#resourceRoot'); if (!root) return;
    const r = A.resources.find(x => x.id === param('id')) || A.resources[0];
    document.title = r.title + ' — Thư viện tri thức';
    $('#rBcTitle').textContent = r.title; $('#rTitle').textContent = r.title; $('#rDesc').textContent = r.desc; $('#rBadge').textContent = r.type;
    $('#rCover').innerHTML = A.coverHTML(r);
    const specs = [['user', 'Tác giả', r.author], ['tag', 'Chủ đề', r.topic], ['file', 'Định dạng', r.format], ['hard-drive', 'Dung lượng', r.size], ['book-open', 'Số trang', r.pages + ' trang'], ['calendar', 'Cập nhật', A.fmtDate(r.date)]];
    $('#rSpecs').innerHTML = specs.map(s => `<div class="spec">${A.icon(s[0])}<div><small>${s[1]}</small><b>${A.esc(s[2])}</b></div></div>`).join('');
    $('#rToc').innerHTML = r.chapters.map(c => `<li>${A.esc(c[0])}<span>tr. ${c[1]}</span></li>`).join('');
    $('#rMain').innerHTML = [`Nắm được bức tranh tổng quan về ${r.topic.toLowerCase()}.`, `Áp dụng được công cụ ${r.tool} vào nghiệp vụ ${r.work.toLowerCase()}.`, 'Có checklist và mẫu biểu để triển khai ngay.'].map(x => `<li class="side-list"><a>${A.icon('check-circle-2')}<span>${x}</span></a></li>`).join('');
    $('#rDl').addEventListener('click', () => A.downloadResource(r.id)); $('#rPv').addEventListener('click', () => A.previewResource(r.id));
    $('#rDl2').addEventListener('click', () => A.downloadResource(r.id));
    const sim = A.resources.filter(x => x.id !== r.id && (x.type === r.type || x.topic === r.topic)).slice(0, 3);
    $('#rSimilar').innerHTML = sim.map(x => `<a class="card res-row" href="${A.u('pages/resource-detail.html?id=' + x.id)}"><div class="res-cover">${A.coverHTML(x)}</div><div><span class="badge badge-outline">${x.type}</span><h4 class="card-title" style="margin-top:.4rem;font-size:.92rem;line-height:1.35">${x.title}</h4></div></a>`).join('');
    const rel = A.resources.filter(x => x.id !== r.id).slice(0, 3);
    $('#rRelated').innerHTML = rel.map(A.cardResource).join('');
  }

  /* ---------- Future: timeline + assistant ---------- */
  function timeline() {
    const track = $('#tlTrack'); if (!track) return;
    const D = [
      ['2025', 'Làn sóng thử nghiệm', 'Các nhà xuất bản đưa công cụ AI vào biên tập, tóm tắt và dịch hỗ trợ; xuất hiện những chính sách nội bộ đầu tiên.', 'flask-conical'],
      ['2026', 'Chuẩn hóa quy trình', 'Quy trình “con người trong vòng lặp” trở thành chuẩn; hợp đồng tác giả bổ sung điều khoản về AI.', 'workflow'],
      ['2027', 'Sách đa phương tiện', 'Sách điện tử kết hợp âm thanh, hoạt họa và dữ liệu tương tác phổ biến ở nhóm sách tri thức và thiếu nhi.', 'layers'],
      ['2028', 'Cá nhân hóa đại trà', 'Gợi ý đọc, tóm tắt và độ khó nội dung điều chỉnh theo từng độc giả trong khuôn khổ quyền riêng tư.', 'user-round-cog'],
      ['2029', 'Thư viện thông minh', 'Tìm kiếm ngữ nghĩa và trợ lý đọc có dẫn nguồn trở thành tiêu chuẩn của thư viện số.', 'library'],
      ['2030', 'Hệ sinh thái mở', 'Chuỗi xuất bản liên thông từ sáng tác, kiểm chứng, phát hành đến đo lường tác động.', 'globe']
    ];
    track.innerHTML = D.map((d, i) => `<div class="tl-node ${i === 0 ? 'active' : ''}"><button type="button" data-i="${i}" aria-pressed="${i === 0}"><span class="yr">${d[0]}</span><h4>${d[1]}</h4></button></div>`).join('');
    const det = $('#tlDetail'); const show = i => { det.innerHTML = `<div class="stat-icon" style="width:64px;height:64px">${A.icon(D[i][3])}</div><div><h3>${D[i][0]} — ${D[i][1]}</h3><p class="text-sub" style="margin-top:.4rem">${D[i][2]}</p></div>`; A.refreshIcons(); };
    let cur = 0; show(0);
    const set = i => { cur = i; $$('.tl-node', track).forEach((n, k) => { n.classList.toggle('active', k === i); n.querySelector('button').setAttribute('aria-pressed', k === i); }); show(i); };
    track.addEventListener('click', e => { const b = e.target.closest('[data-i]'); if (b) set(+b.dataset.i); });
    $('#tlPrev').addEventListener('click', () => set((cur + D.length - 1) % D.length)); $('#tlNext').addEventListener('click', () => set((cur + 1) % D.length));
  }
  function assistant() {
    const form = $('#assistForm'); if (!form) return;
    const log = $('#assistLog'), input = form.querySelector('input');
    const KB = [
      [['ban quyen', 'so huu'], 'Theo nguyên tắc hiện nay, nội dung hoàn toàn do máy tạo ra thường chưa được bảo hộ như tác phẩm của tác giả. Hợp đồng nên nêu rõ mức độ AI tham gia. (Câu trả lời mô phỏng.)', 'pages/ai-ethics.html#copyright'],
      [['ca nhan', 'goi y'], 'Cá nhân hóa trong xuất bản gồm gợi ý đọc, tóm tắt theo trình độ và điều chỉnh định dạng. Điều kiện tiên quyết là thu thập dữ liệu tối thiểu và minh bạch.', 'pages/article-detail.html?id=ca-nhan-hoa-trai-nghiem-doc'],
      [['rag', 'tra cuu'], 'RAG cho phép trợ lý truy xuất đoạn tài liệu liên quan trước khi trả lời, nhờ đó có dẫn nguồn và giảm “ảo giác”.', 'pages/article-detail.html?id=rag-cho-thu-vien-so'],
      [['sach noi', 'giong'], 'Giọng đọc tổng hợp đã dùng được cho sách tri thức, nhưng cần biên tập ngữ điệu và kiểm tra tên riêng.', 'pages/article-detail.html?id=audiobook-giong-noi-tong-hop'],
      [['bien tap', 'hieu dinh'], 'AI hỗ trợ phát hiện lỗi chính tả, nhất quán và đề xuất diễn đạt; quyết định cuối cùng vẫn thuộc về biên tập viên.', 'pages/workflow/editing.html']
    ];
    $$('[data-ask]').forEach(b => b.addEventListener('click', () => { input.value = b.dataset.ask; form.requestSubmit(); }));
    form.addEventListener('submit', async e => {
      e.preventDefault(); const q = input.value.trim(); if (!q) return; input.value = '';
      log.insertAdjacentHTML('beforeend', `<div class="result-item" style="margin-left:auto;max-width:85%;background:rgba(37,141,235,.25)">${A.esc(q)}</div>`);
      const hit = KB.find(k => k[0].some(w => A.norm(q).includes(w)));
      await new Promise(r => setTimeout(r, 500));
      log.insertAdjacentHTML('beforeend', `<div class="result-item" style="max-width:92%">${hit ? A.esc(hit[1]) + ` <a href="${A.u(hit[2])}">Đọc thêm →</a>` : 'Trợ lý demo chỉ trả lời một số chủ đề mẫu: bản quyền, cá nhân hóa, RAG, sách nói, biên tập. Bạn thử <a href="' + A.u('pages/search.html?q=' + encodeURIComponent(q)) + '">tìm kiếm toàn site</a>.'}</div>`);
      log.scrollTop = log.scrollHeight;
    });
  }

  /* ---------- Simulated tool lab (ai-experience) ---------- */
  function lab() {
    const body = $('#simBody'); if (!body) return;
    const btns = $$('[data-sim]'); let timer;
    const SIM = {
      outline: ['> tạo dàn ý "Sách tương tác cho thiếu nhi"', '✓ Chương 1: Ý tưởng và đối tượng', '✓ Chương 2: Cốt truyện phân nhánh', '✓ Chương 3: Minh họa và âm thanh', '✓ Chương 4: Thử nghiệm với độc giả', '→ Hoàn tất 4 chương (mô phỏng)'],
      summary: ['> tóm tắt báo cáo thị trường sách số 2026', '• Sách nói tăng trưởng nhanh nhất', '• Độc giả trẻ ưu tiên định dạng tương tác', '• Nhu cầu minh bạch nguồn gốc nội dung tăng', '→ Tóm tắt 3 ý chính (mô phỏng)'],
      check: ['> kiểm tra nhất quán thuật ngữ', '! "ebook" và "e-book" cùng xuất hiện', '! "A.I." nên thống nhất thành "AI"', '✓ Không phát hiện lỗi chính tả khác', '→ 2 gợi ý chỉnh sửa (mô phỏng)']
    };
    const run = k => { clearTimeout(timer); btns.forEach(b => b.classList.toggle('active', b.dataset.sim === k)); body.innerHTML = ''; const L = SIM[k]; let i = 0; const next = () => { if (i >= L.length) return; body.innerHTML += (i ? '\n' : '') + (L[i].startsWith('>') ? `<span class="cmd">${A.esc(L[i])}</span>` : A.esc(L[i])); i++; timer = setTimeout(next, 420); }; next(); };
    btns.forEach(b => b.addEventListener('click', () => run(b.dataset.sim))); run('outline');
  }

  A.onReady = A.onReady || [];
  A.onReady.push(home, lists, extras, article, resource, timeline, assistant, lab);
})();
