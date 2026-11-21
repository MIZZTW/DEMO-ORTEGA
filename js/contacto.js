/* Formulario de contacto funcional (sin servidor propio).
   Envía el mensaje al correo definido en js/config.js usando el servicio gratuito FormSubmit.
   La PRIMERA vez que se envíe un mensaje, FormSubmit manda un correo de activación a esa dirección:
   hay que pulsar el enlace "Activate Form" una sola vez. */
(function () {
  const cfg = window.SITE_CONFIG || {};
  const form = document.getElementById('form');
  const status = document.getElementById('status');
  const btn = document.getElementById('send');
  const btnTxt = document.getElementById('send-t');
  const $ = (id) => document.getElementById(id);

  // Prerrelleno desde la tienda o desde otras páginas (?asunto=presupuesto)
  const params = new URLSearchParams(location.search);
  const pre = params.get('asunto');
  if (pre && [...$('asunto').options].some((o) => o.value === pre)) $('asunto').value = pre;
  try {
    const q = sessionStorage.getItem('ortega_quote');
    if (q) { $('mensaje').value = q; sessionStorage.removeItem('ortega_quote'); }
  } catch (e) {}

  const isPlaceholder = () => !cfg.EMAIL_DESTINO || /ejemplo\.com$/i.test(cfg.EMAIL_DESTINO);
  const validEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

  function setErr(id, msg) {
    const el = form.querySelector(`.err[data-for="${id}"]`);
    if (el) el.textContent = msg || '';
    const f = $(id); if (f) f.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }
  function validate() {
    let ok = true, first = null;
    const chk = (id, bad, msg) => { setErr(id, bad ? msg : ''); if (bad) { ok = false; first = first || $(id); } };
    chk('nombre', $('nombre').value.trim().length < 2, 'Indica tu nombre.');
    chk('email', !validEmail($('email').value.trim()), 'Escribe un correo válido.');
    const t = $('tel').value.trim();
    chk('tel', t && !/^[+()\d\s.-]{9,}$/.test(t), 'Teléfono no válido.');
    chk('asunto', !$('asunto').value, 'Selecciona una opción.');
    chk('mensaje', $('mensaje').value.trim().length < 10, 'Cuéntanos un poco más (mínimo 10 caracteres).');
    chk('legal', !$('legal').checked, 'Debes aceptar el aviso legal y la política de privacidad.');
    if (first) first.focus();
    return ok;
  }
  function show(type, html) { status.className = 'status ' + type; status.innerHTML = html; }

  form.addEventListener('input', (e) => { if (e.target.id) setErr(e.target.id, ''); });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.className = 'status';
    if (form.querySelector('[name="_honey"]').value) return; // bot
    if (!validate()) return;

    if (isPlaceholder()) {
      show('info', '<b>Falta configurar el correo.</b> Abre <code>js/config.js</code> y cambia <code>EMAIL_DESTINO</code> por tu dirección.');
      return;
    }

    const asuntoTxt = $('asunto').selectedOptions[0].textContent;
    const payload = {
      name: $('nombre').value.trim(),
      email: $('email').value.trim(),
      empresa: $('empresa').value.trim() || '—',
      telefono: $('tel').value.trim() || '—',
      motivo: asuntoTxt,
      message: $('mensaje').value.trim(),
      _subject: (cfg.ASUNTO || 'Nuevo mensaje desde la web') + ' · ' + asuntoTxt,
      _template: 'table',
      _captcha: 'false',
    };

    form.classList.add('sending'); btn.disabled = true; btnTxt.textContent = 'Enviando…';
    try {
      const res = await fetch('https://formsubmit.co/ajax/' + encodeURI(cfg.EMAIL_DESTINO.trim()), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && String(data.success) !== 'false') {
        show('ok', '¡Mensaje enviado! Un técnico contactará contigo lo antes posible.');
        form.reset();
      } else {
        throw new Error(data.message || 'Error ' + res.status);
      }
    } catch (err) {
      show('ko', 'No hemos podido enviar el mensaje. Inténtalo de nuevo o llámanos al <a href="tel:' + (cfg.TELEFONO || '').replace(/\s/g, '') + '"><b>' + (cfg.TELEFONO || '') + '</b></a>.');
    } finally {
      form.classList.remove('sending'); btn.disabled = false; btnTxt.textContent = 'Enviar mensaje';
    }
  });
})();
