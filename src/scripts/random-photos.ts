import { withBase } from '../lib/paths.ts';
import type { PoolEntry } from '../lib/shapes.ts';

/**
 * Fotos al azar: cada <picture data-random="formato"> cambia en cada visita
 * por otra foto del catálogo de ese formato (/fotos/<formato>.json), sin
 * repetir fotos en la misma página mientras haya opciones.
 * Las ranuras llegan sin src (ver RandomPicture.astro): nada se descarga dos veces.
 */
function shuffle<T>(list: T[]): T[] {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j]!, list[i]!];
  }
  return list;
}

const loadPool = (shape: string): Promise<PoolEntry[]> =>
  fetch(withBase(`/fotos/${shape}.json`))
    .then((res) => (res.ok ? (res.json() as Promise<PoolEntry[]>) : []))
    .catch(() => []);

/** Pone las rutas de la foto elegida; hasta ahora la ranura no tenía nada que descargar. */
function apply(picture: HTMLPictureElement, entry: PoolEntry | undefined): void {
  const img = picture.querySelector('img');
  const [avif, webp] = picture.querySelectorAll('source');
  if (!img || !avif || !webp) return;
  if (!entry) {
    // Sin catálogo (sin conexión, error): se usa la foto por defecto.
    avif.srcset = avif.dataset['srcset'] ?? '';
    webp.srcset = webp.dataset['srcset'] ?? '';
    img.alt = img.dataset['alt'] ?? '';
    img.src = img.dataset['src'] ?? '';
    return;
  }
  avif.srcset = entry.s.avif;
  webp.srcset = entry.s.webp;
  img.width = entry.s.width;
  img.height = entry.s.height;
  img.alt = img.dataset['alt'] ? entry.a : '';
  img.src = entry.s.src;
  picture.dataset['photo'] = entry.id;
  updateGalleryLink(picture, entry);
}

/** En la galería de Inicio el enlace y el visor deben mostrar la misma foto. */
function updateGalleryLink(picture: HTMLPictureElement, entry: PoolEntry): void {
  const link = picture.closest<HTMLAnchorElement>('.gallery__link');
  if (!link || !entry.l) return;
  link.href = entry.l.src;
  link.dataset['large'] = entry.l.src;
  link.dataset['width'] = String(entry.l.width);
  link.dataset['height'] = String(entry.l.height);
  link.dataset['caption'] = entry.a;
  link.setAttribute('aria-label', `${entry.cl}. Ampliar foto: ${entry.a}`);
  const item = link.closest<HTMLElement>('.gallery__item');
  if (item) item.dataset['category'] = entry.c;
  const caption = link.querySelector('.gallery__caption');
  if (caption) caption.textContent = entry.cl;
}

export async function initRandomPhotos(): Promise<void> {
  const slots = Array.from(document.querySelectorAll<HTMLPictureElement>('picture[data-random]'));
  if (slots.length === 0) return;

  // Las portadas ya eligieron su foto (HeroPicture): no se repiten abajo.
  const used = new Set<string>((window as { __payandeUsed?: string[] }).__payandeUsed ?? []);
  const shapes = [...new Set(slots.map((slot) => slot.dataset['random']!))];
  const pools = new Map(await Promise.all(shapes.map(async (shape) => [shape, await loadPool(shape)] as const)));

  for (const slot of shuffle(slots)) {
    const categories = slot.dataset['pool']?.split(' ');
    const pool = (pools.get(slot.dataset['random']!) ?? []).filter((e) => !categories || categories.includes(e.c));
    const fresh = pool.filter((e) => !used.has(e.id));
    const options = fresh.length ? fresh : pool;
    const entry = options[Math.floor(Math.random() * options.length)];
    if (entry) used.add(entry.id);
    apply(slot, entry);
  }
}

/** Reordena al azar las fotos de una galería (antes de iniciar filtros y visor). */
export function shuffleGallery(root: HTMLElement): void {
  const list = root.querySelector('.gallery__grid');
  if (!list) return;
  const items = shuffle(Array.from(list.querySelectorAll<HTMLElement>(':scope > .gallery__item')));
  items.forEach((item, i) => {
    item.style.setProperty('--stagger', String(i % 6));
    item.querySelector('.gallery__link')?.setAttribute('data-index', String(i));
    list.append(item);
  });
}
