/**
 * Servicios que la Fundación presenta en su sitio actual (fundacionpayande.com).
 * Textos tomados de allí; las fotos son las del proyecto que mejor se ajustan a cada uno.
 */
export interface Service {
  id: string;
  title: string;
  summary: string;
  photoId: string;
  href: string;
}

export const services: readonly Service[] = [
  {
    id: 'educacion',
    title: 'Educación',
    summary: 'Generamos oportunidades de formación y crecimiento.',
    photoId: 'slider-10',
    href: '/programas/#educacion',
  },
  {
    id: 'plan-padrino',
    title: 'Plan Padrino',
    summary: 'Creamos vínculos de apoyo y transformación.',
    photoId: 'slider-14',
    href: '/como-ayudar/',
  },
  {
    id: 'salud',
    title: 'Salud',
    summary: 'Promovemos bienestar y una mejor calidad de vida.',
    photoId: 'slider-15',
    href: '/programas/',
  },
  {
    id: 'vivienda',
    title: 'Vivienda',
    summary: 'Contribuimos a mejorar las condiciones de vida.',
    photoId: 'slider-20',
    href: '/programas/#vivienda',
  },
  {
    id: 'beneficiarios',
    title: 'Beneficiarios',
    summary: 'Acompañamos a personas y familias en su desarrollo.',
    photoId: 'slider-16',
    href: '/programas/',
  },
  {
    id: 'otros',
    title: 'Otros',
    summary: 'Impulsamos iniciativas que generan bienestar y oportunidades.',
    photoId: 'slider-4',
    href: '/programas/',
  },
];
