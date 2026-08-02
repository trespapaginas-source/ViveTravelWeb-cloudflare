import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useCabanas } from "@/hooks/use-plans";
import { useSiteContent } from "@/lib/use-site-content";
import { cn } from "@/lib/utils";
import { CabinCard, CabinCardHorizontal } from "@/components/cabins/cabin-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ListToolbar } from "@/components/shared/list-toolbar";
import {
  type ViewMode,
  type SortOption,
  cabinSortOptions,
  getGridCols,
  sortCabins,
  ITEMS_PER_PAGE,
} from "@/lib/sorting";

/**
 * CabinsPage — catálogo de cabañas con filtros, view modes y orden.
 */
export function CabinsPage() {
  const { data: cabins, isLoading } = useCabanas();
  const { content } = useSiteContent();
  const [searchParams] = useSearchParams();
  const copy = content.cabinsList;

  const [search, setSearch] = useState(() => searchParams.get("destino") ?? "");
  const [location, setLocation] = useState<string>("all");
  // Cabañas: default vista de lista (como en el original).
  const [viewMode, setViewMode] = useState<ViewMode>("1");
  const [sortOption, setSortOption] = useState<SortOption>("popular");
  const [currentPage, setCurrentPage] = useState(1);

  const locations = useMemo(
    () => Array.from(new Set(cabins.map((c) => c.location))).sort(),
    [cabins]
  );

  const filtered = useMemo(() => {
    return cabins.filter((cabin) => {
      if (location !== "all" && cabin.location !== location) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const hay = [cabin.name, cabin.location, cabin.shortDescription]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [cabins, search, location]);

  const sorted = useMemo(
    () => sortCabins(filtered, sortOption),
    [filtered, sortOption]
  );

  useEffect(() => setCurrentPage(1), [search, location, sortOption]);

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const paginated = sorted.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const resetFilters = () => {
    setSearch("");
    setLocation("all");
  };

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

      {/* Filtros */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o destino..."
            className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-3 text-sm outline-none focus:border-ocean"
          />
        </div>
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-ocean"
        >
          <option value="all">Todas las ubicaciones</option>
          {locations.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>

      {/* Toolbar */}
      <div className="mb-4">
        <ListToolbar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          sortOption={sortOption}
          onSortOptionChange={setSortOption}
          sortOptions={cabinSortOptions}
          resultCount={sorted.length}
          resultLabel={`alojamiento${sorted.length !== 1 ? "s" : ""}`}
        />
      </div>

      {/* Grid de resultados */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-border">
              <div className="aspect-[16/10] bg-muted" />
              <div className="space-y-2 p-4">
                <div className="h-4 w-3/4 rounded bg-muted" />
                <div className="h-3 w-1/2 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : paginated.length === 0 ? (
        <EmptyState onReset={resetFilters} />
      ) : (
        <div className={cn("grid gap-5 sm:gap-6", gridCols)}>
          {paginated.map((cabin, i) => (
            <div key={cabin.id} className={cn("animate-fade-up", `stagger-${Math.min(i + 1, 6)}`)}>
              {isHorizontal ? (
                <CabinCardHorizontal cabin={cabin} />
              ) : (
                <CabinCard cabin={cabin} />
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
                  ? "bg-ocean text-white"
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

      {/* CTA inferior */}
      <div className="mt-12 rounded-2xl bg-muted/50 p-6 text-center">
        <h3 className="text-base font-bold text-foreground">{copy.emptyTitle}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{copy.emptyDescription}</p>
        <a
          href="https://wa.me/573126380048"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-ocean px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ocean-dark"
        >
          {copy.contactButton}
        </a>
      </div>
    </div>
  );
}
