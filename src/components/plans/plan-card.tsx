import { useNavigate } from "react-router-dom";
import { MapPin, Clock, Users } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { formatPrice, formatShortLocation } from "@/lib/utils";
import { CardImageCarousel } from "@/components/shared/card-image-carousel";
import { RatingBadge } from "@/components/reviews/rating-badge";
import type { NormalizedPlan } from "@/lib/data-access";

/* ───────────── Tarjeta VERTICAL (grid 2/3 columnas) ───────────── */

/**
 * PlanCard — tarjeta vertical de plan para vista en cuadrícula.
 * Imagen arriba + contenido abajo.
 */
export function PlanCard({ plan }: { plan: NormalizedPlan }) {
  const navigate = useNavigate();

  return (
    <article
      onClick={() => navigate(ROUTES.planDetail(plan.id))}
      className="group flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card py-0 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      {/* Imagen */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <div className="absolute inset-0">
          <CardImageCarousel images={plan.images} alt={plan.name} />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        {plan.is_featured && (
          <span className="absolute right-2.5 top-2.5 z-10 rounded-md border border-white/15 bg-black/30 px-3 py-1 text-xs font-medium text-white shadow-sm backdrop-blur-md">
            ★ Destacado
          </span>
        )}
      </div>

      {/* Contenido */}
      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        <h3 className="line-clamp-1 text-[17px] font-bold leading-snug text-card-foreground">
          {plan.name}
        </h3>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground sm:text-xs">
          <span className="flex items-center gap-0.5">
            <MapPin className="h-3 w-3" />
            {formatShortLocation(plan.location)}
          </span>
        </div>
        <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
          {plan.shortDescription}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground sm:text-xs">
          <span className="flex items-center gap-0.5">
            <Clock className="h-3 w-3" /> {plan.duration}
          </span>
          {plan.category === "Grupal" ? (
            plan.spotsLeft !== undefined && (
              <span className="flex items-center gap-0.5 font-semibold text-amber-700">
                <Users className="h-3 w-3" /> Quedan {plan.spotsLeft} cupos
              </span>
            )
          ) : (
            <span className="flex items-center gap-0.5">
              <Users className="h-3 w-3" /> {plan.maxGuests} máx.
            </span>
          )}
        </div>
      </div>

      {/* Pie */}
      <div className="flex items-center justify-between gap-2 border-t border-border/30 p-3.5 pt-2.5 sm:p-4">
        <RatingBadge serviceType="plan" serviceId={plan.id} />
        <div className="text-right">
          <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">
            Desde
          </span>
          <span className="text-base font-extrabold text-foreground sm:text-[17px]">
            {formatPrice(plan.price)}
          </span>
          <span className="block text-[10px] font-normal normal-case text-muted-foreground/70">
            Impuestos y cargos incluidos
          </span>
        </div>
      </div>
    </article>
  );
}

/* ───────────── Tarjeta HORIZONTAL (lista 1 columna) ───────────── */

/**
 * PlanCardHorizontal — tarjeta horizontal de plan para vista de lista.
 * Imagen izquierda + contenido derecha.
 */
export function PlanCardHorizontal({ plan }: { plan: NormalizedPlan }) {
  const navigate = useNavigate();

  return (
    <article
      onClick={() => navigate(ROUTES.planDetail(plan.id))}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-md sm:flex-row"
    >
      {/* Imagen */}
      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden sm:aspect-none sm:min-h-[220px] sm:w-[320px] sm:self-stretch">
        <div className="absolute inset-0">
          <CardImageCarousel images={plan.images} alt={plan.name} />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent to-black/10" />
      </div>

      {/* Contenido */}
      <div className="flex min-w-0 flex-1 flex-col justify-between p-4 sm:p-5">
        <div>
          <h3 className="line-clamp-1 text-lg font-bold text-card-foreground sm:text-[20px]">
            {plan.name}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-0.5">
              <MapPin className="h-3.5 w-3.5" /> {plan.location}
            </span>
            <span className="flex items-center gap-0.5">
              <Clock className="h-3.5 w-3.5" /> {plan.duration}
            </span>
          </div>
          <p className="mt-2 line-clamp-2 text-xs text-muted-foreground sm:text-sm">
            {plan.shortDescription}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {plan.category === "Grupal" ? (
              plan.spotsLeft !== undefined && (
                <span className="flex items-center gap-0.5 font-semibold text-amber-700">
                  <Users className="h-3.5 w-3.5" /> Quedan {plan.spotsLeft} cupos
                </span>
              )
            ) : (
              <span className="flex items-center gap-0.5">
                <Users className="h-3.5 w-3.5" /> Máx. {plan.maxGuests} personas
              </span>
            )}
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-900">
              {plan.difficulty}
            </span>
          </div>
        </div>

        {/* Pie */}
        <div className="mt-4 flex flex-col gap-3 border-t border-border/30 pt-3 sm:flex-row sm:items-center sm:justify-between">
          <RatingBadge serviceType="plan" serviceId={plan.id} />
          <div className="sm:text-right">
            <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">
              Desde
            </span>
            <span className="text-lg font-extrabold text-foreground">
              {formatPrice(plan.price)}
            </span>
            <span className="block text-[10px] font-normal normal-case text-muted-foreground/70">
              Impuestos y cargos incluidos
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
