import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, CalendarDays, MapPin } from "lucide-react";
import { usePlanes } from "@/hooks/use-plans";
import { ROUTES } from "@/lib/routes";
import { formatPrice, formatDepartureRange } from "@/lib/utils";
import { SectionHeader } from "@/components/shared/section-header";
import { RatingBadge } from "@/components/reviews/rating-badge";
import { PlanServices } from "@/components/plans/plan-card";

/**
 * ScheduledDepartures — destinos nacionales con salidas programadas fijas
 * (fixedDeparture === true). Grid de 6 planes.
 * Consume los datos vía el hook `usePlanes()`.
 */
export function ScheduledDepartures() {
  const { data: allPlans } = usePlanes();
  const navigate = useNavigate();

  const departures = useMemo(
    () => allPlans.filter((p) => p.is_active && p.fixedDeparture),
    [allPlans]
  );

  if (departures.length === 0) return null;

  return (
    <section id="salidas-programadas" className="border-y border-border bg-zinc-50/60 py-8 lg:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Salidas Programadas"
          subtitle="Destinos nacionales con calendario de salidas definido. Reserva tu fecha con anticipación."
        />

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {departures.map((plan) => (
            <article
              key={plan.id}
              onClick={() => navigate(ROUTES.planDetail(plan.id))}
              className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="relative h-52 overflow-hidden">
                <img
                  src={plan.images[0]}
                  alt={plan.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1501785888041-af3cff28a5ee?w=800&h=600&fit=crop";
                  }}
                />
                <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full border border-white/15 bg-black/30 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm backdrop-blur-md">
                  <CalendarDays className="h-3 w-3" />
                  Fechas fijas
                </span>
              </div>

              <div className="flex flex-1 flex-col p-4">
                <h3 className="line-clamp-1 text-sm font-bold text-card-foreground">
                  {plan.name}
                </h3>
                <p className="mt-0.5 flex items-center gap-0.5 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {plan.location}
                </p>
                <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                  {plan.shortDescription}
                </p>

                {/* Servicios incluidos — dinámico, coherente con el catálogo */}
                {plan.servicios_incluidos && plan.servicios_incluidos.length > 0 && (
                  <div className="mt-2">
                    <PlanServices servicios={plan.servicios_incluidos} />
                  </div>
                )}

                <div className="mt-3 flex flex-col gap-1 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {plan.duration}
                  </span>
                  {/* Rango de salidas dinámico (mes actual → mes última fecha). */}
                  {(() => {
                    const range = formatDepartureRange(plan.departureDates);
                    if (range) {
                      return (
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" /> {range}
                        </span>
                      );
                    }
                    // Fallback: horario real si existe y no es texto de salidas quemado.
                    const sched = plan.schedule;
                    if (sched && !/^salidas programadas/i.test(sched)) {
                      return (
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" /> {sched}
                        </span>
                      );
                    }
                    return null;
                  })()}
                </div>

                {/* Pie — rating (izq) + precio (der), alineados a la misma altura */}
                <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                  <RatingBadge serviceType="plan" serviceId={plan.id} />
                  <div className="text-right">
                    <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">
                      Desde
                    </span>
                    <span className="text-base font-extrabold text-foreground">
                      {formatPrice(plan.price)}
                    </span>
                    <span className="text-[11px] text-muted-foreground"> / persona</span>
                    <span className="block text-[10px] font-normal normal-case text-muted-foreground/70">
                      Impuestos y cargos incluidos
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
