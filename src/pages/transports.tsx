import { Link } from "react-router-dom";
import { Users, Check, ArrowRight } from "lucide-react";
import { useTransports } from "@/hooks/use-plans";
import { ROUTES } from "@/lib/routes";
import { EmptyState } from "@/components/shared/empty-state";

/**
 * TransportsPage — flota de vehículos disponibles.
 *
 * Consume los datos EXCLUSIVAMENTE vía `useTransports()`.
 */
export function TransportsPage() {
  const { data: transports, isLoading } = useTransports();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Cabecera */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Transporte y Vehículos
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Servicio de transporte privado para grupos, empresas y eventos.
          Conductores profesionales certificados y seguros de viaje completos.
        </p>
      </div>

      {isLoading ? (
        <div className="animate-pulse text-muted-foreground">Cargando flota...</div>
      ) : transports.length === 0 ? (
        <EmptyState title="No hay vehículos disponibles" />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {transports.map((t) => (
            <article
              key={t.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={t.image}
                  alt={t.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=600&fit=crop";
                  }}
                />
                <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                  <Users className="h-3 w-3" /> {t.capacity}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-base font-bold text-card-foreground">{t.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>

                {/* Features */}
                <ul className="mt-3 space-y-1">
                  {t.features.slice(0, 3).map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-1.5 text-xs text-muted-foreground"
                    >
                      <Check className="mt-0.5 h-3 w-3 shrink-0 text-ocean" />
                      {f}
                    </li>
                  ))}
                </ul>

                <p className="mt-3 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                  <strong className="text-foreground">Ideal para:</strong> {t.bestFor}
                </p>

                <div className="mt-auto flex items-end justify-between pt-4">
                  <div>
                    <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">
                      Desde
                    </span>
                    <span className="text-lg font-extrabold text-foreground">
                      {t.priceRange}
                    </span>
                  </div>
                  <Link
                    to={ROUTES.transportDetail(t.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-black"
                  >
                    Ver detalle <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Compromiso de servicio */}
      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        {[
          {
            title: "Conductores certificados",
            desc: "Profesionales con licencia y experiencia en transporte turístico.",
          },
          {
            title: "Seguro completo",
            desc: "Todos los vehículos cuentan con seguro de viaje para pasajeros.",
          },
          {
            title: "Puntualidad garantizada",
            desc: "Cumplimos con los horarios acordados para traslados y tours.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-border bg-muted/30 p-5"
          >
            <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
