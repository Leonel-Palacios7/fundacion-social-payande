// @ts-check
import { defineConfig } from 'astro/config';

// La URL pública aún no está definida. Cuando exista dominio, ejecutar el build con
// SITE_URL=https://dominio.org para generar URLs canónicas y metadatos sociales absolutos.
const site = process.env.SITE_URL || undefined;
// Ruta base: "/" en Hostinger; "/fundacion-social-payande" en GitHub Pages (lo define el flujo de Actions).
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  ...(site ? { site } : {}),
  base,
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  image: {
    layout: 'constrained',
    responsiveStyles: false,
    // Anchos generados para srcset: cubren móviles (1x-3x), tabletas y escritorio sin variantes innecesarias.
    breakpoints: [360, 480, 640, 768, 960, 1280, 1600],
    service: {
      entrypoint: 'astro/assets/services/sharp',
      // Calidades calibradas a ojo sobre las fotos del proyecto: sin artefactos visibles y con mucho menos peso.
      config: {
        jpeg: { quality: 74, mozjpeg: true },
        webp: { quality: 70, effort: 5 },
        avif: { quality: 48, effort: 4 },
      },
    },
  },
  devToolbar: { enabled: false },
});
