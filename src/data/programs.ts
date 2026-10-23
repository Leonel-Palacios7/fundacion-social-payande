import type { PhotoCategory } from './photos.ts';
import type { ServiceIcon } from './services.ts';

export interface Program {
  /** Igual al `id` del servicio: /programas/#<id> */
  id: string;
  icon: ServiceIcon;
  category: PhotoCategory;
  title: string;
  description: string;
  actions: readonly string[];
  photoId: string;
}

/**
 * Los seis programas son los servicios del sitio actual de la Fundación (src/data/services.ts).
 * PROVISIONAL: las descripciones y acciones se redactaron a partir de las fotografías;
 * la Fundación debe confirmarlas.
 */
export const programs: readonly Program[] = [
  {
    id: 'educacion',
    icon: 'educacion',
    category: 'educacion',
    title: 'Educación',
    description:
      'Entregamos kits escolares, morrales, calzado y dotación para las aulas, para que niñas, niños y jóvenes estudien en mejores condiciones.',
    actions: ['Kits escolares y morrales', 'Calzado escolar', 'Pupitres y dotación de aulas', 'Libros y material de lectura'],
    photoId: 'slider-10',
  },
  {
    id: 'plan-padrino',
    icon: 'padrino',
    category: 'ninez',
    title: 'Plan Padrino',
    description:
      'Creamos vínculos entre padrinos, madrinas y niñas y niños de la región para acompañar su crecimiento con regalos, celebraciones y apoyo en fechas especiales.',
    actions: ['Celebraciones de Navidad', 'Entrega de regalos y juguetes', 'Jornadas recreativas'],
    photoId: 'slider-14',
  },
  {
    id: 'salud',
    icon: 'salud',
    category: 'salud',
    title: 'Salud',
    description:
      'Llevamos brigadas de salud a la comunidad junto al Hospital Salazar de Villeta, para acercar la atención a quienes más la necesitan.',
    actions: ['Brigadas de salud', 'Atención en unidad móvil', 'Promoción de hábitos saludables'],
    photoId: 'brigada-salud',
  },
  {
    id: 'vivienda',
    icon: 'vivienda',
    category: 'vivienda',
    title: 'Vivienda',
    description:
      'Adecuamos cocinas y baños de familias y personas mayores en situación de vulnerabilidad, para que vivan con más salud y seguridad.',
    actions: ['Mejoramiento de cocinas', 'Construcción de baños', 'Acompañamiento a personas mayores'],
    photoId: 'slider-20',
  },
  {
    id: 'beneficiarios',
    icon: 'beneficiarios',
    category: 'comunidad',
    title: 'Beneficiarios',
    description:
      'Acompañamos de cerca a personas y familias de Quebradanegra, Tobia y Villeta con visitas, entregas y seguimiento a su desarrollo.',
    actions: ['Visitas a familias', 'Entregas comunitarias', 'Seguimiento a cada beneficiario'],
    photoId: 'slider-16',
  },
  {
    id: 'otros',
    icon: 'otros',
    category: 'jovenes',
    title: 'Otros',
    description:
      'Impulsamos iniciativas de deporte, cultura y formación que abren oportunidades para los jóvenes del territorio.',
    actions: ['Escuelas de golf y tenis', 'Formación de caddies', 'Dotación deportiva', 'Actividades culturales'],
    photoId: 'slider-4',
  },
];
