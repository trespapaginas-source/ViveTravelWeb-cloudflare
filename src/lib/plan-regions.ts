/**
 * Mapeo de país / región para planes turísticos.
 *
 * El id de región de cada plan (`plan.regionId`, CMS-ready) es un campo
 * explícito — este módulo solo resuelve ese id a su label/group para la UI
 * (dropdowns de filtro), leyendo el catálogo generado desde el CMS.
 */
import regionsData from "@/data/plan-regions.json";

export interface PlanRegion {
  id: string;
  label: string;
  /** Grupo para el dropdown: regiones de Colombia o Internacional. */
  group: "colombia" | "internacional";
}

/** Catálogo de regiones/países, en el orden definido por el CMS. */
export const PLAN_REGIONS: PlanRegion[] = regionsData as PlanRegion[];

const REGIONS_BY_ID = new Map(PLAN_REGIONS.map((r) => [r.id, r]));

/** Resuelve el label/group de la región explícita de un plan (plan.regionId). */
export function getPlanRegion(plan: { regionId?: string }): PlanRegion & { matched: boolean } {
  const region = plan.regionId ? REGIONS_BY_ID.get(plan.regionId) : undefined;
  if (region) return { ...region, matched: true };
  return { id: "otro", label: "Sin región definida", group: "internacional", matched: false };
}
