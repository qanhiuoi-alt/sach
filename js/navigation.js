/* ==========================================================
   navigation.js — dropdown, mobile drawer, accordion, scroll-spy
   ========================================================== */
(function () {
  const A = window.ADP;
  A.initNav = function () {
    /* Desktop dropdown: hover (pointer) + click/keyboard */
    const items = document.querySelectorAll('[data-dd]');
    const closeAll = except => items.forEach(i => { if (i !== except) { i.classList.remove('open'); i.querySelector('.nav-link').setAttribute('aria-expanded', 'false'); } });
    items.forEach(item => {
      const link = item.querySelector('.nav-link'); let t;
      const open = () => { clearTimeout(t); closeAll(item); item.classList.add('open'); link.setAttribute('aria-expanded', 'true'); };
      const close = () => { t = setTimeout(() => { item.classList.remove('open'); link.setAttribute('aria-expanded', 'false'); }, 140); };
      item.addEventListener('mouseenter', open); item.addEventListener('mouseleave', close);
      item.addEventListener('focusin', open);
      item.addEventListener('focusout', e => { if (!item.contains(e.relatedTarget)) close(); });
      link.addEventListener('keydown', e => { if (e.key === 'ArrowDown') { e.preventDefault(); open(); const f = item.querySelector('.dropdown a'); if (f) f.focus(); } });
      item.addEventListener('keydown', e => { if (e.key === 'Escape') { item.classList.remove('open'); link.focus(); } });
    });
    document.addEventListener('click', e => { if (!e.target.closest('[data-dd]')) closeAll(); });

    /* Mobile drawer */
    const toggle = document.getElementById('menuToggle'), closeBtn = document.getElementById('drawerClose'), back = document.getElementById('drawerBackdrop');
    const setDrawer = open => { document.body.classList.toggle('drawer-open', open); if (toggle) toggle.setAttribute('aria-expanded', open); };
    if (toggle) toggle.addEventListener('click', () => setDrawer(true));
    if (closeBtn) closeBtn.addEventListener('click', () => setDrawer(false));
    if (back) back.addEventListener('click', () => setDrawer(false));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setDrawer(false); });
    document.querySelectorAll('.acc-btn').forEach(b => b.addEventListener('click', () => {
      const it = b.closest('.acc-item'), open = !it.classList.contains('open');
      document.querySelectorAll('.acc-item.open').forEach(o => { o.classList.remove('open'); o.querySelector('.acc-btn').setAttribute('aria-expanded', 'false'); });
      it.classList.toggle('open', open); b.setAttribute('aria-expanded', open);
    }));
    document.querySelectorAll('.drawer a').forEach(a => a.addEventListener('click', () => setDrawer(false)));
    window.addEventListener('resize', () => { if (innerWidth > 1100) setDrawer(false); });

    /* Smooth anchors + scroll-spy for in-page sub navigation */
    const spyLinks = [...document.querySelectorAll('[data-spy] a[href^="#"]')];
    if (spyLinks.length && 'IntersectionObserver' in window) {
      const map = new Map(spyLinks.map(a => [a.getAttribute('href').slice(1), a]));
      const secs = [...map.keys()].map(id => document.getElementById(id)).filter(Boolean);
      const io = new IntersectionObserver(es => es.forEach(en => {
        if (en.isIntersecting) { spyLinks.forEach(l => l.classList.remove('active')); map.get(en.target.id).classList.add('active'); }
      }), { rootMargin: '-30% 0px -60% 0px' });
      secs.forEach(s => io.observe(s));
    }
  };
})();
