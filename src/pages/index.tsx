import { PagePlaceholder } from "@/pages/page-placeholder";

// Todas las páginas tienen ahora su propio archivo.
// Este módulo solo conserva el NotFoundPage placeholder.

export const NotFoundPage = () => (
  <PagePlaceholder
    eyebrow="404"
    title="Página no encontrada"
    description="La ruta solicitada no existe. Verifica el enlace o vuelve al inicio."
  />
);
