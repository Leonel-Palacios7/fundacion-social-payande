import type { APIRoute, GetStaticPaths } from 'astro';
import { buildPool, type ShapeName } from '../../lib/shapes.ts';

// Catálogo de fotos por formato. Lo usa el script de fotos aleatorias; el navegador lo guarda en caché.
export const getStaticPaths = (() =>
  (['landscape', 'portrait', 'ring'] as const).map((shape) => ({ params: { shape } }))) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ params }) => {
  const pool = await buildPool(params.shape as ShapeName);
  return new Response(JSON.stringify(pool), { headers: { 'Content-Type': 'application/json' } });
};
