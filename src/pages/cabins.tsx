import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { useCabanas } from "@/hooks/use-plans";
import { useSiteContent } from "@/lib/use-site-content";
import { CabinCard } from "@/components/cabins/cabin-card";
import { EmptyState } from "@/components/shared/empty-state";

/**
 * CabinsPage — catálogo de cabañas/alojamientos.
 *
 * Consume los datos EXCLUSIVAMENTE vía `useCabanas()`.
 * Lee el parámetro `destino` de la URL (buscador del home) para pre-filtrar.
 * Filtros: búsqueda por texto y ubicación.
 */
export function CabinsPage() {
  const { data: cabins, isLoading } = useCabanas();
  const { content } = useSiteContent();
  const [searchParams] = useSearchParams();
  const copy = content.cabinsList;

  const [search, setSearch] = useState(() => searchParams.get("destino") ?? "");
  const [location, setLocation] = useState<string>("all");

  // Ubicaciones únicas para el filtro.
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

  const resetFilters = () => {
    setSearch("");
    setLocation("all");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Cabecera */}
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

      <p className="mb-4 text-sm text-muted-foreground">
        {filtered.length} alojamiento{filtered.length !== 1 ? "s" : ""}{" "}
        disponible{filtered.length !== 1 ? "s" : ""}
      </p>

      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-border">
              <div className="h-52 bg-muted" />
              <div className="space-y-2 p-4">
                <div className="h-4 w-3/4 rounded bg-muted" />
                <div className="h-3 w-1/2 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState onReset={resetFilters} />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((cabin) => (
            <CabinCard key={cabin.id} cabin={cabin} />
          ))}
        </div>
      )}

      {/* CTA inferior */}
      <div className="mt-12 rounded-2xl bg-muted/50 p-6 text-center">
        <h3 className="text-base font-bold text-foreground">
          {copy.emptyTitle}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {copy.emptyDescription}
        </p>
        <a
          href={`https://wa.me/573126380048`}
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
