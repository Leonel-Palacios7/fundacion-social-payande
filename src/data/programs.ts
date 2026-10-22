import type { PhotoCategory } from './photos.ts';

export interface Program {
  id: string;
  category: PhotoCategory;
  title: string;
  summary: string;
  description: string;
  actions: readonly string[];
  photoId: string;
}

/**
 * PROVISIONAL: líneas de acción deducidas de las fotografías del proyecto.
 * La Fundación debe confirmar nombres, alcance y descripción de cada programa.
 */
export const programs: readonly Program[] = [
  {
    id: 'educacion',
    category: 'educacion',
    title: 'Educación con dignidad',
    summary: 'Útiles, zapatos, morrales y pupitres para que nadie deje de estudiar por falta de recursos.',
    description:
      'Acompañamos a las escuelas rurales y urbanas de Payandé con kits escolares, calzado y dotación de aulas, para que niñas y niños estudien en mejores condiciones.',
    actions: ['Entrega de kits escolares y morrales', 'Calzado escolar', 'Dotación de pupitres y aulas', 'Libros y material de lectura'],
    photoId: 'slider-10',
  },
  {
    id: 'ninez',
    category: 'ninez',
    title: 'Niñez feliz',
    summary: 'Jornadas recreativas y celebraciones que llenan de alegría a la infancia de la región.',
    description:
      'Organizamos jornadas lúdicas, celebraciones de Navidad y entregas de juguetes que fortalecen los lazos entre las familias y la comunidad.',
    actions: ['Celebraciones navideñas', 'Jornadas recreativas', 'Entrega de juguetes'],
    photoId: 'slider-14',
  },
  {
    id: 'vivienda',
    category: 'vivienda',
    title: 'Vivienda digna y personas mayores',
    summary: 'Mejoramos cocinas y baños de familias y adultos mayores para vivir con más salud y seguridad.',
    description:
      'Adecuamos espacios esenciales del hogar, como cocinas y unidades sanitarias, priorizando a personas mayores y familias en situación de vulnerabilidad.',
    actions: ['Mejoramiento de cocinas', 'Construcción de baños', 'Acompañamiento a personas mayores'],
    photoId: 'slider-20',
  },
  {
    id: 'jovenes',
    category: 'jovenes',
    title: 'Jóvenes y deporte',
    summary: 'Formación deportiva y oportunidades para que los jóvenes construyan su proyecto de vida.',
    description:
      'Promovemos el deporte como herramienta de formación en valores y abrimos caminos de aprendizaje y empleo para los jóvenes del territorio.',
    actions: ['Escuela deportiva de golf', 'Formación de caddies', 'Dotación deportiva'],
    photoId: 'slider-4',
  },
  {
    id: 'comunidad',
    category: 'comunidad',
    title: 'Comunidad y alianzas',
    summary: 'Trabajamos de la mano con familias, voluntarios y empresas para multiplicar el impacto.',
    description:
      'Articulamos esfuerzos con aliados públicos y privados, voluntariado y líderes comunitarios para llegar a más hogares de la región.',
    actions: ['Voluntariado', 'Alianzas empresariales', 'Entregas comunitarias'],
    photoId: 'slider-16',
  },
];
