import { SearchX, RotateCcw } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  onReset?: () => void;
  resetLabel?: string;
}

/**
 * Estado vacío reutilizable: se muestra cuando un filtro no arroja resultados.
 */
export function EmptyState({
  title = "No se encontraron ofertas para tu búsqueda",
  description = "Prueba ajustando los filtros o limpiando la búsqueda para ver más opciones.",
  onReset,
  resetLabel = "Limpiar filtros",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <SearchX className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-bold text-foreground">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {onReset && (
        <button
          onClick={onReset}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-ocean px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ocean-dark"
        >
          <RotateCcw className="h-4 w-4" />
          {resetLabel}
        </button>
      )}
    </div>
  );
}
