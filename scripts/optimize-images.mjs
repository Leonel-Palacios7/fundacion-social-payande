// Prepara las fotos originales para el sitio:
// 1. Corrige orientación EXIF y elimina metadatos (incluye GPS).
// 2. Mejora moderada: niveles automáticos, ligera saturación y enfoque.
// 3. Escribe "masters" JPEG de alta calidad en src/assets/photos.
// Astro genera después las variantes AVIF/WebP responsive en el build,
// por lo que estos masters nunca se envían tal cual al navegador.
import { readdir, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const INPUT = process.argv[2] ?? 'fotos-originales';
const PHOTOS_OUT = 'src/assets/photos';
const BRAND_OUT = 'src/assets/brand';
const MAX_EDGE = 2000;

/** Normaliza nombres: "portada payande1.jpeg" -> "portada-payande-1.jpg" */
function slug(file) {
  return path
    .parse(file)
    .name.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/([a-z])(\d)/g, '$1-$2') + '.jpg';
}

async function enhancePhoto(src, dest) {
  await sharp(src)
    .rotate()
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true })
    .normalise({ lower: 1, upper: 99.5 })
    .modulate({ saturation: 1.06 })
    .sharpen({ sigma: 0.7, m1: 0.6, m2: 1.2 })
    .jpeg({ quality: 90, mozjpeg: true, chromaSubsampling: '4:4:4' })
    .toFile(dest);
}

/** El logo original es pequeño (150×174): se reescala ×3 con Lanczos para pantallas de alta densidad. */
async function upscaleLogo(src, dest) {
  const { width } = await sharp(src).metadata();
  await sharp(src)
    .ensureAlpha()
    .resize({ width: width * 3, kernel: 'lanczos3' })
    .sharpen({ sigma: 0.6 })
    .png({ compressionLevel: 9, palette: false })
    .toFile(dest);
}

await mkdir(PHOTOS_OUT, { recursive: true });
await mkdir(BRAND_OUT, { recursive: true });

let before = 0;
let after = 0;
for (const file of (await readdir(INPUT)).sort()) {
  const src = path.join(INPUT, file);
  if (/\.(jpe?g)$/i.test(file)) {
    const dest = path.join(PHOTOS_OUT, slug(file));
    await enhancePhoto(src, dest);
    before += (await stat(src)).size;
    after += (await stat(dest)).size;
    console.log(`foto  ${file} -> ${dest}`);
  } else if (/^logo-.*\.png$/i.test(file)) {
    const dest = path.join(BRAND_OUT, file);
    await upscaleLogo(src, dest);
    console.log(`logo  ${file} -> ${dest}`);
    if (file === 'logo-color.png') {
      // Solo el árbol (sin el texto), para la cabecera, donde el nombre se escribe como texto real.
      const tree = path.join(BRAND_OUT, 'logo-arbol.png');
      await sharp(src).extract({ left: 0, top: 0, width: 150, height: 104 }).trim().toBuffer()
        .then((buf) => upscaleLogo(buf, tree));
      console.log(`logo  ${file} -> ${tree}`);
    }
  }
}
console.log(`Originales: ${(before / 1024).toFixed(0)} KB · masters: ${(after / 1024).toFixed(0)} KB`);
