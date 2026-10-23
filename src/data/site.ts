/**
 * Fuente única de verdad para los datos institucionales.
 * Todo lo marcado como `provisional` es contenido de ejemplo y debe
 * ser confirmado por la Fundación antes de publicar el sitio.
 */
export const site = {
  name: 'Fundación Payandé',
  shortName: 'Payandé',
  tagline: 'Sembramos oportunidades en nuestra comunidad',
  description:
    'La Fundación Social Payandé mejora la calidad de vida, la educación, la salud, la vivienda y la recreación de personas de escasos recursos en Quebradanegra, Tobia y Villeta (Cundinamarca).',
  locale: 'es_CO',
  /** Muestra avisos visibles en los textos que aún son de ejemplo. Poner en false al confirmar el contenido. */
  showProvisionalNotes: true,
  contact: {
    // PROVISIONAL: reemplazar por los datos reales de la Fundación.
    email: 'contacto@example.org',
    phoneDisplay: '+57 300 000 0000',
    phoneHref: '+573000000000',
    location: 'Villeta, Cundinamarca, Colombia',
    /** Municipios donde trabaja la Fundación, según su sitio actual. */
    area: 'Quebradanegra, Tobia y Villeta',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Villeta%2C%20Cundinamarca%2C%20Colombia',
    mapEmbedUrl: 'https://www.google.com/maps?q=Villeta%2C%20Cundinamarca%2C%20Colombia&z=11&output=embed',
    provisional: true,
  },
} as const;

export interface NavItem {
  href: string;
  label: string;
}

export const navItems: readonly NavItem[] = [
  { href: '/', label: 'Inicio' },
  { href: '/nosotros/', label: 'Nosotros' },
  { href: '/programas/', label: 'Programas' },
  { href: '/galeria/', label: 'Galería' },
  { href: '/como-ayudar/', label: 'Cómo ayudar' },
  { href: '/contacto/', label: 'Contacto' },
];

/** Compara rutas ignorando la barra final, para marcar la página actual en la navegación. */
export function isCurrentPath(current: string, href: string): boolean {
  const normalize = (p: string) => (p.length > 1 ? p.replace(/\/+$/, '') : p);
  return normalize(current) === normalize(href);
}
