/**
 * Datos del buscador del Hero — extraídos del componente de referencia.
 * Define las pestañas, listas de ciudades y destinos sugeridos por categoría.
 */

export type SearchTab =
  | "internacionales"
  | "nacionales"
  | "circuitos"
  | "pasadias"
  | "grupales"
  | "alojamientos"
  | "tours";

export interface SearchTabDef {
  id: SearchTab;
  label: string;
}

/** Pestañas del buscador (orden y etiquetas exactas del original). */
export const SEARCH_TABS: SearchTabDef[] = [
  { id: "internacionales", label: "Planes Internacionales" },
  { id: "nacionales", label: "Planes Nacionales" },
  { id: "circuitos", label: "Circuitos" },
  { id: "pasadias", label: "Pasadías" },
  { id: "grupales", label: "Viajes Grupales" },
  { id: "alojamientos", label: "Cabañas" },
  { id: "tours", label: "Actividades" },
];

export const DEFAULT_TAB: SearchTab = "internacionales";

/** Ciudades origen para el autocompletado. */
export const CITIES = [
  "Cartagena",
  "Santa Marta",
  "San Andrés Islas",
  "Barranquilla",
  "Eje Cafetero",
  "Cancún",
  "Punta Cana",
];

/** Destinos sugeridos por pestaña (featured + optional). */
export const POPULAR_DESTINATIONS: Record<
  Exclude<SearchTab, "grupales">,
  { featured: string[]; optional: string[] }
> = {
  internacionales: {
    featured: ["Punta Cana", "Cancún", "Panamá", "Brasil", "Curazao"],
    optional: ["Aruba", "Miami", "Orlando", "Madrid", "París"],
  },
  nacionales: {
    featured: ["San Andrés", "Cartagena", "Eje Cafetero", "Santa Marta", "Medellín"],
    optional: ["Guatapé", "Barichara", "Caño Cristales", "Amazonas", "Nuquí"],
  },
  circuitos: {
    featured: [
      "Eurotrip Clásico",
      "España y Portugal",
      "Italia Completa",
      "Japón Esencial",
      "Turquía y Dubái",
    ],
    optional: [
      "Egipto y Turquía",
      "Grecia e Islas Griegas",
      "Sudeste Asiático",
      "Reino Unido e Irlanda",
      "Escandinavia",
    ],
  },
  pasadias: {
    featured: ["Playa Blanca", "Barú", "Islas del Rosario", "Santa Verónica", "Minca"],
    optional: ["Tayrona", "Luruaco", "Sabanilla", "Puerto Colombia", "Cabo de la Vela"],
  },
  alojamientos: {
    featured: ["Santa Verónica", "Puerto Colombia", "Minca", "Tayrona", "Barú"],
    optional: ["Palomino", "Coveñas", "San Andrés", "Cartagena", "Eje Cafetero"],
  },
  tours: {
    featured: ["Paracaidismo", "Buceo", "Tour del Café", "Parque Tayrona", "Ciudad Perdida"],
    optional: [
      "Snorkel en Barú",
      "Kayak en Mallorquín",
      "Tour Histórico",
      "Cabalgata",
      "Kitesurf",
    ],
  },
};

/** Placeholder del input de destino según la pestaña activa. */
export function getDestinationPlaceholder(tab: SearchTab): string {
  switch (tab) {
    case "internacionales":
      return "¿A qué país viajas?";
    case "nacionales":
      return "¿Qué destino de Colombia buscas?";
    case "circuitos":
      return "¿Qué circuito deseas realizar?";
    case "pasadias":
      return "¿A qué playa o destino vas hoy?";
    case "tours":
      return "¿En qué ciudad quieres hacer la actividad?";
    case "alojamientos":
      return "¿En qué zona te hospedarás?";
    case "grupales":
      return "Selecciona el viaje grupal";
    default:
      return "¿A dónde viajas?";
  }
}

/** Pestañas que manejan habitaciones (check-in/check-out + rooms). */
export const ROOM_TABS: SearchTab[] = [
  "internacionales",
  "nacionales",
  "circuitos",
  "alojamientos",
];

/** Opciones del tipo de viajero (solo pestaña grupales). */
export const TRAVELER_TYPES = [
  "Cualquiera",
  "Solo",
  "En Pareja",
  "En Familia",
  "Con Amigos",
];
