/**
 * Eventos y jornadas de la Fundación.
 * La primera fecha (31 de octubre, Villeta) viene del sitio actual de la Fundación.
 * PROVISIONAL: el resto describe jornadas que aparecen en las fotos; falta confirmar fechas y lugares.
 */
export interface FoundationEvent {
  id: string;
  /** Texto corto del distintivo sobre la foto: una fecha o una temporada. */
  badge: string;
  /** Fecha en formato ISO, solo cuando es una fecha concreta. */
  date?: string;
  place: string;
  title: string;
  text: string;
  photoId: string;
}

export const events: readonly FoundationEvent[] = [
  {
    id: 'proxima-jornada',
    badge: '31 Oct',
    date: '2026-10-31',
    place: 'Villeta, Cundinamarca',
    title: 'Próxima jornada',
    text: 'Nuestro próximo encuentro con la comunidad de Villeta. Muy pronto compartiremos todos los detalles.',
    photoId: 'slider-2',
  },
  {
    id: 'kits-escolares',
    badge: 'Inicio escolar',
    place: 'Escuelas de la región',
    title: 'Entrega de útiles y zapatos',
    text: 'Kits escolares, morrales y calzado para que niñas y niños estudien en mejores condiciones.',
    photoId: 'slider-10',
  },
  {
    id: 'navidad',
    badge: 'Diciembre',
    place: 'Quebradanegra, Tobia y Villeta',
    title: 'Celebración de Navidad',
    text: 'Regalos, música y alegría compartida con las familias de nuestras comunidades.',
    photoId: 'portada-sliders',
  },
  {
    id: 'vivienda',
    badge: 'Todo el año',
    place: 'Hogares de la región',
    title: 'Mejoramiento de vivienda',
    text: 'Adecuamos cocinas y baños para que más familias vivan con salud y dignidad.',
    photoId: 'slider-19',
  },
  {
    id: 'recreacion',
    badge: 'Vacaciones',
    place: 'Escuelas de la región',
    title: 'Jornada recreativa',
    text: 'Disfraces, juegos e inflables para celebrar la niñez y fortalecer los lazos comunitarios.',
    photoId: 'portada-payande-3',
  },
  {
    id: 'deporte',
    badge: 'Fines de semana',
    place: 'Campo de práctica',
    title: 'Escuela deportiva',
    text: 'Formación deportiva y en valores para que los jóvenes construyan su proyecto de vida.',
    photoId: 'slider-3',
  },
];
