/**
 * Servicios que la Fundación presenta en su sitio actual (fundacionpayande.com).
 * Textos tomados de allí. `icon` elige el dibujo de ServiceGrid.astro.
 */
export type ServiceIcon = 'educacion' | 'padrino' | 'salud' | 'vivienda' | 'beneficiarios' | 'otros';

export interface Service {
  id: string;
  title: string;
  summary: string;
  icon: ServiceIcon;
}

export const services: readonly Service[] = [
  { id: 'educacion', title: 'Educación', summary: 'Generamos oportunidades de formación y crecimiento.', icon: 'educacion' },
  { id: 'plan-padrino', title: 'Plan Padrino', summary: 'Creamos vínculos de apoyo y transformación.', icon: 'padrino' },
  { id: 'salud', title: 'Salud', summary: 'Promovemos bienestar y una mejor calidad de vida.', icon: 'salud' },
  { id: 'vivienda', title: 'Vivienda', summary: 'Contribuimos a mejorar las condiciones de vida.', icon: 'vivienda' },
  { id: 'beneficiarios', title: 'Beneficiarios', summary: 'Acompañamos a personas y familias en su desarrollo.', icon: 'beneficiarios' },
  { id: 'otros', title: 'Otros', summary: 'Impulsamos iniciativas que generan bienestar y oportunidades.', icon: 'otros' },
];
