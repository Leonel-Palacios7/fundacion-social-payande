import type { ImageMetadata } from 'astro';

export type PhotoCategory = 'educacion' | 'ninez' | 'vivienda' | 'jovenes' | 'salud' | 'comunidad';

export interface Photo {
  id: string;
  src: ImageMetadata;
  alt: string;
  category: PhotoCategory;
}

export const categoryLabels: Record<PhotoCategory, string> = {
  educacion: 'Educación',
  ninez: 'Niñez y recreación',
  vivienda: 'Vivienda y personas mayores',
  jovenes: 'Jóvenes y deporte',
  salud: 'Salud',
  comunidad: 'Comunidad',
};

const files = import.meta.glob<{ default: ImageMetadata }>('../assets/photos/*.jpg', {
  eager: true,
});

function image(id: string): ImageMetadata {
  const mod = files[`../assets/photos/${id}.jpg`];
  if (!mod) throw new Error(`No existe la foto "${id}" en src/assets/photos`);
  return mod.default;
}

// Descripciones redactadas a partir de lo que se ve en cada foto.
const entries: ReadonlyArray<[id: string, category: PhotoCategory, alt: string]> = [
  ['portada-payande-2', 'educacion', 'Estudiantes y docentes posan en las gradas de la escuela con sus nuevos morrales.'],
  ['portada-sliders', 'ninez', 'Niñas, niños y familias sonríen en un salón decorado mientras muestran sus regalos.'],
  ['slider-2', 'ninez', 'Celebración de Navidad con decenas de niños y familias frente a globos verdes, rojos y blancos.'],
  ['portada-payande-1', 'ninez', 'Grupo numeroso de estudiantes con globos de colores en las gradas de la cancha escolar.'],
  ['portada-payande-3', 'ninez', 'Niñas y niños disfrazados posan frente a un inflable durante una jornada recreativa.'],
  ['slider-10', 'educacion', 'Una niña y un niño con uniforme levantan el pulgar junto a sus zapatos y kits escolares nuevos.'],
  ['slider-9', 'educacion', 'Niños sostienen un cartel hecho a mano que agradece a la Fundación por los útiles y los zapatos.'],
  ['slider-21', 'educacion', 'Estudiantes en su salón de clase con los regalos y útiles recibidos.'],
  ['slider-5', 'educacion', 'Niñas con uniforme muestran los libros que recibieron, acompañadas por su docente.'],
  ['slider-7', 'educacion', 'Aula con pupitres nuevos de color azul y estudiantes levantando la mano.'],
  ['slider-8', 'educacion', 'Un niño levanta el pulgar sentado en su pupitre nuevo dentro del salón.'],
  ['slider-18', 'educacion', 'Dos integrantes del equipo muestran los morrales que se entregan a los estudiantes.'],
  ['slider-14', 'ninez', 'Cinco niñas sonríen al aire libre abrazando las muñecas que recibieron.'],
  ['slider-11', 'vivienda', 'Una pareja de personas mayores en su cocina, junto a la estufa de leña.'],
  ['slider-12', 'vivienda', 'Una mujer y un hombre en su cocina con mesón de baldosa recién adecuado.'],
  ['slider-13', 'vivienda', 'Una mujer sonríe en su baño nuevo, con ducha y paredes enchapadas.'],
  ['slider-19', 'vivienda', 'Integrantes de la Fundación junto a una familia en su cocina mejorada.'],
  ['slider-20', 'vivienda', 'Una señora mayor con delantal en su cocina renovada, con lavaplatos y mesón nuevos.'],
  ['slider-15', 'vivienda', 'Una señora mayor muestra con alegría los libros para colorear que recibió.'],
  ['slider-3', 'jovenes', 'Grupo de jóvenes caddies con uniforme posa en un campo de golf rodeado de montañas.'],
  ['slider-4', 'jovenes', 'Jóvenes con camiseta verde sostienen sus palos de golf en una cancha de tierra.'],
  ['slider-16', 'comunidad', 'Entrega de regalos navideños a una familia en una casa con techo de palma.'],
  ['slider-17', 'comunidad', 'Integrante del equipo con camisa de la Fundación sostiene un regalo y un paquete.'],
  ['slider-6', 'comunidad', 'Equipo de cocina con uniforme blanco posa entre palmeras y jardines.'],
  ['morrales-payande', 'educacion', 'Estudiantes con uniforme muestran sus morrales nuevos de la Fundación junto a su docente.'],
  ['morrales-pulgar', 'educacion', 'Niñas y niños levantan el pulgar con sus morrales nuevos junto al pendón de bienvenida de la Fundación.'],
  ['morrales-mural', 'educacion', 'Niños con morrales nuevos posan frente a un mural de un colibrí, junto al pendón de la Fundación.'],
  ['morrales-ninas', 'educacion', 'Niñas pequeñas sonríen con sus morrales de colores junto a su docente y el pendón de la Fundación.'],
  ['kit-escolar', 'educacion', 'Integrante del equipo sostiene un kit escolar y un uniforme listos para entregar.'],
  ['grupo-gradas', 'ninez', 'Niñas y niños con camiseta azul posan en las gradas junto al pendón «Bienvenidos» de la Fundación.'],
  ['centro-cultural', 'comunidad', 'Grupo numeroso de jóvenes posa frente al Centro Cultural Hugo Garzón, decorado con flores de colores.'],
  ['brigada-salud', 'salud', 'Personal de salud posa frente a la unidad móvil del Hospital Salazar de Villeta durante una brigada.'],
  ['jornada-tenis', 'jovenes', 'Jóvenes deportistas muestran sus zapatos nuevos en una cancha de tenis rodeada de montañas.'],
  ['clase-golf', 'jovenes', 'Un instructor da una clase de golf a un grupo numeroso de jóvenes en el campo.'],
  ['futbol-zapatos', 'jovenes', 'Dos niños con uniforme de fútbol sostienen las cajas de sus guayos nuevos en la cancha.'],
  ['cancha-microfutbol', 'jovenes', 'Niños con ropa deportiva sentados en el centro de una cancha cubierta de microfútbol.'],
  ['baloncesto', 'jovenes', 'Jóvenes con balones de baloncesto posan junto a integrantes de la Fundación.'],
  ['cocina-nueva', 'vivienda', 'Cocina adecuada con mesón enchapado en baldosa blanca y lavaplatos nuevo.'],
  ['bano-nuevo', 'vivienda', 'Baño nuevo con sanitario, lavamanos y paredes enchapadas en blanco.'],
];

export const photos: readonly Photo[] = entries.map(([id, category, alt]) => ({
  id,
  src: image(id),
  alt,
  category,
}));

export function getPhoto(id: string): Photo {
  const photo = photos.find((p) => p.id === id);
  if (!photo) throw new Error(`Foto no catalogada: ${id}`);
  return photo;
}
