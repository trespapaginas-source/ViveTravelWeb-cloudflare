/**
 * Secciones de experiencias — las 6 categorías del megamenú y las pestañas
 * del listado de planes. Extraído 1:1 del proyecto de referencia.
 */
export const EXPERIENCE_SECTIONS = [
  {
    id: "internacionales",
    label: "Planes Internacionales",
    title: "Planes Internacionales",
    subtitle:
      "Escapadas fuera de Colombia con enfoque en descanso, playa y experiencias memorables.",
  },
  {
    id: "nacionales",
    label: "Planes Nacionales",
    title: "Planes Nacionales",
    subtitle:
      "Viajes de varios días por Colombia, organizados para descubrir nuevos destinos.",
  },
  {
    id: "circuitos",
    label: "Circuitos",
    title: "Circuitos",
    subtitle:
      "Grandes recorridos y circuitos turísticos organizados para vivir múltiples destinos.",
  },
  {
    id: "pasadias",
    label: "Pasadías",
    title: "Pasadías",
    subtitle:
      "Experiencias de un día para disfrutar playas, naturaleza, aventura y cultura.",
  },
  {
    id: "grupales",
    label: "Viajes Grupales",
    title: "Viajes Grupales",
    subtitle: "Viajes de un día para grupos, equipos, familias y comunidades.",
  },
  {
    id: "tours",
    label: "Actividades",
    title: "Actividades",
    subtitle:
      "Experiencias y actividades cortas para complementar tu estadía en la ciudad.",
  },
] as const;

export type ExperienceSectionId = (typeof EXPERIENCE_SECTIONS)[number]["id"];

export const DEFAULT_EXPERIENCE_SECTION: ExperienceSectionId = "internacionales";
