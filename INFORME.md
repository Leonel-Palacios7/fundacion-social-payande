# Informe de entrega — Sitio web Fundación Payandé

Fecha: 22 de octubre de 2026

## A. Resumen ejecutivo
Proyecto nuevo, sin código previo. Se construyó un sitio estático multipágina (6 páginas + 404) con Astro 6 y TypeScript, sin backend ni base de datos. Usa la paleta y una tipografía equivalente a la del logo y las 25 fotos entregadas, mejoradas y convertidas a AVIF/WebP responsive. Verificado con `astro check`, pruebas unitarias, build de producción y 53 pruebas end-to-end en escritorio y móvil (incluye accesibilidad automática con axe).

## B. Diagnóstico inicial
- No había repositorio ni código: no hubo línea base de errores que auditar.
- Recursos: logo a color 150×174 px, versión blanca del logo, 25 fotos JPEG (7,0 MB en total, hasta 1600 px).
- No se recibió información institucional (misión, contacto, programas). Riesgo: contenido inventado. Mitigación: textos de ejemplo marcados visiblemente como provisionales.

## C. Cambios implementados
- `scripts/optimize-images.mjs`: corrige orientación, elimina metadatos EXIF/GPS, ajusta niveles, saturación y nitidez; reescala el logo ×3 y genera la versión “solo árbol” para la cabecera.
- `astro.config.mjs`: breakpoints de imagen y calidades AVIF 48 / WebP 70 / JPEG 74 (mozjpeg).
- `src/styles/tokens.css`: sistema de diseño (colores, tipografía, espaciado, radios, sombras, capas, movimiento).
- Componentes: Header (menú móvil accesible), Footer, HeroCarousel, PageHero, ProgramCard, Gallery (filtros + visor con `<dialog>`), ContactForm, CtaBand, ProvisionalNote.
- Páginas: Inicio, Nosotros, Programas, Galería, Cómo ayudar, Contacto, 404.

## D. Arquitectura y calidad
- Datos separados de la presentación (`src/data/*`): un solo lugar para contacto, menú, catálogo de fotos y programas.
- Lógica de cliente en módulos TypeScript pequeños (`src/scripts/*`); la validación del formulario es una función pura con pruebas.
- TypeScript en modo `strictest`, sin `any`. Mejora progresiva: sin JavaScript el menú queda visible y las fotos de la galería son enlaces.
- Dependencias mínimas: astro, @fontsource (fuentes autoalojadas). No se añadieron librerías de UI, estado ni formularios porque no se justifican.

## E. Diseño y experiencia de usuario
- Paleta del logo; tonos oscuros derivados para cumplir contraste AA en texto y botones.
- Ubuntu para texto y títulos; Kaushan Script como acento caligráfico (evoca el “Payandé” del logo).
- Carrusel con pausa visible; no avanza solo si el usuario pidió reducir movimiento.
- Galería filtrable por programa, enlazable (`/galeria/?programa=educacion`), visor con teclado (←, →, Esc) y retorno del foco.
- Formulario con validación al salir del campo, resumen de errores enlazado, contador de caracteres y autorización de datos (Ley 1581 de 2012).

## F. Pruebas y resultados (comandos ejecutados)
| Comando | Resultado |
| --- | --- |
| `npx astro check` | APROBADO: 0 errores, 0 advertencias |
| `npm test` | APROBADO: 8/8 |
| `npx astro build` | APROBADO: 7 páginas |
| `npx playwright test` (Chromium escritorio + Pixel 7) | APROBADO: 53 OK, 1 omitida a propósito (menú móvil en escritorio) |

Las pruebas e2e cubren: carga sin errores de consola y un único h1 por página, axe WCAG 2.0/2.1/2.2 A-AA sin violaciones en las 6 páginas, ausencia de scroll horizontal a 320, 375, 768, 1024 y 1440 px, navegación y `aria-current`, menú móvil (Escape y foco), carrusel, movimiento reducido, galería, filtros por URL, formulario, 404 e imágenes AVIF/WebP con dimensiones reservadas.

Medición de laboratorio local (Chromium, sin limitar red; no son datos de campo):

| Página | Móvil 390 px @3x | Escritorio 1440 px | CLS máx. |
| --- | --- | --- | --- |
| Inicio | 1344 KB | 1061 KB | 0,001 |
| Nosotros | 534 KB | 551 KB | 0,034 |
| Programas | 719 KB | 505 KB | 0,080 |
| Galería | 1190 KB | 765 KB | 0,002 |
| Cómo ayudar | 567 KB | 340 KB | 0,003 |
| Contacto | 378 KB | 361 KB | 0,004 |

Las fotos originales sumaban 7,0 MB; ninguna página descarga todas, y cada foto se sirve en el tamaño que necesita la pantalla.

## G. Problemas pendientes
- **Frontend / contenido:** reemplazar los textos provisionales y los datos de contacto (`contacto@example.org`, `+57 300 000 0000`) por los reales; confirmar nombres de programas.
- **Entorno:** no se probaron Safari ni Firefox (solo Chromium disponible). No se hicieron pruebas con lector de pantalla.
- **Servicios externos:** el envío directo del formulario o las donaciones en línea requieren un servicio externo; no se simularon.
- **Backend:** ninguno (no existe).

## H. Riesgos y recomendaciones
- La conformidad WCAG 2.2 AA no puede afirmarse solo con axe: recomendable una revisión manual con NVDA o VoiceOver.
- CLS de 0,08 en Programas (móvil) se debe al cambio de fuente al cargar; está bajo 0,1, pero puede bajar precargando la fuente principal.
- Las tipografías son equivalentes cercanas al logo, no las originales: si la Fundación tiene el archivo de la fuente o el logo en vector (SVG/AI), conviene usarlos.
- Definir el dominio y construir con `SITE_URL` para tener URLs canónicas y vistas previas sociales correctas.

## I. Estado de aceptación
| Criterio | Estado |
| --- | --- |
| Alcance solo frontend | APROBADO |
| Arquitectura inspeccionada y documentada | APROBADO |
| Controles con comportamiento real | APROBADO |
| Navegación | APROBADO |
| Formularios con errores y estados | APROBADO |
| Responsive 320–1440 px | APROBADO (Chromium) |
| Accesibilidad automática (axe) | APROBADO |
| Accesibilidad manual con lector de pantalla | PENDIENTE |
| Seguridad frontend (sin HTML dinámico inseguro, sin secretos, sin scripts de terceros) | APROBADO |
| Rendimiento optimizado y medido en laboratorio | APROBADO |
| Core Web Vitals de campo | PENDIENTE (requiere sitio publicado) |
| Pruebas en Safari y Firefox | BLOQUEADO (no disponibles en el entorno) |
| Build de producción | APROBADO |
| Contenido institucional real | PENDIENTE (lo debe aportar la Fundación) |

## J. Instrucciones de ejecución
```
npm install
npm run dev          # desarrollo
npm run verify       # check + unitarias + build + e2e
npm run build        # genera dist/ para publicar
```

## K. Resultado final
El sitio está terminado como frontend estático, funcional y verificado en Chromium (escritorio y móvil). Queda pendiente reemplazar el contenido provisional por el real, probar en Safari/Firefox y con lector de pantalla, y elegir dónde publicarlo.
