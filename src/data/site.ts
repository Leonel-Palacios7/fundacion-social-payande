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
    'La Fundación Payandé acompaña a niñas, niños, jóvenes, familias y personas mayores de Payandé (San Luis, Tolima) con educación, recreación, vivienda digna y oportunidades.',
  locale: 'es_CO',
  /** Muestra avisos visibles en los textos que aún son de ejemplo. Poner en false al confirmar el contenido. */
  showProvisionalNotes: true,
  contact: {
    // PROVISIONAL: reemplazar por los datos reales de la Fundación.
    email: 'contacto@example.org',
    phoneDisplay: '+57 300 000 0000',
    phoneHref: '+573000000000',
    location: 'Payandé, San Luis, Tolima, Colombia',
    mapUrl: 'https://www.openstreetmap.org/search?query=Payand%C3%A9%2C%20San%20Luis%2C%20Tolima',
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
