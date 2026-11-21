/* JS común: menú, animaciones de entrada, contadores y badge del carrito */
(function () {
  document.documentElement.classList.add('js');

  // Menú móvil
  const burger = document.querySelector('.burger');
  const menu = document.getElementById('menu');
  if (burger && menu) {
    burger.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    });
    menu.addEventListener('click', (e) => {
      if (e.target.closest('a')) { menu.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }
    });
  }

  // Año del pie
  document.querySelectorAll('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));

  // Reveal al hacer scroll
  const items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    items.forEach((el) => io.observe(el));
  } else items.forEach((el) => el.classList.add('in'));

  // Contadores
  const count = (el) => {
    const end = +el.dataset.count, dur = 1200, t0 = performance.now();
    const fmt = (n) => n.toLocaleString('es-ES');
    const step = (t) => {
      const p = Math.min((t - t0) / dur, 1);
      el.textContent = fmt(Math.round(end * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const io2 = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { count(e.target); io2.unobserve(e.target); } }), { threshold: 0.6 });
    counters.forEach((c) => io2.observe(c));
  } else counters.forEach((c) => (c.textContent = (+c.dataset.count).toLocaleString('es-ES')));

  // Badge del carrito (en todas las páginas)
  window.updateCartBadge = function () {
    let n = 0;
    try { n = (JSON.parse(localStorage.getItem('ortega_cart_v1')) || []).reduce((s, i) => s + i.q, 0); } catch (e) {}
    document.querySelectorAll('.cart-link .badge').forEach((b) => { b.textContent = n || ''; b.dataset.n = n; });
  };
  window.updateCartBadge();
})();
