/**
 * Antepone la ruta base del sitio (BASE_PATH al compilar) a una ruta interna.
 * En Hostinger la base es "/" y no cambia nada; en GitHub Pages es "/fundacion-social-payande".
 */
export function withBase(path: string): string {
  if (!path.startsWith('/')) return path;
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
  return `${base}${path}`;
}
