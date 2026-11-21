# Demo web · Señalizaciones Ortega

Web estática (HTML + CSS + JS, sin instalar nada). 4 páginas:

| Archivo | Página |
|---|---|
| `index.html` | Inicio: empresa, servicios, historia, certificaciones |
| `portfolio.html` | Trabajos, con filtro por tipo y ficha de detalle |
| `tienda.html` | Tienda DEMO: catálogo, buscador, carrito (sin pago) |
| `contacto.html` | Formulario que envía un correo |

## 1. Cambiar el correo que recibe el formulario
Abre `js/config.js` y edita `EMAIL_DESTINO`.

El envío usa el servicio gratuito FormSubmit. **La primera vez** que alguien envíe el formulario,
FormSubmit manda un correo de activación a esa dirección: pulsa "Activate Form" una sola vez.
A partir de ahí los mensajes llegan normalmente. (Hay que probarlo ya publicado, no abriendo el archivo con doble clic.)

## 2. Ver la demo en local
Con Python instalado, dentro de esta carpeta:

    python -m http.server 8765

y abre http://localhost:8765

## 3. Qué es de ejemplo (y hay que sustituir)
- Fotos del portfolio: son ilustraciones (`js/art.js` + `js/portfolio.js`).
- Productos, precios y stock: `js/products.js`.
- Textos legales: enlazan a los de la web actual de la empresa.
