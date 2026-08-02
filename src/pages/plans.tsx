import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { usePlanes } from "@/hooks/use-plans";
import {
  usePlanFilters,
  DEFAULT_FILTERS,
  type PlanFilters,
  type ExperienceId,
} from "@/hooks/use-plan-filters";
import { EXPERIENCE_SECTIONS } from "@/lib/experience-sections";
import { formatPrice } from "@/lib/utils";
import { useSiteContent } from "@/lib/use-site-content";
import { PlanCard } from "@/components/plans/plan-card";
import { EmptyState } from "@/components/shared/empty-state";

/**
 * PlansPage — catálogo de experiencias con filtros avanzados.
 *
 * - Consume los datos EXCLUSIVAMENTE vía el hook `usePlanes()`.
 * - Lee los parámetros de búsqueda de la URL (useSearchParams) que envía el
 *   buscador principal de la Home (categoria, destino, etc.) y los aplica
 *   automáticamente al cargar.
 * - Panel de filtros interactivo: sección de experiencia, búsqueda, rango de
 *   precio y duración — respuesta en tiempo real.
 */
export function PlansPage() {
  const { data: plans, isLoading } = usePlanes();
  const { content } = useSiteContent();
  const [searchParams, setSearchParams] = useSearchParams();

  // Estado de filtros — inicializa desde la URL (buscador del home).
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

  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Sincroniza cambios de filtros con la URL (bidireccional).
  useEffect(() => {
    const next = new URLSearchParams();
    next.set("categoria", filters.section);
    if (filters.search.trim()) next.set("destino", filters.search.trim());
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.section, filters.search]);

  const { filtered, priceBounds } = usePlanFilters(plans, filters);

  const update = (patch: Partial<PlanFilters>) =>
    setFilters((f) => ({ ...f, ...patch }));

  const resetFilters = () =>
    setFilters((f) => ({
      ...DEFAULT_FILTERS,
      section: f.section, // mantiene la sección activa
    }));

  const copy = content.plansList;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Cabecera */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          {copy.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{copy.subtitle}</p>
      </div>

      {/* Tabs de sección de experiencia (drag-scrollable visual) */}
      <div className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1">
        {EXPERIENCE_SECTIONS.map((section) => (
          <button
            key={section.id}
            onClick={() => update({ section: section.id })}
            className={
              "whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors " +
              (filters.section === section.id
                ? "bg-ocean text-white shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-accent")
            }
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
            onUpdate={update}
            onReset={resetFilters}
          />
        </aside>

        {/* Contenido principal */}
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
            <span className="text-sm text-muted-foreground">
              {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Conteo desktop */}
          <p className="mb-4 hidden text-sm text-muted-foreground lg:block">
            {filtered.length} experiencia{filtered.length !== 1 ? "s" : ""}{" "}
            disponible{filtered.length !== 1 ? "s" : ""}
          </p>

          {isLoading ? (
            <PlansSkeleton />
          ) : filtered.length === 0 ? (
            <EmptyState onReset={resetFilters} />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((plan) => (
                <PlanCard key={plan.id} plan={plan} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Panel de filtros móvil (overlay) */}
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
              onUpdate={update}
              onReset={resetFilters}
            />
            <button
              onClick={() => setShowFiltersMobile(false)}
              className="mt-5 w-full rounded-xl bg-ocean py-3 text-sm font-semibold text-white"
            >
              Ver {filtered.length} resultados
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
  onUpdate,
  onReset,
}: {
  filters: PlanFilters;
  priceBounds: { min: number; max: number };
  onUpdate: (patch: Partial<PlanFilters>) => void;
  onReset: () => void;
}) {
  // Lista de opciones de duración (días máximos).
  const durationOptions = [
    { label: "Cualquier duración", value: null },
    { label: "Hasta 1 día", value: 1 },
    { label: "Hasta 3 días", value: 3 },
    { label: "Hasta 5 días", value: 5 },
    { label: "Hasta 7 días", value: 7 },
  ];

  return (
    <div className="space-y-6 rounded-2xl border border-border bg-card p-5">
      {/* Búsqueda por destino */}
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
            className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-ocean"
          />
        </div>
      </div>

      {/* Rango de precio */}
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
          className="w-full accent-ocean"
        />
        <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
          <span>{formatPrice(priceBounds.min)}</span>
          <span className="font-semibold text-foreground">
            {filters.priceMax === null
              ? "Sin límite"
              : formatPrice(filters.priceMax)}
          </span>
          <span>{formatPrice(priceBounds.max)}</span>
        </div>
      </div>

      {/* Duración */}
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Duración
        </label>
        <div className="space-y-1.5">
          {durationOptions.map((opt) => (
            <button
              key={String(opt.value)}
              onClick={() => onUpdate({ maxDays: opt.value })}
              className={
                "block w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors " +
                (filters.maxDays === opt.value
                  ? "bg-ocean/10 font-semibold text-ocean"
                  : "text-muted-foreground hover:bg-muted")
              }
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reset */}
      <button
        onClick={onReset}
        className="w-full rounded-lg border border-border py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
      >
        Limpiar filtros
      </button>
    </div>
  );
}

/* ─────────────────────── Skeleton de carga ─────────────────────── */

function PlansSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-2xl border border-border"
        >
          <div className="h-48 bg-muted" />
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
