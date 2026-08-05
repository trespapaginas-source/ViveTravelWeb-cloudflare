import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useVisas } from "@/hooks/use-plans";
import { ROUTES } from "@/lib/routes";
import { EmptyState } from "@/components/shared/empty-state";

/** Config de las 3 categorías de visa. */
const CATEGORY_META: Record<
  string,
  { label: string; description: string; color: string }
> = {
  free: {
    label: "Sin visa requerida",
    description: "Destinos a los que los colombianos pueden ingresar libremente.",
    color: "bg-ocean/10 text-ocean",
  },
  onarrival: {
    label: "Visa a la llegada / electrónica",
    description: "Trámite sencillo que se gestiona online o al llegar.",
    color: "bg-amber-100 text-amber-700",
  },
  required: {
    label: "Visa requerida",
    description: "Requiere trámite consular previo antes de viajar.",
    color: "bg-rose-100 text-rose-700",
  },
};

const FILTERS = [
  { id: "all", label: "Todos" },
  { id: "free", label: "Sin visa" },
  { id: "onarrival", label: "A la llegada" },
  { id: "required", label: "Requerida" },
];

/**
 * VisasPage — catálogo de trámites migratorios agrupados por categoría.
 *
 * Consume los datos EXCLUSIVAMENTE vía `useVisas()`.
 */
export function VisasPage() {
  const { data: visas, byCategory, isLoading } = useVisas();
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = activeFilter === "all" ? visas : byCategory[activeFilter] ?? [];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((v) =>
        [v.country, v.region, v.visaCategory]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }
    return list;
  }, [visas, byCategory, activeFilter, search]);

  // Categorías a mostrar (respetando el filtro activo).
  const categoriesToShow = useMemo(() => {
    if (activeFilter !== "all") return [activeFilter];
    return ["free", "onarrival", "required"].filter((c) => byCategory[c]?.length);
  }, [activeFilter, byCategory]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero oscuro */}
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-[#002B49] px-6 py-12 text-center text-white sm:px-12">
        <img
          src="/images/visas/pasaporte-colombiano.png"
          alt=""
          aria-hidden="true"
          className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-20"
          onError={(e) => {
            e.currentTarget.src = "/images/visas/pasaporte-colombiano.avif";
          }}
        />
        <div className="relative z-10 mx-auto max-w-2xl">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Visas y Requisitos Migratorios
          </h1>
          <p className="mt-3 text-sm text-white/85 sm:text-base">
            Guía completa de requisitos de visa para colombianos en destinos de
            todo el mundo. Información referencial; confirma siempre con la
            autoridad oficial.
          </p>
        </div>
      </div>

      {/* Búsqueda + filtros */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar país o región..."
          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-ocean sm:max-w-xs"
        />
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={
                "whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors " +
                (activeFilter === f.id
                  ? "bg-ocean text-white"
                  : "bg-muted text-muted-foreground hover:bg-accent")
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="animate-pulse text-muted-foreground">Cargando...</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No se encontraron países"
          description="Prueba con otro término de búsqueda o cambia el filtro de categoría."
          onReset={() => {
            setSearch("");
            setActiveFilter("all");
          }}
        />
      ) : (
        <div className="space-y-12">
          {categoriesToShow.map((catId) => {
            const meta = CATEGORY_META[catId];
            const items =
              activeFilter === "all" ? byCategory[catId] ?? [] : filtered;
            if (!items.length) return null;
            return (
              <section key={catId}>
                <div className="mb-4 flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${meta?.color ?? ""}`}
                  >
                    {meta?.label ?? catId}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {items.length} destino{items.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <p className="mb-4 text-sm text-muted-foreground">
                  {meta?.description}
                </p>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {items.map((visa) => (
                    <Link
                      key={visa.slug}
                      to={ROUTES.visaDetail(visa.slug)}
                      className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-all hover:-translate-y-0.5 hover:border-ocean hover:shadow-sm"
                    >
                      <img
                        src={`https://flagcdn.com/w80/${visa.countryCode.toLowerCase()}.png`}
                        alt={visa.country}
                        loading="lazy"
                        className="h-10 w-10 rounded-full object-cover ring-1 ring-border"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-semibold text-card-foreground group-hover:text-ocean">
                          {visa.country}
                        </p>
                        <p className="line-clamp-1 text-xs text-muted-foreground">
                          {visa.visaCategory}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-12 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
        <strong>Aviso:</strong> La información presentada es referencial y puede
        cambiar. Te recomendamos confirmar los requisitos con la embajada o
        consulado oficial antes de tu viaje.
      </div>
    </div>
  );
}
