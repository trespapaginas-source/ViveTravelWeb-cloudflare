import { useMemo } from "react";
import { EXPERIENCE_SECTIONS } from "@/lib/experience-sections";
import type { NormalizedPlan } from "@/lib/data-access";

/* ────────────────── Clasificador de sección de experiencia ────────────── */
// Réplica del getPlanExperienceSection del proyecto de referencia: asigna
// cada plan a una de las 6 categorías de experiencia según su contenido.

export type ExperienceId = (typeof EXPERIENCE_SECTIONS)[number]["id"];

export function getPlanExperienceSection(plan: NormalizedPlan): ExperienceId {
  const category = plan.category?.toLowerCase() ?? "";
  const searchable = [
    plan.name,
    plan.category,
    plan.duration,
    plan.location,
    plan.shortDescription,
    plan.fullDescription,
  ]
    .join(" ")
    .toLowerCase();

  if (category.includes("circuito") || searchable.includes("circuito"))
    return "circuitos";
  if (
    category.includes("internacional") ||
    searchable.includes("internacional") ||
    searchable.includes("cancún") ||
    searchable.includes("cancun") ||
    searchable.includes("punta cana") ||
    searchable.includes("san andrés") ||
    searchable.includes("río de janeiro") ||
    searchable.includes("rio de janeiro") ||
    searchable.includes("brasil")
  )
    return "internacionales";
  if (
    category.includes("grupal") ||
    searchable.includes("grupal") ||
    searchable.includes("grupo") ||
    searchable.includes("sierra limón")
  )
    return "grupales";
  if (
    category.includes("nacional") ||
    searchable.includes("nacional") ||
    /\b[2-9]\s*d[ií]as\b/.test(searchable) ||
    searchable.includes("eje cafetero") ||
    searchable.includes("tayrona")
  )
    return "nacionales";
  if (
    category.includes("tour") ||
    (searchable.includes("tour") &&
      (searchable.includes("paracaidismo") ||
        searchable.includes("buceo") ||
        searchable.includes("corto")))
  )
    return "tours";
  return "pasadias";
}

/* ──────────────────────── Estado de filtros ───────────────────────────── */

export interface PlanFilters {
  /** Sección de experiencia activa (tab). */
  section: ExperienceId;
  /** Texto de búsqueda (destino) — viene del buscador del home. */
  search: string;
  /** Rango de precio [min, max] en COP. null = sin límite. */
  priceMin: number | null;
  priceMax: number | null;
  /** Duración máxima en días. null = sin límite. */
  maxDays: number | null;
}

export const DEFAULT_FILTERS: PlanFilters = {
  section: "internacionales",
  search: "",
  priceMin: null,
  priceMax: null,
  maxDays: null,
};

/** Extrae los días numéricos de una cadena de duración ("5 días" → 5). */
export function parseDays(duration: string | undefined): number {
  if (!duration) return 0;
  const m = duration.match(/(\d+)\s*d[ií]a/i);
  return m ? parseInt(m[1], 10) : 0;
}

/**
 * Hook de filtrado de planes. Aplica sección + búsqueda + precio + duración.
 * Devuelve la lista filtrada y los rangos de precio disponibles (para el slider).
 */
export function usePlanFilters(
  allPlans: NormalizedPlan[],
  filters: PlanFilters
) {
  return useMemo(() => {
    const filtered = allPlans.filter((plan) => {
      // 1. Sección de experiencia
      if (getPlanExperienceSection(plan) !== filters.section) return false;

      // 2. Búsqueda por destino/nombre (case-insensitive, coincide parcial)
      if (filters.search.trim()) {
        const q = filters.search.trim().toLowerCase();
        const haystack = [
          plan.name,
          plan.location,
          plan.shortDescription,
          plan.category,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      // 3. Rango de precio
      if (filters.priceMin !== null && plan.price < filters.priceMin)
        return false;
      if (filters.priceMax !== null && plan.price > filters.priceMax)
        return false;

      // 4. Duración máxima
      if (filters.maxDays !== null) {
        const days = parseDays(plan.duration);
        if (days > filters.maxDays) return false;
      }

      return true;
    });

    // Rangos de precio del subset actual de la sección (para el slider).
    const sectionPlans = allPlans.filter(
      (p) => getPlanExperienceSection(p) === filters.section
    );
    const prices = sectionPlans.map((p) => p.price);
    const priceBounds =
      prices.length > 0
        ? { min: Math.min(...prices), max: Math.max(...prices) }
        : { min: 0, max: 0 };

    return { filtered, priceBounds };
  }, [allPlans, filters]);
}
