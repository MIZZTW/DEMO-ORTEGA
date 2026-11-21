/* Portfolio: datos de ejemplo + filtro + ficha en ventana */
(function () {
  const CATS = {
    todos: 'Todos',
    horizontal: 'Señalización horizontal',
    vertical: 'Señalización vertical',
    contencion: 'Sistemas de contención',
    balizamiento: 'Balizamiento',
    pistas: 'Pistas deportivas',
  };

  const WORKS = [
    { cat: 'horizontal', title: 'Repintado de marcas viales en carretera autonómica', desc: 'Renovación de líneas de borde y eje con pintura acrílica y microesferas de vidrio, con corte de carril rotatorio para mantener la circulación.' },
    { cat: 'horizontal', title: 'Pasos de peatones y marcas viales en casco urbano', desc: 'Pintado de pasos de cebra, líneas de detención, flechas y plazas de aparcamiento en varias calles del municipio.' },
    { cat: 'horizontal', title: 'Termoplástico en caliente en ampliación de calzada', desc: 'Aplicación de marca vial termoplástica de larga duración tras el nuevo extendido de asfalto.' },
    { cat: 'vertical', title: 'Pórtico y señalización orientativa en autovía', desc: 'Fabricación e instalación de paneles de orientación y carteles laterales con lámina retrorreflectante de alta intensidad.' },
    { cat: 'vertical', title: 'Renovación de señales de tráfico en travesía', desc: 'Sustitución de señales deterioradas por otras nuevas, fabricadas en nuestras instalaciones y colocadas en poste galvanizado.' },
    { cat: 'vertical', title: 'Señales a medida en aluminio', desc: 'Producción de señales especiales y rótulos informativos para polígonos industriales y recintos privados.' },
    { cat: 'contencion', title: 'Barrera de seguridad metálica en variante', desc: 'Montaje de barrera bionda con terminales y amortiguadores conforme a la norma UNE-EN 1317 en margen y mediana.' },
    { cat: 'contencion', title: 'Reposición de tramos de barrera dañados', desc: 'Intervención rápida tras accidentes para devolver al tramo su nivel de contención con el mínimo corte de tráfico.' },
    { cat: 'balizamiento', title: 'Balizamiento provisional de obra', desc: 'Conos, paneles direccionales y luces intermitentes para desvíos y trabajos con ocupación de calzada.' },
    { cat: 'balizamiento', title: 'Captafaros y balizas en tramo de curvas', desc: 'Delimitación de calzada con captafaros y balizas de borde para mejorar la visibilidad nocturna.' },
    { cat: 'pistas', title: 'Pintado de pista polideportiva municipal', desc: 'Preparación del pavimento, pintado de superficie y marcaje de líneas reglamentarias para fútbol sala y baloncesto.' },
    { cat: 'pistas', title: 'Marcaje de pistas de pádel y tenis', desc: 'Pintado de pavimentos deportivos y trazado de líneas de juego con colores personalizados.' },
  ];

  const chips = document.getElementById('chips');
  const grid = document.getElementById('works');
  const count = document.getElementById('count');
  const dlg = document.getElementById('wdlg');

  const qp = new URLSearchParams(location.search).get('cat');
  let active = CATS[qp] ? qp : 'todos';

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function renderChips() {
    chips.innerHTML = Object.entries(CATS).map(([k, v]) =>
      `<button class="chip" type="button" data-cat="${k}" aria-pressed="${k === active}">${v}</button>`).join('');
  }

  function render() {
    const list = WORKS.map((w, i) => ({ ...w, i })).filter((w) => active === 'todos' || w.cat === active);
    grid.innerHTML = list.map((w) =>
      `<button class="work reveal in" type="button" data-i="${w.i}" aria-label="Ver detalle: ${esc(w.title)}">
         <div class="art"><span class="tag">${CATS[w.cat]}</span>${ART.scene(w.cat)}</div>
         <div class="info"><h3>${esc(w.title)}</h3><p>${esc(w.desc)}</p>
         <div class="meta"><span>Ver detalle</span><span>Foto de ejemplo</span></div></div>
       </button>`).join('');
    count.textContent = list.length + (list.length === 1 ? ' trabajo' : ' trabajos');
  }

  chips.addEventListener('click', (e) => {
    const b = e.target.closest('[data-cat]');
    if (!b) return;
    active = b.dataset.cat;
    renderChips(); render();
    history.replaceState(null, '', active === 'todos' ? location.pathname : '?cat=' + active);
  });

  grid.addEventListener('click', (e) => {
    const b = e.target.closest('[data-i]');
    if (!b) return;
    const w = WORKS[+b.dataset.i];
    document.getElementById('wart').innerHTML = ART.scene(w.cat);
    document.getElementById('wcat').textContent = CATS[w.cat];
    document.getElementById('wtitle').textContent = w.title;
    document.getElementById('wdesc').textContent = w.desc;
    document.getElementById('wnote').textContent = 'Imagen y descripción de ejemplo. Aquí irá la galería real de la obra.';
    dlg.showModal();
  });

  dlg.addEventListener('click', (e) => { if (e.target === dlg || e.target.closest('[data-close]')) dlg.close(); });

  renderChips(); render();
})();
