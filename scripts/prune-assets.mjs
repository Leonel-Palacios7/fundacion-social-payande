// Astro copia a dist/_astro el JPEG maestro de cada foto importada aunque
// ninguna página lo use (solo se sirven las variantes AVIF/WebP). Este paso
// borra las imágenes que ningún HTML, JSON, CSS o JS referencia.
import { readdir, readFile, rm, stat } from 'node:fs/promises';
import path from 'node:path';

const DIST = 'dist';
const ASSETS = path.join(DIST, '_astro');

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (/\.(html|json|css|js|webmanifest)$/.test(entry.name)) yield full;
  }
}

let text = '';
for await (const file of walk(DIST)) text += await readFile(file, 'utf8');

let removed = 0;
let bytes = 0;
for (const name of await readdir(ASSETS)) {
  if (!/\.(jpe?g|png|webp|avif)$/i.test(name) || text.includes(name)) continue;
  const file = path.join(ASSETS, name);
  bytes += (await stat(file)).size;
  await rm(file);
  removed++;
}
console.log(`Imágenes sin usar eliminadas: ${removed} (${(bytes / 1048576).toFixed(1)} MB)`);
