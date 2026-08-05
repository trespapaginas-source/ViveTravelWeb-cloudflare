import { useParams, Link } from "react-router-dom";
import { useGoBack } from "@/hooks/use-go-back";
import {
  ArrowLeft,
  Users,
  Check,
  ArrowRight,
} from "lucide-react";
import { useTransports } from "@/hooks/use-plans";
import { ROUTES } from "@/lib/routes";
import { openWhatsApp } from "@/lib/whatsapp";
import { EmptyState } from "@/components/shared/empty-state";

/**
 * TransportDetailPage — ficha de un vehículo con cotización por WhatsApp.
 * Consume los datos vía `useTransports()` y busca por ID.
 */
export function TransportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: transports } = useTransports();

  const transport = transports.find((t) => t.id === id) ?? null;
  const related = transports.filter((t) => t.id !== id).slice(0, 3);
  const goBack = useGoBack(ROUTES.transports);

  if (!transport) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <EmptyState
          title="Vehículo no encontrado"
          description="El vehículo que buscas no existe o fue removido."
        />
      </div>
    );
  }

  const handleQuote = () => {
    openWhatsApp(
      `Hola, me interesa cotizar el servicio de ${transport.name} (${transport.capacity}) para un traslado. ¿Podrían darme más información sobre disponibilidad y tarifas?`
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <button
        onClick={goBack}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Volver
      </button>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Contenido */}
        <div>
          {/* Hero */}
          <div className="relative h-64 overflow-hidden rounded-2xl sm:h-80">
            <img
              src={transport.image}
              alt={transport.name}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.src =
                  "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&h=800&fit=crop";
              }}
            />
            <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">
              <Users className="h-4 w-4" /> {transport.capacity}
            </span>
          </div>

          <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            {transport.name}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            {transport.description}
          </p>

          {/* Ideal para */}
          <div className="mt-5 rounded-xl bg-muted/50 p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Ideal para
            </h2>
            <p className="mt-1 text-sm font-medium text-foreground">
              {transport.bestFor}
            </p>
          </div>

          {/* Características */}
          <section className="mt-6">
            <h2 className="text-lg font-bold text-foreground">Características</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {transport.features.map((f, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 rounded-lg border border-border bg-card p-3 text-sm"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-ocean" />
                  <span className="text-foreground">{f}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar cotización */}
        <aside>
          <div className="sticky top-24 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              Tarifa desde
            </span>
            <p className="text-2xl font-extrabold text-foreground">
              {transport.priceRange}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Precio referencial sujeto a ruta y temporada
            </p>

            <button
              onClick={handleQuote}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1DA851] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#17943e]"
            >
              Cotizar por WhatsApp
            </button>

            <Link
              to={ROUTES.contact}
              className="mt-2 block w-full rounded-xl border border-border py-2.5 text-center text-sm font-medium text-foreground hover:bg-accent"
            >
              Solicitar reserva
            </Link>

            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              Conductores certificados · Seguro completo
            </p>
          </div>
        </aside>
      </div>

      {/* Vehículos relacionados */}
      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-lg font-bold text-foreground">
            Otros vehículos
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {related.map((t) => (
              <Link
                key={t.id}
                to={ROUTES.transportDetail(t.id)}
                className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-all hover:-translate-y-0.5 hover:border-ocean hover:shadow-sm"
              >
                <img
                  src={t.image}
                  alt={t.name}
                  loading="lazy"
                  className="h-14 w-14 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-semibold text-card-foreground group-hover:text-ocean">
                    {t.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{t.capacity}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
