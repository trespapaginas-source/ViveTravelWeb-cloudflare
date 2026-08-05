import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from "lucide-react";
import { usePlanes } from "@/hooks/use-plans";
import {
  usePlanFilters,
  DEFAULT_FILTERS,
  type PlanFilters,
  type ExperienceId,
} from "@/hooks/use-plan-filters";
import { EXPERIENCE_SECTIONS } from "@/lib/experience-sections";
import type { PlanRegion } from "@/lib/plan-regions";
import { formatPrice, cn } from "@/lib/utils";
import { useSiteContent } from "@/lib/use-site-content";
import { PlanCard, PlanCardHorizontal } from "@/components/plans/plan-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ListToolbar } from "@/components/shared/list-toolbar";
import {
  type ViewMode,
  type SortOption,
  planSortOptions,
  getGridCols,
  sortPlans,
  ITEMS_PER_PAGE,
} from "@/lib/sorting";

/**
 * PlansPage — catálogo de experiencias con filtros, view modes y orden.
 */
export function PlansPage() {
  const { data: plans, isLoading } = usePlanes();
  const { content } = useSiteContent();
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState<PlanFilters>(() => {
    const categoria = searchParams.get("categoria") as ExperienceId | null;
    const destino = searchParams.get("destino") ?? "";
    return {
      ...DEFAULT_FILTERS,
      section: categoria && EXPERIENCE_SECTIONS.some((s) => s.id === categoria)
        ? categoria
        : DEFAULT_FILTERS.section,
      search: destino,
    };
  });

  // Vista y orden (con defaults: grid 3 cols, orden por popularidad).
  const [viewMode, setViewMode] = useState<ViewMode>("3");
  const [sortOption, setSortOption] = useState<SortOption>("popular");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  useEffect(() => {
    const next = new URLSearchParams();
    next.set("categoria", filters.section);
    if (filters.search.trim()) next.set("destino", filters.search.trim());
    setSearchParams(next, { replace: true });
  }, [filters.section, filters.search, setSearchParams]);

  const { filtered, priceBounds, availableCountries, availableCategories } =
    usePlanFilters(plans, filters);

  // Ordenar resultados.
  const sorted = useMemo(
    () => sortPlans(filtered, sortOption),
    [filtered, sortOption]
  );

  // Reset de paginación al cambiar filtros/orden/sección.
  useEffect(
    () => setCurrentPage(1),
    [filters.section, filters.search, filters.country, filters.category, sortOption]
  );

  // Paginación.
  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const paginated = sorted.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const update = (patch: Partial<PlanFilters>) =>
    setFilters((f) => ({ ...f, ...patch }));

  const resetFilters = () =>
    setFilters((f) => ({ ...DEFAULT_FILTERS, section: f.section }));

  const copy = content.plansList;
  const gridCols = getGridCols(viewMode);
  const isHorizontal = viewMode === "1";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          {copy.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{copy.subtitle}</p>
      </div>

      {/* Tabs de sección */}
      <div className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1">
        {EXPERIENCE_SECTIONS.map((section) => (
          <button
            key={section.id}
            onClick={() =>
              update({ section: section.id, country: undefined, category: undefined })
            }
            className={cn(
              "whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              filters.section === section.id
                ? "bg-neutral-900 text-white shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-accent"
            )}
          >
            {section.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Sidebar de filtros (desktop) */}
        <aside className="hidden lg:block">
          <FiltersPanel
            filters={filters}
            priceBounds={priceBounds}
            availableCountries={availableCountries}
            availableCategories={availableCategories}
            onUpdate={update}
            onReset={resetFilters}
          />
        </aside>

        <div>
          {/* Barra de acciones móvil */}
          <div className="mb-4 flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setShowFiltersMobile(true)}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filtros
            </button>
          </div>

          {/* Toolbar: vista + orden + conteo */}
          <div className="mb-4">
            <ListToolbar
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              sortOption={sortOption}
              onSortOptionChange={setSortOption}
              sortOptions={planSortOptions}
              resultCount={sorted.length}
              resultLabel={`experiencia${sorted.length !== 1 ? "s" : ""}`}
            />
          </div>

          {/* Grid de resultados */}
          {isLoading ? (
            <PlansSkeleton />
          ) : paginated.length === 0 ? (
            <EmptyState onReset={resetFilters} />
          ) : (
            <div className={cn("grid gap-5 sm:gap-6", gridCols)}>
              {paginated.map((plan, i) => (
                <div key={plan.id} className={cn("animate-fade-up", `stagger-${Math.min(i + 1, 6)}`)}>
                  {isHorizontal ? (
                    <PlanCardHorizontal plan={plan} />
                  ) : (
                    <PlanCard plan={plan} />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={cn(
                    "h-9 w-9 rounded-lg text-sm font-medium transition-colors",
                    currentPage === i + 1
                      ? "bg-neutral-900 text-white"
                      : "border border-border hover:bg-accent"
                  )}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Panel de filtros móvil */}
      {showFiltersMobile && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowFiltersMobile(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-auto rounded-t-3xl bg-background p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Filtros</h2>
              <button
                onClick={() => setShowFiltersMobile(false)}
                className="rounded-full p-1 hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <FiltersPanel
              filters={filters}
              priceBounds={priceBounds}
              availableCountries={availableCountries}
              availableCategories={availableCategories}
              onUpdate={update}
              onReset={resetFilters}
            />
            <button
              onClick={() => setShowFiltersMobile(false)}
              className="mt-5 w-full rounded-xl bg-neutral-900 py-3 text-sm font-semibold text-white"
            >
              Ver {sorted.length} resultados
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────── Panel de filtros ─────────────────────── */

function FiltersPanel({
  filters,
  priceBounds,
  availableCountries,
  availableCategories,
  onUpdate,
  onReset,
}: {
  filters: PlanFilters;
  priceBounds: { min: number; max: number };
  availableCountries: (PlanRegion & { matched?: boolean })[];
  availableCategories: string[];
  onUpdate: (patch: Partial<PlanFilters>) => void;
  onReset: () => void;
}) {
  const durationOptions = [
    { label: "Cualquier duración", value: null },
    { label: "Hasta 1 día", value: 1 },
    { label: "Hasta 3 días", value: 3 },
    { label: "Hasta 5 días", value: 5 },
    { label: "Hasta 7 días", value: 7 },
  ];

  // Agrupar regiones por grupo (colombia / internacional) para el dropdown.
  const colombiaRegions = availableCountries.filter((r) => r.group === "colombia");
  const intlRegions = availableCountries.filter((r) => r.group === "internacional");

  return (
    <div className="space-y-6 rounded-2xl border border-border bg-card p-5">
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Destino
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onUpdate({ search: e.target.value })}
            placeholder="¿A dónde viajas?"
            className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-neutral-900"
          />
        </div>
      </div>

      {/* País / Región */}
      {availableCountries.length > 0 && (
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            País / Región
          </label>
          <select
            value={filters.country ?? ""}
            onChange={(e) =>
              onUpdate({ country: e.target.value || undefined })
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-neutral-900"
          >
            <option value="">Todos los destinos</option>
            {colombiaRegions.length > 0 && (
              <optgroup label="Colombia">
                {colombiaRegions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </optgroup>
            )}
            {intlRegions.length > 0 && (
              <optgroup label="Internacional">
                {intlRegions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>
      )}

      {/* Categoría específica */}
      {availableCategories.length > 0 && (
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Tipo de experiencia
          </label>
          <select
            value={filters.category ?? ""}
            onChange={(e) =>
              onUpdate({ category: e.target.value || undefined })
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-neutral-900"
          >
            <option value="">Todas las categorías</option>
            {availableCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Precio máximo
        </label>
        <input
          type="range"
          min={priceBounds.min}
          max={priceBounds.max}
          step={100000}
          value={filters.priceMax ?? priceBounds.max}
          onChange={(e) =>
            onUpdate({
              priceMax:
                Number(e.target.value) >= priceBounds.max
                  ? null
                  : Number(e.target.value),
            })
          }
          className="w-full accent-neutral-900"
        />
        <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
          <span>{formatPrice(priceBounds.min)}</span>
          <span className="font-semibold text-foreground">
            {filters.priceMax === null ? "Sin límite" : formatPrice(filters.priceMax)}
          </span>
          <span>{formatPrice(priceBounds.max)}</span>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Duración
        </label>
        <div className="space-y-1.5">
          {durationOptions.map((opt) => (
            <button
              key={String(opt.value)}
              onClick={() => onUpdate({ maxDays: opt.value })}
              className={cn(
                "block w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors",
                filters.maxDays === opt.value
                  ? "bg-neutral-100 font-semibold text-neutral-900"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onReset}
        className="w-full rounded-lg border border-border py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
      >
        Limpiar filtros
      </button>
    </div>
  );
}

function PlansSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-border">
          <div className="aspect-[16/10] bg-muted" />
          <div className="space-y-2 p-4">
            <div className="h-4 w-3/4 rounded bg-muted" />
            <div className="h-3 w-1/2 rounded bg-muted" />
            <div className="h-3 w-full rounded bg-muted" />
            <div className="h-6 w-1/3 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
