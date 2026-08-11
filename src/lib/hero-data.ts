/**
 * Datos del buscador del Hero — CMS-ready: las pestañas y los destinos
 * sugeridos se generan desde Supabase (ver scripts/generate-content.mjs) en
 * service-categories.json / popular-destinations.json, no están hardcodeados.
 */
import serviceCategoriesData from "@/data/service-categories.json";
import popularDestinationsData from "@/data/popular-destinations.json";

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

interface ServiceCategoryRow {
  id: string;
  label: string;
  showInHero: boolean;
}

/** Pestañas del buscador — orden y visibilidad definidos en el CMS. */
export const SEARCH_TABS: SearchTabDef[] = (
  serviceCategoriesData as ServiceCategoryRow[]
)
  .filter((c) => c.showInHero)
  .map((c) => ({ id: c.id as SearchTab, label: c.label }));

export const DEFAULT_TAB: SearchTab = SEARCH_TABS[0]?.id ?? "internacionales";

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

/** Destinos sugeridos por pestaña — orden definido en el CMS. */
export const POPULAR_DESTINATIONS: Record<Exclude<SearchTab, "grupales">, string[]> = (() => {
  const grouped = {} as Record<Exclude<SearchTab, "grupales">, string[]>;
  for (const { categoryId, name } of popularDestinationsData as { categoryId: string; name: string }[]) {
    const key = categoryId as Exclude<SearchTab, "grupales">;
    (grouped[key] ??= []).push(name);
  }
  return grouped;
})();

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
