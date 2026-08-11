import { useMemo } from "react";
import { EXPERIENCE_SECTIONS } from "@/lib/experience-sections";
import { getPlanRegion, PLAN_REGIONS } from "@/lib/plan-regions";
import type { NormalizedPlan } from "@/lib/data-access";

/* ────────────────── Sección de experiencia del plan ────────────── */
// Campo explícito (plan.experienceSection, CMS-ready) — ya no se adivina
// por keywords en el texto. Ver TourPlan.experienceSection en lib/data.ts.

export type ExperienceId = (typeof EXPERIENCE_SECTIONS)[number]["id"];

export function getPlanExperienceSection(plan: NormalizedPlan): ExperienceId {
  return plan.experienceSection as ExperienceId;
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
  /** País/región (id de PLAN_REGIONS). undefined = todos. */
  country: string | undefined;
}

export const DEFAULT_FILTERS: PlanFilters = {
  section: "internacionales",
  search: "",
  priceMin: null,
  priceMax: null,
  maxDays: null,
  country: undefined,
};

/** Extrae los días numéricos de una cadena de duración ("5 días" → 5). */
export function parseDays(duration: string | undefined): number {
  if (!duration) return 0;
  const m = duration.match(/(\d+)\s*d[ií]a/i);
  return m ? parseInt(m[1], 10) : 0;
}

/**
 * Hook de filtrado de planes. Aplica sección + país + categoría + búsqueda +
 * precio + duración. Devuelve la lista filtrada, los rangos de precio, y las
 * opciones de país/categoría disponibles (para los dropdowns del panel).
 */
export function usePlanFilters(
  allPlans: NormalizedPlan[],
  filters: PlanFilters
) {
  return useMemo(() => {
    // Subset de la sección activa (base para calcular opciones y bounds).
    const sectionPlans = allPlans.filter(
      (p) => getPlanExperienceSection(p) === filters.section
    );

    const filtered = sectionPlans.filter((plan) => {
      // 1. País/región
      if (filters.country) {
        const region = getPlanRegion(plan);
        if (region.id !== filters.country) return false;
      }

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

    // Rangos de precio del subset de la sección (para el slider).
    const prices = sectionPlans.map((p) => p.price);
    const priceBounds =
      prices.length > 0
        ? { min: Math.min(...prices), max: Math.max(...prices) }
        : { min: 0, max: 0 };

    return {
      filtered,
      priceBounds,
      /** Regiones/países disponibles en la sección activa, agrupadas. */
      availableCountries: getAvailableCountries(sectionPlans),
    };
  }, [allPlans, filters]);
}

/**
 * Devuelve las regiones/países presentes en una lista de planes, agrupadas por
 * grupo (colombia / internacional) y ordenadas según PLAN_REGIONS.
 */
export function getAvailableCountries(plans: NormalizedPlan[]) {
  const seenIds = new Set<string>();
  for (const p of plans) {
    seenIds.add(getPlanRegion(p).id);
  }
  // Filtrar PLAN_REGIONS por los ids presentes, manteniendo el orden definido.
  return PLAN_REGIONS.filter((r) => seenIds.has(r.id));
}
