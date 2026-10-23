/**
 * Fuente única de verdad para los datos institucionales.
 * Todo lo marcado como `provisional` es contenido de ejemplo y debe
 * ser confirmado por la Fundación antes de publicar el sitio.
 */
export const site = {
  name: 'Fundación Social Payandé',
  shortName: 'Payandé',
  tagline: 'Transformando vidas con compromiso y solidaridad',
  description:
    'La Fundación Social Payandé mejora la calidad de vida, la educación, la salud, la vivienda y la recreación de personas de escasos recursos en Quebradanegra, Tobia y Villeta (Cundinamarca).',
  locale: 'es_CO',
  /** Muestra avisos visibles en los textos que aún son de ejemplo. Poner en false al confirmar el contenido. */
  showProvisionalNotes: true,
  contact: {
    // Datos oficiales entregados por Leonel (2026-10-23).
    email: 'direccion@fundacionpayande.com',
    phoneDisplay: '312 378 8070',
    phoneHref: '+573123788070',
    /** Dirección en dos líneas, tal como la usa la Fundación. */
    address: ['Km 75 vía Bogotá-Villeta, Vereda Pilones.', 'Quebradanegra, Cundinamarca.'],
    location: 'Vereda Pilones, Quebradanegra, Cundinamarca',
    /** Municipios donde trabaja la Fundación, según su sitio actual. */
    area: 'Quebradanegra, Tobia y Villeta',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Vereda%20Pilones%2C%20Quebradanegra%2C%20Cundinamarca',
    mapEmbedUrl: 'https://www.google.com/maps?q=Vereda%20Pilones%2C%20Quebradanegra%2C%20Cundinamarca&z=12&output=embed',
    provisional: false,
  },
} as const;

export interface SocialLink {
  id: 'facebook' | 'instagram' | 'x' | 'youtube' | 'whatsapp';
  label: string;
  /** Vacío mientras la Fundación no confirme sus cuentas: el ícono se muestra sin enlace. */
  href: string;
}

export const socialLinks: readonly SocialLink[] = [
  { id: 'facebook', label: 'Facebook', href: '' },
  { id: 'instagram', label: 'Instagram', href: '' },
  { id: 'x', label: 'X (Twitter)', href: '' },
  { id: 'youtube', label: 'YouTube', href: '' },
  { id: 'whatsapp', label: 'WhatsApp', href: '' },
];

export interface NavItem {
  href: string;
  label: string;
}

export const navItems: readonly NavItem[] = [
  { href: '/', label: 'Inicio' },
  { href: '/programas/', label: 'Programas' },
  { href: '/galeria/', label: 'Galería' },
  { href: '/contacto/', label: 'Contacto' },
];

/** Compara rutas ignorando la barra final, para marcar la página actual en la navegación. */
export function isCurrentPath(current: string, href: string): boolean {
  const normalize = (p: string) => (p.length > 1 ? p.replace(/\/+$/, '') : p);
  return normalize(current) === normalize(href);
}
