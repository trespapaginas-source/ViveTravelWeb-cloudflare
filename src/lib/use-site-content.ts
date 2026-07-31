import siteContent from "@/data/site-content.json";

export type SiteContent = typeof siteContent;

/**
 * Hook de acceso al contenido del sitio (textos editables).
 * En el proyecto de referencia se alimentaba desde TanStack Query + DB;
 * aquí consumimos el JSON estático directamente.
 */
export function useSiteContent() {
  return { content: siteContent as SiteContent };
}
