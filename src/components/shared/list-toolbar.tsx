import { LayoutList, Grid3X3, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type ViewMode,
  type SortOption,
  sortLabels,
  planSortOptions,
} from "@/lib/sorting";

interface ListToolbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sortOption: SortOption;
  onSortOptionChange: (option: SortOption) => void;
  sortOptions?: SortOption[];
  resultCount: number;
  resultLabel: string;
}

/**
 * ListToolbar — barra con selector de vista (lista/grid) + orden.
 * Réplica del componente del proyecto de referencia.
 */
export function ListToolbar({
  viewMode,
  onViewModeChange,
  sortOption,
  onSortOptionChange,
  sortOptions = planSortOptions,
  resultCount,
  resultLabel,
}: ListToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {/* Conteo de resultados */}
      <span className="text-xs text-muted-foreground">
        {resultCount} {resultLabel}
      </span>

      <div className="flex items-center gap-2">
        {/* Orden */}
        <div className="relative flex items-center">
          <ArrowUpDown className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <select
            value={sortOption}
            onChange={(e) => onSortOptionChange(e.target.value as SortOption)}
            className="h-8 min-w-[180px] appearance-none rounded-md border border-border bg-background py-1 pl-8 pr-3 text-xs text-foreground outline-none focus:border-ocean"
          >
            {sortOptions.map((opt) => (
              <option key={opt} value={opt}>
                {sortLabels[opt]}
              </option>
            ))}
          </select>
        </div>

        {/* Selector de vista: 1 col (lista) | 3 cols (grid) */}
        <div className="flex items-center overflow-hidden rounded-md border border-border">
          <button
            onClick={() => onViewModeChange("1")}
            aria-label="Vista de lista"
            className={cn(
              "flex h-8 w-8 items-center justify-center transition-colors",
              viewMode === "1"
                ? "bg-zinc-900 text-white"
                : "bg-background text-muted-foreground hover:bg-accent"
            )}
          >
            <LayoutList className="h-4 w-4" />
          </button>
          <button
            onClick={() => onViewModeChange("3")}
            aria-label="Vista de cuadrícula"
            className={cn(
              "hidden h-8 w-8 items-center justify-center transition-colors sm:flex",
              viewMode === "3"
                ? "bg-zinc-900 text-white"
                : "bg-background text-muted-foreground hover:bg-accent"
            )}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
