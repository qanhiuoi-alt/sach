/* ==========================================================
   main.js — Core: shared header/footer, component renderers,
   toast, modal, reveal, back-to-top
   ========================================================== */
(function () {
  const ROOT = document.body.dataset.root || '';
  const A = window.ADP;
  const u = p => ROOT + p;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  const fmtDate = d => new Date(d).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric' });
  const icon = (n, cls = '') => `<i data-lucide="${n}" class="${cls}" aria-hidden="true"></i>`;
  A.u = u; A.esc = esc; A.icon = icon; A.fmtDate = fmtDate;

  /* ---------- Logo ---------- */
  const LOGO = `<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#47C9DF"/><stop offset="1" stop-color="#258DEB"/></linearGradient></defs>
    <path d="M24 14c-4-3-10-4-17-3v24c7-1 13 0 17 3 4-3 10-4 17-3V11c-7-1-13 0-17 3Z" stroke="#F3F6FA" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M24 14v24" stroke="url(#lg)" stroke-width="2.2"/>
    <circle cx="33" cy="19" r="2" fill="#47C9DF"/><circle cx="29" cy="26" r="2" fill="#258DEB"/><circle cx="35" cy="30" r="2" fill="#47C9DF"/>
    <path d="M33 19l-4 7 6 4" stroke="#47C9DF" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M10 18h8M10 23h8M10 28h6" stroke="#9DAFC5" stroke-width="1.6" stroke-linecap="round"/></svg>`;
  A.LOGO = LOGO;

  /* ---------- Navigation model ---------- */
  const NAV = [
    { key:'insight', label:'Góc nhìn AI', url:'pages/ai-insight.html', items:[
      ['Tổng quan chuyên mục','Bài viết nổi bật và nghiên cứu mới','layout-grid','pages/ai-insight.html'],
      ['Generative AI','Sinh nội dung và tác động tới biên tập','sparkles','pages/ai-insight.html#tech-spotlight'],
      ['RAG & AI Agent','Công nghệ tra cứu có dẫn nguồn','network','pages/ai-insight.html#tech-spotlight'],
      ['Góc nhìn chuyên gia','Nhận định về ngành xuất bản','message-square-quote','pages/ai-insight.html#perspective'] ] },
    { key:'experience', label:'Trải nghiệm cùng AI', url:'pages/ai-experience.html', items:[
      ['AI Content Workflow','Quy trình 5 bước từ ý tưởng đến xuất bản','workflow','pages/ai-experience.html#workflow'],
      ['AI Research','Phân tích chủ đề, gợi ý nghiên cứu','search','pages/workflow/research.html'],
      ['AI Writing','Soạn thảo nội dung mẫu','pen-line','pages/workflow/writing.html'],
      ['AI Editing','Hiệu đính bản thảo','spell-check','pages/workflow/editing.html'],
      ['AI Design & Publishing','Bìa sách và đóng gói xuất bản','palette','pages/workflow/design.html'] ] },
    { key:'ethics', label:'Đạo đức & Trách nhiệm', url:'pages/ai-ethics.html', items:[
      ['AI & Bản quyền','Ai sở hữu nội dung AI tạo ra?','copyright','pages/ai-ethics.html#copyright'],
      ['Toàn vẹn thông tin','Kiểm chứng và minh bạch','shield-check','pages/ai-ethics.html#integrity'],
      ['Quyền riêng tư dữ liệu','Bảo vệ dữ liệu độc giả','lock','pages/ai-ethics.html#privacy'],
      ['Trách nhiệm biên tập viên','Con người trong vòng lặp','user-check','pages/ai-ethics.html#editor'] ] },
    { key:'future', label:'Tương lai xuất bản', url:'pages/future-publishing.html', items:[
      ['Xu hướng thay đổi','Những chuyển dịch của ngành','trending-up','pages/future-publishing.html#changes'],
      ['Timeline 2025–2030','Lộ trình tương tác','milestone','pages/future-publishing.html#timeline'],
      ['Sách thông minh','Sách đa phương tiện, cá nhân hóa','book-open-check','pages/future-publishing.html#smart-books'],
      ['AI Reading Assistant','Trợ lý đọc thử nghiệm','bot','pages/future-publishing.html#assistant'] ] },
    { key:'hub', label:'Thư viện tri thức', url:'pages/knowledge-hub.html', items:[
      ['Tất cả tài nguyên','Tìm kiếm và lọc kho tri thức','library','pages/knowledge-hub.html#resources'],
      ['E-book & Tài liệu số','Sách điện tử và cẩm nang','book-text','pages/knowledge-hub.html?type=E-book#resources'],
      ['Báo cáo chuyên sâu','Nghiên cứu và số liệu thị trường','file-bar-chart','pages/knowledge-hub.html?type=B%C3%A1o%20c%C3%A1o#resources'],
      ['Hướng dẫn & Case study','Thực hành và bài học','graduation-cap','pages/knowledge-hub.html?type=H%C6%B0%E1%BB%9Bng%20d%E1%BA%ABn#resources'] ] }
  ];
  A.NAV = NAV;

  function currentKey() {
    const p = location.pathname;
    if (/workflow\//.test(p) || /ai-experience/.test(p)) return 'experience';
    if (/ai-insight/.test(p)) return 'insight';
    if (/ai-ethics/.test(p)) return 'ethics';
    if (/future-publishing/.test(p)) return 'future';
    if (/knowledge-hub|resource-detail/.test(p)) return 'hub';
    if (/article-detail/.test(p)) { const a = A.articles.find(x => x.id === new URLSearchParams(location.search).get('id')); return a ? a.cat : ''; }
    return '';
  }

  function renderHeader() {
    const key = currentKey();
    const desktop = NAV.map(n => `
      <div class="nav-item" data-dd>
        <a href="${u(n.url)}" class="nav-link ${key === n.key ? 'active' : ''}" aria-haspopup="true" aria-expanded="false">${n.label}${icon('chevron-down')}</a>
        <div class="dropdown" role="menu">
          ${n.items.map(i => `<a href="${u(i[3])}" role="menuitem"><span class="dd-icon">${icon(i[2])}</span><span><span class="dd-title">${i[0]}</span><span class="dd-desc">${i[1]}</span></span></a>`).join('')}
        </div>
      </div>`).join('');
    const mobile = NAV.map(n => `
      <div class="acc-item">
        <button class="acc-btn" aria-expanded="false">${n.label}${icon('chevron-down')}</button>
        <div class="acc-panel"><div>${n.items.map(i => `<a href="${u(i[3])}">${icon(i[2])}${i[0]}</a>`).join('')}</div></div>
      </div>`).join('');

    const header = `
    <header class="site-header" id="siteHeader">
      <div class="header-inner">
        <a class="logo" href="${u('index.html')}" aria-label="AI & Digital Publishing — Trang chủ">${LOGO}<span class="logo-text">AI &amp; Digital<br>Publishing<small>Reimagine the way we publish</small></span></a>
        <nav class="main-nav" aria-label="Điều hướng chính">${desktop}</nav>
        <div class="header-actions">
          <form class="search-box" role="search" id="headerSearch" action="${u('pages/search.html')}" method="get">
            ${icon('search')}<input type="search" name="q" placeholder="Tìm kiếm..." aria-label="Tìm kiếm"></form>
          <a class="btn btn-primary btn-sm" href="${u('pages/ai-experience.html')}">${icon('compass')}Khám phá</a>
          <a class="btn-icon search-toggle" href="${u('pages/search.html')}" aria-label="Tìm kiếm">${icon('search')}</a>
          <button class="btn-icon menu-toggle" id="menuToggle" aria-label="Mở menu" aria-controls="drawer" aria-expanded="false">${icon('menu')}</button>
        </div>
      </div>
    </header>
    <div class="drawer-backdrop" id="drawerBackdrop"></div>
    <aside class="drawer" id="drawer" aria-label="Menu di động">
      <div class="drawer-head"><a class="logo" href="${u('index.html')}">${LOGO}<span class="logo-text">AI &amp; Digital<br>Publishing</span></a><button class="btn-icon" id="drawerClose" aria-label="Đóng menu">${icon('x')}</button></div>
      <form class="drawer-search" action="${u('pages/search.html')}" method="get"><div class="search-box">${icon('search')}<input type="search" name="q" placeholder="Tìm kiếm bài viết, tài nguyên..." aria-label="Tìm kiếm"></div></form>
      <nav class="drawer-nav">${mobile}</nav>
      <div class="drawer-cta"><a class="btn btn-primary btn-block" href="${u('pages/ai-experience.html')}">${icon('compass')}Khám phá</a></div>
    </aside>`;
    const mount = document.getElementById('site-header');
    if (mount) mount.outerHTML = header;
  }

  function renderFooter() {
    const links = Object.values(A.categories).map(c => `<li><a href="${u(c.url)}">${c.name}</a></li>`).join('');
    const html = `
    <footer class="site-footer">
      <div class="container footer-grid">
        <div class="footer-about">
          <a class="logo" href="${u('index.html')}">${LOGO}<span class="logo-text">AI &amp; Digital<br>Publishing</span></a>
          <p>Nền tảng truyền thông, tri thức và trải nghiệm tương tác về ứng dụng trí tuệ nhân tạo trong ngành xuất bản điện tử.</p>
          <strong class="text-cyan upper small">Reimagine the way we publish.</strong>
        </div>
        <div><h4>Chuyên mục</h4><ul>${links}</ul></div>
        <div><h4>Khám phá</h4><ul>
          <li><a href="${u('pages/ai-experience.html#workflow')}">AI Content Workflow</a></li>
          <li><a href="${u('pages/search.html')}">Tìm kiếm tri thức</a></li>
          <li><a href="${u('pages/knowledge-hub.html#resources')}">Tài nguyên mới</a></li>
          <li><a href="${u('pages/article-detail.html')}">Bài viết nổi bật</a></li></ul></div>
        <div><h4>Liên hệ</h4>
          <div class="stack" style="--stack:.7rem">
            <div class="contact-line">${icon('mail')}<a href="mailto:lienhe@aidigitalpublishing.demo">lienhe@aidigitalpublishing.demo</a></div>
            <div class="contact-line">${icon('map-pin')}Hà Nội, Việt Nam</div>
            <div class="socials" style="margin-top:1rem">
              <a href="#" data-toast="Liên kết mạng xã hội là bản demo." aria-label="Facebook">${icon("share-2")}</a>
              <a href="#" data-toast="Liên kết mạng xã hội là bản demo." aria-label="LinkedIn">${icon("briefcase")}</a>
              <a href="#" data-toast="Liên kết mạng xã hội là bản demo." aria-label="YouTube">${icon("circle-play")}</a>
              <a href="#" data-toast="Liên kết mạng xã hội là bản demo." aria-label="Email">${icon('send')}</a>
            </div></div></div>
      </div>
      <div class="footer-bottom">© 2026 AI &amp; Digital Publishing. Dự án demo — nội dung và dữ liệu chỉ mang tính minh họa.</div>
    </footer>
    <div class="toast-stack" id="toastStack" aria-live="polite"></div>
    <button class="to-top" id="toTop" aria-label="Lên đầu trang">${icon('arrow-up')}</button>`;
    const mount = document.getElementById('site-footer');
    if (mount) mount.outerHTML = html;
  }

  /* ---------- Card renderers ---------- */
  A.cardArticle = (a, opt = {}) => {
    const c = A.categories[a.cat], href = u('pages/article-detail.html?id=' + a.id);
    if (opt.horizontal) return `<article class="card article-card article-h"><div class="card-media"><img src="${u(a.img)}" alt="${esc(a.title)}" loading="lazy"></div><div class="card-body"><span class="badge card-badge">${c.name}</span><h4 class="card-title">${a.title}</h4><div class="meta-row"><span>${icon('clock')}${a.read} phút đọc</span></div></div><a class="card-link" href="${href}" aria-label="${esc(a.title)}"></a></article>`;
    return `<article class="card article-card"><div class="card-media"><img src="${u(a.img)}" alt="${esc(a.title)}" loading="lazy"><span class="badge card-badge">${c.name}</span></div><div class="card-body"><h3 class="card-title">${a.title}</h3><p>${a.desc}</p><div class="meta-row"><span>${icon('clock')}${a.read} phút đọc</span><span>${icon('calendar')}${fmtDate(a.date)}</span></div></div><a class="card-link" href="${href}" aria-label="${esc(a.title)}"></a></article>`;
  };
  A.cardFeature = a => {
    const c = A.categories[a.cat], href = u('pages/article-detail.html?id=' + a.id);
    return `<article class="card feature-card"><div class="card-media"><img src="${u(a.img)}" alt="${esc(a.title)}"></div><span class="badge card-badge">${c.name}</span><div class="card-body"><h3 class="card-title" style="font-size:clamp(1.4rem,1rem + 1.4vw,2.1rem)">${a.title}</h3><p class="text-sub">${a.desc}</p><div class="meta-row"><span>${icon('clock')}${a.read} phút đọc</span><span>${icon('user')}${a.author}</span></div><span class="link-more" style="margin-top:.3rem">Xem bài viết ${icon('arrow-right')}</span></div><a class="card-link" href="${href}" aria-label="${esc(a.title)}"></a></article>`;
  };
  A.cardOverlay = a => {
    const c = A.categories[a.cat], href = u('pages/article-detail.html?id=' + a.id);
    return `<article class="card overlay-card"><div class="card-media"><img src="${u(a.img)}" alt="${esc(a.title)}" loading="lazy"></div><div class="card-body"><span class="badge card-badge">${c.name}</span><h3 class="card-title" style="font-size:1.1rem">${a.title}</h3><div class="meta-row"><span>${icon('clock')}${a.read} phút đọc</span><span class="link-more">Xem bài viết ${icon('arrow-right')}</span></div></div><a class="card-link" href="${href}" aria-label="${esc(a.title)}"></a></article>`;
  };
  A.coverHTML = r => {
    const words = r.title.split(' '), mid = Math.ceil(words.length / 2);
    return `<div class="cover"><img class="cover-art" src="${u(r.art)}" alt=""><span class="cv-kicker">${esc(r.type)}</span><div><div class="cv-title">${esc(words.slice(0, mid).join(' '))} <em>${esc(words.slice(mid).join(' '))}</em></div><div class="cv-line"></div></div><span class="cv-sub">AI &amp; Digital Publishing</span></div>`;
  };
  A.cardResource = r => {
    const href = u('pages/resource-detail.html?id=' + r.id);
    return `<article class="card resource-card" data-id="${r.id}"><div class="res-cover">${A.coverHTML(r)}<span class="badge badge-outline">${r.type}</span></div><div class="stack" style="--stack:.5rem"><h3 class="card-title">${r.title}</h3><p>${r.desc}</p><div class="meta-row"><span>${icon('file')}${r.format}</span><span>${icon('hard-drive')}${r.size}</span><span>${icon('book-open')}${r.pages} trang</span></div></div><div class="res-actions"><button class="btn btn-secondary btn-sm" data-preview="${r.id}">${icon('eye')}Xem trước</button><button class="btn btn-primary btn-sm" data-download="${r.id}">${icon('download')}Tải xuống</button></div><a class="card-link" href="${href}" aria-label="${esc(r.title)}" style="z-index:1"></a></article>`;
  };
  A.cardTopic = c => `<article class="card topic-card"><div class="card-media"><img src="${u(c.img)}" alt="${esc(c.name)}" loading="lazy"></div><div class="card-body"><div><h3>${c.code}</h3><p>${c.name}</p></div><span class="btn-icon" aria-hidden="true">${icon('arrow-right')}</span></div><a class="card-link" href="${u(c.url)}" aria-label="${esc(c.name)}"></a></article>`;
  A.statCard = (ic, num, label) => `<div class="stat-card"><div class="stat-icon">${icon(ic)}</div><div><div class="stat-num">${num}</div><div class="stat-label">${label}</div></div></div>`;
  A.pagination = (page, pages) => {
    if (pages <= 1) return '';
    let h = `<button class="page-btn" data-page="${page - 1}" ${page === 1 ? 'disabled' : ''} aria-label="Trang trước">${icon('chevron-left')}</button>`;
    for (let i = 1; i <= pages; i++) h += `<button class="page-btn ${i === page ? 'active' : ''}" data-page="${i}" ${i === page ? 'aria-current="page"' : ''}>${i}</button>`;
    return h + `<button class="page-btn" data-page="${page + 1}" ${page === pages ? 'disabled' : ''} aria-label="Trang sau">${icon('chevron-right')}</button>`;
  };

  /* ---------- Icons refresh ---------- */
  A.refreshIcons = () => { if (window.lucide) window.lucide.createIcons(); };

  /* ---------- Toast ---------- */
  A.toast = (msg, ic = 'check-circle-2') => {
    const stack = document.getElementById('toastStack'); if (!stack) return;
    const t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status');
    t.innerHTML = `${icon(ic)}<span>${esc(msg)}</span>`; stack.appendChild(t); A.refreshIcons();
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 320); }, 3600);
  };

  /* ---------- Modal ---------- */
  A.modal = ({ title, body, actions = [] }) => {
    let m = document.getElementById('adpModal');
    if (!m) { m = document.createElement('div'); m.id = 'adpModal'; m.className = 'modal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); document.body.appendChild(m); }
    m.innerHTML = `<div class="modal-dialog"><div class="modal-head"><h3>${title}</h3><button class="btn-icon" data-close aria-label="Đóng">${icon('x')}</button></div><div class="modal-body">${body}</div><div class="modal-foot">${actions.map((a, i) => `<button class="btn ${a.cls || 'btn-secondary'}" data-act="${i}">${a.icon ? icon(a.icon) : ''}${a.label}</button>`).join('')}</div></div>`;
    A.refreshIcons();
    requestAnimationFrame(() => m.classList.add('open'));
    const close = () => { m.classList.remove('open'); document.removeEventListener('keydown', esc_); };
    const esc_ = e => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', esc_);
    m.onclick = e => {
      if (e.target === m || e.target.closest('[data-close]')) return close();
      const b = e.target.closest('[data-act]'); if (b) { const a = actions[+b.dataset.act]; if (a.onClick) a.onClick(); if (a.close !== false) close(); }
    };
    return { close };
  };

  /* ---------- Resource preview / download (demo) ---------- */
  A.previewResource = id => {
    const r = A.resources.find(x => x.id === id); if (!r) return;
    A.modal({ title: 'Xem trước: ' + esc(r.title), body: `<div class="preview-page"><h4>${esc(r.chapters[0][0])}</h4><p>${esc(r.desc)}</p><p>Đây là trang xem trước mô phỏng. Bản đầy đủ gồm ${r.pages} trang, định dạng ${r.format}, dung lượng ${r.size}. Nội dung chi tiết sẽ được cung cấp khi tài liệu được phát hành chính thức.</p><p>Các chương chính: ${r.chapters.map(c => esc(c[0])).join('; ')}.</p></div>`, actions: [{ label: 'Đóng', cls: 'btn-secondary' }, { label: 'Tải tài liệu demo', cls: 'btn-primary', icon: 'download', onClick: () => A.downloadResource(id) }] });
  };
  A.downloadResource = id => {
    const r = A.resources.find(x => x.id === id); if (!r) return;
    const txt = `${r.title}\n${'='.repeat(r.title.length)}\n\nLoại: ${r.type}\nĐịnh dạng: ${r.format}\nTác giả: ${r.author}\n\n${r.desc}\n\nMục lục:\n${r.chapters.map((c, i) => `${i + 1}. ${c[0]} (tr. ${c[1]})`).join('\n')}\n\n— Đây là tệp demo của AI & Digital Publishing. Tài liệu đầy đủ chưa được phát hành.\n`;
    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' }), a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = r.id + '-demo.txt'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(a.href);
    A.toast('Đã tải tệp demo: ' + r.id + '-demo.txt', 'download');
  };

  /* ---------- Global delegated events ---------- */
  document.addEventListener('click', e => {
    const pv = e.target.closest('[data-preview]'); if (pv) { e.preventDefault(); A.previewResource(pv.dataset.preview); return; }
    const dl = e.target.closest('[data-download]'); if (dl) { e.preventDefault(); A.downloadResource(dl.dataset.download); return; }
    const t = e.target.closest('[data-toast]'); if (t) { e.preventDefault(); A.toast(t.dataset.toast, 'info'); }
  });

  /* ---------- Reveal, scroll, to-top ---------- */
  function initReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: .08, rootMargin: '0px 0px -40px 0px' });
    els.forEach(e => io.observe(e));
  }
  A.reveal = initReveal;

  function initScroll() {
    const h = document.getElementById('siteHeader'), tt = document.getElementById('toTop');
    const on = () => { const y = window.scrollY; if (h) h.classList.toggle('scrolled', y > 10); if (tt) tt.classList.toggle('show', y > 600); };
    window.addEventListener('scroll', on, { passive: true }); on();
    if (tt) tt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  A.boot = function () {
    renderHeader(); renderFooter();
    if (A.onReady) A.onReady.forEach(fn => fn());
    A.refreshIcons(); initScroll(); initReveal();
    if (A.initNav) A.initNav();
  };
  document.addEventListener('DOMContentLoaded', A.boot);
})();
