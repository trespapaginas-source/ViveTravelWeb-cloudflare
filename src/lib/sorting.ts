import type { NormalizedPlan, NormalizedCabin } from "@/lib/data-access";

/* ──────────────────── Tipos compartidos ──────────────────── */

export type ViewMode = "1" | "2" | "3";

export type SortOption =
  | "popular"
  | "price-asc"
  | "price-desc"
  | "duration-asc"
  | "duration-desc";

export const ITEMS_PER_PAGE = 12;

export const sortLabels: Record<SortOption, string> = {
  popular: "Más popular",
  "price-asc": "Menor precio primero",
  "price-desc": "Mayor precio primero",
  "duration-asc": "Menor duración primero",
  "duration-desc": "Mayor duración primero",
};

/** Opciones de orden para planes (incluye duración). */
export const planSortOptions: SortOption[] = [
  "popular",
  "price-asc",
  "price-desc",
  "duration-asc",
  "duration-desc",
];

/** Opciones de orden para cabañas (sin duración). */
export const cabinSortOptions: SortOption[] = ["popular", "price-asc", "price-desc"];

/* ──────────────────── Helpers de grid ──────────────────── */

/** Clases de grid CSS según el modo de vista (siempre 1 col en móvil). */
export function getGridCols(viewMode: ViewMode | string): string {
  switch (viewMode) {
    case "1":
      return "grid-cols-1";
    case "2":
      return "grid-cols-1 sm:grid-cols-2";
    case "3":
      return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
    default:
      return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
  }
}

/* ──────────────────── Funciones de orden ──────────────────── */

/** Extrae las horas de una cadena de duración ("Medio día (4 horas)" → 4). */
function parseDurationHours(duration: string | undefined): number {
  if (!duration) return 0;
  const m = duration.match(/(\d+)\s*hora/i);
  return m ? parseInt(m[1], 10) : 0;
}

/** Extrae los días de una cadena de duración ("5 días" → 5). */
function parseDurationDays(duration: string | undefined): number {
  if (!duration) return 0;
  const m = duration.match(/(\d+)\s*d[ií]a/i);
  return m ? parseInt(m[1], 10) : 0;
}

/** Score combinado de duración (días + horas/8) para ordenar. */
function durationScore(duration: string | undefined): number {
  return parseDurationDays(duration) * 10 + parseDurationHours(duration);
}

export function sortPlans(plans: NormalizedPlan[], option: SortOption): NormalizedPlan[] {
  const arr = [...plans];
  switch (option) {
    case "popular":
      return arr.sort((a, b) => b.reviewCount - a.reviewCount);
    case "price-asc":
      return arr.sort((a, b) => a.price - b.price);
    case "price-desc":
      return arr.sort((a, b) => b.price - a.price);
    case "duration-asc":
      return arr.sort((a, b) => durationScore(a.duration) - durationScore(b.duration));
    case "duration-desc":
      return arr.sort((a, b) => durationScore(b.duration) - durationScore(a.duration));
    default:
      return arr;
  }
}

export function sortCabins(
  cabins: NormalizedCabin[],
  option: SortOption
): NormalizedCabin[] {
  const arr = [...cabins];
  switch (option) {
    case "popular":
      return arr.sort((a, b) => b.reviewCount - a.reviewCount);
    case "price-asc":
      return arr.sort((a, b) => a.pricePerNight - b.pricePerNight);
    case "price-desc":
      return arr.sort((a, b) => b.pricePerNight - a.pricePerNight);
    default:
      return arr.sort((a, b) => b.reviewCount - a.reviewCount);
  }
}
