/* ==========================================================
   search.js — tìm kiếm toàn website + bộ lọc tài nguyên
   Chạy hoàn toàn bằng JavaScript trên dữ liệu mẫu (data.js)
   ========================================================== */
(function () {
  const A = window.ADP;
  const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');
  A.norm = norm;

  A.search = function (q, kind) {
    const idx = A.buildIndex();
    const tokens = norm(q).split(/\s+/).filter(Boolean);
    return idx.map(it => {
      if (kind && kind !== 'all' && it.kind !== kind) return null;
      if (!tokens.length) return { it, score: 1 };
      const t = norm(it.title), k = norm(it.keywords), d = norm(it.desc);
      let score = 0;
      for (const tok of tokens) {
        const s = (t.includes(tok) ? 5 : 0) + (k.includes(tok) ? 3 : 0) + (d.includes(tok) ? 1 : 0);
        if (!s) return null;          // mọi từ khóa đều phải khớp
        score += s;
      }
      return { it, score };
    }).filter(Boolean).sort((a, b) => b.score - a.score).map(x => x.it);
  };

  function highlight(text, q) {
    const toks = norm(q).split(/\s+/).filter(Boolean);
    if (!toks.length) return A.esc(text);
    const n = norm(text), hit = new Array(text.length).fill(false);
    toks.forEach(tok => { let i = -1; while ((i = n.indexOf(tok, i + 1)) !== -1) for (let j = i; j < i + tok.length; j++) hit[j] = true; });
    let out = '', open = false;
    for (let i = 0; i < text.length; i++) {
      if (hit[i] && !open) { out += '<mark>'; open = true; }
      if (!hit[i] && open) { out += '</mark>'; open = false; }
      out += A.esc(text[i]);
    }
    return out + (open ? '</mark>' : '');
  }

  const KIND = { article:'Bài viết', resource:'Tài nguyên', category:'Chuyên mục', tool:'Công cụ AI' };
  const KIND_ICON = { article:'newspaper', resource:'file-text', category:'folders', tool:'cpu' };

  /* ---------- Search page ---------- */
  function initSearchPage() {
    const root = document.getElementById('searchApp'); if (!root) return;
    const form = document.getElementById('bigSearch'), input = form.querySelector('input'), list = document.getElementById('resultList'),
          count = document.getElementById('resultCount'), tabs = document.getElementById('searchTabs'), pag = document.getElementById('searchPag'),
          sugg = document.getElementById('suggestions'), related = document.getElementById('relatedRes');
    const PER = 6; let kind = 'all', page = 1, q = new URLSearchParams(location.search).get('q') || '';
    input.value = q;

    sugg.innerHTML = '<span>Gợi ý:</span>' + A.suggestions.map(s => `<button class="chip" type="button" data-q="${s}">${s}</button>`).join('');
    related.innerHTML = A.resources.slice(0, 3).map(A.cardResource).join('');

    function render() {
      const res = A.search(q, kind);
      const all = A.search(q, 'all');
      tabs.querySelectorAll('.tab').forEach(t => {
        const k = t.dataset.kind, c = k === 'all' ? all.length : all.filter(x => x.kind === k).length;
        t.classList.toggle('active', k === kind); t.setAttribute('aria-selected', k === kind);
        t.querySelector('.count').textContent = c;
      });
      const pages = Math.max(1, Math.ceil(res.length / PER)); page = Math.min(page, pages);
      count.innerHTML = q ? `Tìm thấy <b>${res.length}</b> kết quả cho “<b>${A.esc(q)}</b>”` : `Hiển thị <b>${res.length}</b> nội dung trong kho tri thức`;
      if (!res.length) {
        list.innerHTML = `<div class="empty">${A.icon('search-x')}<h3>Không tìm thấy kết quả</h3><p>Không có nội dung nào khớp với “${A.esc(q)}”${kind !== 'all' ? ' trong nhóm đã chọn' : ''}. Hãy thử từ khóa ngắn hơn, bỏ bộ lọc hoặc chọn một gợi ý bên dưới.</p><div class="suggest">${A.suggestions.slice(0, 5).map(s => `<button class="chip" type="button" data-q="${s}">${s}</button>`).join('')}</div></div>`;
        pag.innerHTML = '';
      } else {
        list.innerHTML = res.slice((page - 1) * PER, page * PER).map(r => `
          <article class="card search-row"><div class="sr-img"><img src="${A.u(r.img)}" alt="" loading="lazy"></div>
          <div><div class="meta-row"><span class="badge badge-outline">${A.icon(KIND_ICON[r.kind])}${KIND[r.kind]}</span><span>${A.esc(r.label)}</span><span>${A.esc(r.meta)}</span></div>
          <h3 class="card-title">${highlight(r.title, q)}</h3><p>${highlight(r.desc, q)}</p></div>
          <a class="btn btn-secondary btn-sm" href="${A.u(r.url)}">Mở ${A.icon('arrow-right')}</a></article>`).join('');
        pag.innerHTML = A.pagination(page, pages);
      }
      A.refreshIcons();
    }
    form.addEventListener('submit', e => { e.preventDefault(); q = input.value.trim(); page = 1; history.replaceState(null, '', q ? '?q=' + encodeURIComponent(q) : location.pathname); render(); });
    input.addEventListener('input', () => { q = input.value.trim(); page = 1; render(); });
    tabs.addEventListener('click', e => { const t = e.target.closest('.tab'); if (t) { kind = t.dataset.kind; page = 1; render(); } });
    pag.addEventListener('click', e => { const b = e.target.closest('[data-page]'); if (b && !b.disabled) { page = +b.dataset.page; render(); document.getElementById('searchTop').scrollIntoView({ behavior: 'smooth' }); } });
    root.addEventListener('click', e => { const c = e.target.closest('[data-q]'); if (c) { input.value = q = c.dataset.q; page = 1; render(); } });
    render();
  }

  /* ---------- Knowledge Hub: filter + search + pagination ---------- */
  function initHub() {
    const root = document.getElementById('hubApp'); if (!root) return;
    const grid = document.getElementById('hubGrid'), count = document.getElementById('hubCount'), pag = document.getElementById('hubPag'),
          input = document.getElementById('hubSearch'), panel = document.getElementById('filterPanel'), sort = document.getElementById('hubSort');
    const PER = 6, groups = { topic: 'Chủ đề', work: 'Nghiệp vụ xuất bản', type: 'Loại tài liệu', tool: 'Công cụ AI' };
    const uniq = k => [...new Set(A.resources.map(r => r[k]))];
    const state = { topic: new Set(), work: new Set(), type: new Set(), tool: new Set(), q: '', page: 1 };
    const t = new URLSearchParams(location.search).get('type'); if (t) state.type.add(t);

    panel.querySelector('[data-groups]').innerHTML = Object.entries(groups).map(([k, label]) => `
      <div class="filter-group"><h4>${label}</h4>${uniq(k).map(v => `<label class="checkbox"><input type="checkbox" data-g="${k}" value="${A.esc(v)}" ${state[k].has(v) ? 'checked' : ''}><span>${A.esc(v)}</span></label>`).join('')}</div>`).join('');

    function filtered() {
      let list = A.resources.filter(r => Object.keys(groups).every(k => !state[k].size || state[k].has(r[k])));
      if (state.q) { const ids = new Set(A.search(state.q, 'resource').map(x => x.url.split('id=')[1])); list = list.filter(r => ids.has(r.id)); }
      if (sort.value === 'new') list = [...list].sort((a, b) => b.date.localeCompare(a.date));
      if (sort.value === 'az') list = [...list].sort((a, b) => a.title.localeCompare(b.title, 'vi'));
      return list;
    }
    function render() {
      const list = filtered(), pages = Math.max(1, Math.ceil(list.length / PER)); state.page = Math.min(state.page, pages);
      count.innerHTML = `Hiển thị <b>${list.length}</b> / ${A.resources.length} tài nguyên`;
      if (!list.length) { grid.innerHTML = `<div class="empty" style="grid-column:1/-1">${A.icon('folder-search')}<h3>Chưa có tài nguyên phù hợp</h3><p>Không có tài liệu nào khớp với bộ lọc hiện tại. Hãy nới lỏng điều kiện hoặc đặt lại bộ lọc.</p><button class="btn btn-primary" data-reset>${A.icon('rotate-ccw')}Đặt lại bộ lọc</button></div>`; pag.innerHTML = ''; }
      else { grid.innerHTML = list.slice((state.page - 1) * PER, state.page * PER).map(A.cardResource).join(''); pag.innerHTML = A.pagination(state.page, pages); }
      const n = Object.keys(groups).reduce((s, k) => s + state[k].size, 0);
      document.getElementById('filterBadge').textContent = n ? n : '';
      A.refreshIcons();
    }
    panel.addEventListener('change', e => { const c = e.target.closest('input[data-g]'); if (!c) return; c.checked ? state[c.dataset.g].add(c.value) : state[c.dataset.g].delete(c.value); state.page = 1; render(); });
    input.addEventListener('input', () => { state.q = input.value.trim(); state.page = 1; render(); });
    sort.addEventListener('change', render);
    pag.addEventListener('click', e => { const b = e.target.closest('[data-page]'); if (b && !b.disabled) { state.page = +b.dataset.page; render(); root.scrollIntoView({ behavior: 'smooth' }); } });
    const reset = () => { Object.keys(groups).forEach(k => state[k].clear()); panel.querySelectorAll('input').forEach(i => i.checked = false); input.value = ''; state.q = ''; state.page = 1; render(); };
    document.addEventListener('click', e => { if (e.target.closest('[data-reset]')) reset(); });
    document.getElementById('filterToggle').addEventListener('click', () => panel.classList.toggle('open'));
    render();
  }

  A.onReady = A.onReady || [];
  A.onReady.push(initSearchPage, initHub);
})();
