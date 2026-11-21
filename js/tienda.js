/* Tienda DEMO: catálogo, filtros, ficha de producto y carrito (localStorage). Sin pagos. */
(function () {
  const IVA = 0.21;
  const KEY = 'ortega_cart_v1';
  const eur = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const byId = (id) => PRODUCTS.find((p) => p.id === id);

  /* ---------- Estado del carrito ---------- */
  const loadCart = () => { try { return (JSON.parse(localStorage.getItem(KEY)) || []).filter((i) => byId(i.id)); } catch (e) { return []; } };
  let cart = loadCart();
  const saveCart = () => { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) {} window.updateCartBadge && window.updateCartBadge(); renderCart(); };
  const addToCart = (id, q = 1) => {
    const it = cart.find((i) => i.id === id);
    if (it) it.q = Math.min(it.q + q, 999); else cart.push({ id, q });
    saveCart(); toast(`Añadido: ${byId(id).name}`);
  };

  /* ---------- Catálogo ---------- */
  const cats = ['Todos', ...new Set(PRODUCTS.map((p) => p.cat))];
  let state = { cat: 'Todos', q: '', sort: 'rel' };

  const chips = $('#chips'), grid = $('#grid'), count = $('#count');
  chips.innerHTML = cats.map((c) => `<button class="chip" type="button" data-cat="${esc(c)}" aria-pressed="${c === 'Todos'}">${esc(c)}</button>`).join('');

  const stockLabel = (p) => p.stock <= 0 ? '<span class="stock low">Sin stock</span>' : p.stock < 15 ? `<span class="stock low">Quedan ${p.stock} uds.</span>` : '<span class="stock">En stock</span>';

  function renderGrid() {
    const q = state.q.trim().toLowerCase();
    let list = PRODUCTS.filter((p) => (state.cat === 'Todos' || p.cat === state.cat) && (!q || (p.name + ' ' + p.cat + ' ' + p.id).toLowerCase().includes(q)));
    if (state.sort === 'asc') list = [...list].sort((a, b) => a.price - b.price);
    if (state.sort === 'desc') list = [...list].sort((a, b) => b.price - a.price);
    if (state.sort === 'az') list = [...list].sort((a, b) => a.name.localeCompare(b.name, 'es'));
    count.textContent = list.length + (list.length === 1 ? ' producto' : ' productos');
    grid.innerHTML = list.length ? list.map((p) =>
      `<article class="product">
         <button class="quick" type="button" data-view="${p.id}" aria-label="Ver ficha de ${esc(p.name)}">
           <div class="shop-art">${ART.product(p.kind, p.opts)}</div>
         </button>
         <div class="info">
           <span class="cat">${esc(p.cat)}</span>
           <button class="quick" type="button" data-view="${p.id}"><h3>${esc(p.name)}</h3></button>
           <span class="sku">Ref. ${esc(p.id)} · ${stockLabel(p)}</span>
           <div class="buy">
             <div class="price">${eur.format(p.price)}<small>+ IVA</small></div>
             <button class="btn sm" type="button" data-add="${p.id}" ${p.stock <= 0 ? 'disabled' : ''}>Añadir</button>
           </div>
         </div>
       </article>`).join('') : '<div class="empty"><h3>Sin resultados</h3><p>Prueba con otra búsqueda o categoría.</p></div>';
  }

  chips.addEventListener('click', (e) => {
    const b = e.target.closest('[data-cat]'); if (!b) return;
    state.cat = b.dataset.cat;
    chips.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c === b)));
    renderGrid();
  });
  $('#q').addEventListener('input', (e) => { state.q = e.target.value; renderGrid(); });
  $('#sort').addEventListener('change', (e) => { state.sort = e.target.value; renderGrid(); });

  grid.addEventListener('click', (e) => {
    const a = e.target.closest('[data-add]');
    if (a) return addToCart(a.dataset.add);
    const v = e.target.closest('[data-view]');
    if (v) openProduct(v.dataset.view);
  });

  /* ---------- Ficha de producto ---------- */
  const pdlg = $('#pdlg');
  let cur = null, curQ = 1;
  function openProduct(id) {
    cur = byId(id); curQ = 1;
    $('#p-art').innerHTML = ART.product(cur.kind, cur.opts);
    $('#p-art svg').style.cssText = 'width:80%;height:80%';
    $('#p-cat').textContent = cur.cat;
    $('#p-name').textContent = cur.name;
    $('#p-desc').textContent = cur.desc;
    $('#p-specs').innerHTML = cur.specs.map((s) => `<li>${esc(s)}</li>`).join('');
    $('#p-price').innerHTML = `${eur.format(cur.price)}<small>+ IVA · Ref. ${esc(cur.id)}</small>`;
    $('#p-stock').innerHTML = stockLabel(cur);
    $('#p-q').textContent = curQ;
    $('#p-add').disabled = cur.stock <= 0;
    pdlg.showModal();
  }
  $('#p-qty').addEventListener('click', (e) => {
    const b = e.target.closest('[data-d]'); if (!b) return;
    curQ = Math.max(1, Math.min(99, curQ + +b.dataset.d)); $('#p-q').textContent = curQ;
  });
  $('#p-add').addEventListener('click', () => { addToCart(cur.id, curQ); pdlg.close(); });
  [pdlg, $('#cdlg')].forEach((d) => d.addEventListener('click', (e) => { if (e.target === d || e.target.closest('[data-close]')) d.close(); }));

  /* ---------- Carrito (cajón lateral) ---------- */
  const drawer = $('#cart'), overlay = $('#overlay');
  function openCart() { drawer.classList.add('open'); overlay.classList.add('open'); drawer.setAttribute('aria-hidden', 'false'); $('#cart-close').focus(); }
  function closeCart() { drawer.classList.remove('open'); overlay.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); }
  document.querySelectorAll('[data-open-cart]').forEach((b) => b.addEventListener('click', openCart));
  $('#cart-close').addEventListener('click', closeCart);
  overlay.addEventListener('click', closeCart);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCart(); });
  if (location.hash === '#carrito') openCart();

  const totals = () => {
    const sub = cart.reduce((s, i) => s + byId(i.id).price * i.q, 0);
    return { sub, iva: sub * IVA, total: sub * (1 + IVA) };
  };

  function renderCart() {
    const items = $('#cart-items'), foot = $('#cart-foot');
    if (!cart.length) {
      items.innerHTML = '<div class="cart-empty"><h3>Tu carrito está vacío</h3><p>Añade productos desde la tienda.</p></div>';
      foot.innerHTML = '';
      return;
    }
    items.innerHTML = cart.map((i) => {
      const p = byId(i.id);
      return `<div class="line-item">
        <div class="th">${ART.product(p.kind, p.opts)}</div>
        <div><b>${esc(p.name)}</b>
          <div class="qty" style="margin-top:8px"><button type="button" data-q="${p.id}" data-d="-1" aria-label="Menos">−</button><span>${i.q}</span><button type="button" data-q="${p.id}" data-d="1" aria-label="Más">+</button></div><br>
          <button class="rm" type="button" data-rm="${p.id}">Quitar</button></div>
        <div class="t">${eur.format(p.price * i.q)}</div>
      </div>`;
    }).join('');
    const t = totals();
    foot.innerHTML = `<div class="sum"><span>Subtotal</span><span>${eur.format(t.sub)}</span></div>
      <div class="sum"><span>IVA (21 %)</span><span>${eur.format(t.iva)}</span></div>
      <div class="sum total"><span>Total</span><span>${eur.format(t.total)}</span></div>
      <button class="btn" type="button" id="checkout">Tramitar pedido (demo)</button>
      <button class="btn line" type="button" id="empty">Vaciar carrito</button>`;
  }

  $('#cart-items').addEventListener('click', (e) => {
    const q = e.target.closest('[data-q]');
    if (q) {
      const it = cart.find((i) => i.id === q.dataset.q);
      it.q = Math.max(1, Math.min(999, it.q + +q.dataset.d)); return saveCart();
    }
    const r = e.target.closest('[data-rm]');
    if (r) { cart = cart.filter((i) => i.id !== r.dataset.rm); saveCart(); }
  });

  $('#cart-foot').addEventListener('click', (e) => {
    if (e.target.id === 'empty') { cart = []; saveCart(); }
    if (e.target.id === 'checkout') {
      const t = totals();
      $('#c-sum').textContent = `Resumen: ${cart.reduce((s, i) => s + i.q, 0)} artículos · Total ${eur.format(t.total)} (IVA incluido).`;
      closeCart(); $('#cdlg').showModal();
    }
  });

  // Enviar el carrito como solicitud de presupuesto (se precarga en el formulario de contacto)
  $('#c-quote').addEventListener('click', () => {
    const lines = cart.map((i) => `- ${i.q} × ${byId(i.id).name} (Ref. ${i.id})`).join('\n');
    try { sessionStorage.setItem('ortega_quote', 'Hola, quisiera un presupuesto para estos productos:\n' + lines + '\n'); } catch (e) {}
    location.href = 'contacto.html?asunto=presupuesto';
  });

  /* ---------- Aviso emergente ---------- */
  let tt;
  function toast(msg) {
    let t = $('#toast');
    if (!t) {
      t = document.createElement('div'); t.id = 'toast'; t.setAttribute('role', 'status');
      t.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translate(-50%,30px);background:#111;color:#fff;padding:13px 22px;border-radius:999px;font-weight:600;z-index:400;opacity:0;transition:.3s;max-width:90vw;text-align:center;box-shadow:0 10px 30px rgba(0,0,0,.35);border:2px solid #FFD500';
      document.body.appendChild(t);
    }
    t.textContent = msg; t.style.opacity = 1; t.style.transform = 'translate(-50%,0)';
    clearTimeout(tt); tt = setTimeout(() => { t.style.opacity = 0; t.style.transform = 'translate(-50%,30px)'; }, 2200);
  }

  renderGrid(); renderCart();
})();
