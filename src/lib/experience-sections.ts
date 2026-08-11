/**
 * Secciones de experiencias — las categorías del megamenú y las pestañas del
 * listado de planes. CMS-ready: se derivan de service-categories.json
 * (generado desde Supabase, ver scripts/generate-content.mjs), filtradas a
 * las que deben aparecer en el menú de navegación (showInNav).
 */
import serviceCategoriesData from "@/data/service-categories.json";

interface ServiceCategoryRow {
  id: string;
  label: string;
  subtitle: string;
  showInNav: boolean;
}

export const EXPERIENCE_SECTIONS = (serviceCategoriesData as ServiceCategoryRow[])
  .filter((c) => c.showInNav)
  .map((c) => ({
    id: c.id,
    label: c.label,
    title: c.label,
    subtitle: c.subtitle,
  }));

export type ExperienceSectionId = (typeof EXPERIENCE_SECTIONS)[number]["id"];

export const DEFAULT_EXPERIENCE_SECTION: ExperienceSectionId =
  (EXPERIENCE_SECTIONS[0]?.id as ExperienceSectionId) ?? "internacionales";
