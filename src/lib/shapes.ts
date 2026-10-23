import { getImage } from 'astro:assets';
import { categoryLabels, photos, type Photo } from '../data/photos.ts';

/**
 * Formatos de foto del sitio. Todas las ranuras de un mismo formato comparten
 * exactamente las mismas variantes, así las fotos aleatorias reutilizan los
 * mismos archivos (se descargan una vez y quedan en caché entre páginas).
 */
export const shapes = {
  /** 4:3, para tarjetas, galerías y fotos de sección. */
  landscape: { width: 720, height: 540, widths: [360, 540, 720, 1080] },
  /** 4:5, para fotos verticales de sección. */
  portrait: { width: 640, height: 800, widths: [320, 480, 640, 960] },
  /** Tarjetas del carrusel 3D (tamaño fijo en pantalla). */
  ring: { width: 320, height: 458, widths: [320, 640] },
  /** Portadas a todo el ancho: sin recorte, la foto cubre el área con CSS. Tope de 1600px: más ancho casi no se nota bajo el degradado y pesa el doble. */
  hero: { width: 1600, height: undefined, widths: [640, 960, 1280, 1600] },
} as const;

export type ShapeName = keyof typeof shapes;

export interface ShapeImage {
  avif: string;
  webp: string;
  src: string;
  width: number;
  height: number;
}

/** Visor de la galería: WebP de 1600px. */
export const LARGE = { width: 1600, format: 'webp', quality: 72 } as const;

export async function renderShape(photo: Photo, shape: ShapeName): Promise<ShapeImage> {
  const def = shapes[shape];
  const max = photo.src.width;
  // Nunca se amplía una foto por encima de su tamaño original.
  const widths: number[] = def.widths.filter((w) => w <= max);
  if (widths.length === 0) widths.push(max);
  const width = Math.min(def.width, max);
  const height = def.height ? Math.round((def.height / def.width) * width) : undefined;
  const base = { src: photo.src, width, height, widths, fit: 'cover' as const };
  const [avif, webp] = await Promise.all([
    getImage({ ...base, format: 'avif' }),
    getImage({ ...base, format: 'webp' }),
  ]);
  return {
    avif: avif.srcSet.attribute,
    webp: webp.srcSet.attribute,
    src: webp.src,
    width: Number(webp.attributes.width),
    height: Number(webp.attributes.height),
  };
}

export async function renderLarge(photo: Photo) {
  const large = await getImage({ src: photo.src, ...LARGE, layout: 'none' });
  return { src: large.src, width: Number(large.attributes.width), height: Number(large.attributes.height) };
}

/** Fotos aptas para portada: horizontales y con suficiente resolución. */
export const heroPhotos = photos.filter((p) => p.src.width >= p.src.height * 1.2 && p.src.width >= 1280);

/** Entrada compacta del catálogo de fotos aleatorias (claves cortas: viaja en cada página). */
export interface PoolEntry {
  id: string;
  c: string;
  cl: string;
  a: string;
  s: ShapeImage;
  l?: { src: string; width: number; height: number };
}

export async function buildPool(shape: ShapeName, list: readonly Photo[] = photos): Promise<PoolEntry[]> {
  return Promise.all(
    list.map(async (photo) => ({
      id: photo.id,
      c: photo.category,
      cl: categoryLabels[photo.category],
      a: photo.alt,
      s: await renderShape(photo, shape),
      ...(shape === 'landscape' ? { l: await renderLarge(photo) } : {}),
    })),
  );
}
