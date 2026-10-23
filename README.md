# Fundación Payandé — sitio web (solo frontend)

Sitio estático multipágina construido con **Astro 6 + TypeScript**. No usa backend ni base de datos:
el resultado de `npm run build` es HTML, CSS, JS e imágenes que se pueden publicar en cualquier
hosting estático (Netlify, Vercel, GitHub Pages, Cloudflare Pages, cPanel, etc.).

## Requisitos

- Node.js 22.12 o superior
- npm 10

## Comandos

| Comando | Qué hace |
| --- | --- |
| `npm install` | Instala dependencias |
| `npm run dev` | Servidor de desarrollo en http://localhost:4321 |
| `npm run images` | Regenera las fotos maestras desde `fotos-originales/` (mejora + limpieza de metadatos) |
| `npm run check` | Verificación de tipos y plantillas (`astro check`) |
| `npm test` | Pruebas unitarias (validación del formulario) con `node:test` |
| `npm run build` | Build de producción en `dist/` (genera AVIF/WebP responsive) |
| `npm run preview` | Sirve el build de producción |
| `npm run test:e2e` | Pruebas end-to-end + accesibilidad (Playwright + axe) en escritorio y móvil |
| `npm run verify` | Todo lo anterior en orden |

Para URLs canónicas y metadatos sociales absolutos: `SITE_URL=https://dominio.org npm run build`.

## Estructura

```
fotos-originales/        Fotos y logos tal como se recibieron (fuente)
scripts/optimize-images.mjs  Mejora de fotos y reescalado del logo
src/
  assets/brand/          Logos (color, blanco y solo árbol) reescalados ×3
  assets/photos/         Fotos maestras mejoradas (no se envían tal cual al navegador)
  components/            Header, Footer, HeroCarousel, PageHero, ProgramCard, Gallery, ContactForm, CtaBand, ProvisionalNote
  data/                  site.ts (datos institucionales y menú), photos.ts (catálogo y textos alternativos), programs.ts
  layouts/BaseLayout.astro  <head>, SEO, fuentes, estructura común
  pages/                 index, nosotros, programas, galeria, como-ayudar, contacto, 404
  scripts/               Lógica de cliente en TypeScript (menú, carrusel, galería, formulario)
  styles/                tokens.css (sistema de diseño) y global.css
tests/unit/              Pruebas unitarias
tests/e2e/               Pruebas end-to-end y de accesibilidad
```

## Identidad visual

- **Colores del logo:** verde `#5EBD91`, lima `#8ECA6D`, turquesa `#33B8B8`, azul `#1FA2C6`.
  Como estos tonos no alcanzan contraste AA sobre blanco, para texto y botones se usan derivados
  oscuros (`#1E6B4F`, `#0F3B2E`, `#0B6A73`). Todo está en `src/styles/tokens.css`.
- **Tipografía:** *Ubuntu* (equivalente al texto "Fundación" del logo) y *Kaushan Script*
  (equivalente al lettering "Payandé"), autoalojadas con Fontsource, solo subconjunto latino.

## Contenido provisional

Los textos institucionales (misión, visión, valores, descripción de programas, preguntas
frecuentes) y los datos de contacto son **de ejemplo**. Se muestran con una etiqueta
"Texto provisional". Para publicar:

1. Reemplazar textos en `src/pages/*.astro` y `src/data/programs.ts`.
2. Reemplazar correo y teléfono en `src/data/site.ts` y poner `provisional: false`.
3. Poner `showProvisionalNotes: false` en `src/data/site.ts`.

## Formulario de contacto

No hay servidor, así que el formulario valida en el navegador y abre la aplicación de correo de
la persona con el mensaje listo (`mailto:`), además de ofrecer "Copiar mensaje". Nunca muestra
"mensaje enviado", porque el sitio no puede comprobarlo. Si en el futuro se quiere envío directo,
se necesita un servicio externo (por ejemplo un servicio de formularios) o un backend.

## Animaciones y efectos (v2)

Inspirados en las plantillas de video entregadas ("3D Photo Carousel" y "Minimal Fashion Promo"),
recreados con CSS y TypeScript nativos, sin librerías de animación:

| Efecto | Dónde | Archivo |
| --- | --- | --- |
| Carrusel 3D de fotos con la palabra "Payandé" entre las fotos; arrastrable, con flechas y pausa | Inicio | `src/components/PhotoRing.astro`, `src/scripts/photo-ring.ts` |
| Composición editorial: título fino en mayúsculas, línea que se dibuja, etiquetas monoespaciadas, número gigante | Programas | `src/pages/programas.astro` |
| Cortina doble verde/lima que descubre la foto + paso de blanco y negro a color | Inicio, Nosotros, Programas | `data-reveal="mask" data-tone="mono"` en `global.css` |
| Aparición escalonada al hacer scroll | Todas | `data-reveal` + `src/scripts/reveal.ts` |
| Título del inicio palabra por palabra y zoom lento (Ken Burns) en las fotos de portada | Inicio y cabeceras | `HeroCarousel.astro`, `PageHero.astro` |
| Cinta animada con las líneas de acción (con botón para detenerla) | Inicio | `src/components/Marquee.astro` |
| Transición suave entre páginas (View Transitions entre documentos) | Todas | `global.css` |
| Barra de progreso de lectura (scroll-driven animations) | Todas | `global.css` |
| Cabecera que se compacta con desenfoque al hacer scroll | Todas | `Header.astro` |
| Leyendas que suben al pasar el cursor y visor con zoom de entrada | Galería | `Gallery.astro` |

Todo se desactiva si el sistema tiene activado "reducir movimiento", todo lo que se mueve solo se
puede pausar y el contenido es visible aunque JavaScript no cargue. Las transiciones entre páginas
y la barra de progreso solo aparecen en navegadores que las soportan (Chrome/Edge); en los demás el
sitio funciona igual, sin ese efecto.
