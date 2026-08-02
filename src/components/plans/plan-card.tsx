import { useNavigate } from "react-router-dom";
import { Star, MapPin, Clock, Users, ArrowRight } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { formatPrice, formatShortLocation, cn } from "@/lib/utils";
import { CardImageCarousel } from "@/components/shared/card-image-carousel";
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
        <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-white/95 px-2 py-1 text-[11px] font-semibold text-slate-700 backdrop-blur-md">
          {plan.category}
        </span>
        {plan.is_featured && (
          <span className="absolute right-2.5 top-2.5 z-10 rounded-full bg-ocean px-2 py-1 text-[11px] font-semibold text-white">
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
          {plan.rating > 0 && (
            <span className="flex items-center gap-0.5">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {plan.rating.toFixed(1)}
            </span>
          )}
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
          <span className="flex items-center gap-0.5">
            <Users className="h-3 w-3" /> {plan.maxGuests} máx.
          </span>
        </div>
      </div>

      {/* Pie */}
      <div className="space-y-2.5 border-t border-border/30 p-3.5 pt-2.5 sm:p-4">
        <div className="text-right">
          <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">
            Desde
          </span>
          <span className="text-base font-extrabold text-foreground sm:text-[17px]">
            {formatPrice(plan.price)}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(ROUTES.planDetail(plan.id));
          }}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-zinc-900 py-2 text-xs font-semibold text-white hover:bg-black"
        >
          Ver detalle <ArrowRight className="h-3.5 w-3.5" />
        </button>
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
        <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-white/95 px-2 py-1 text-[11px] font-semibold text-slate-700 backdrop-blur-md">
          {plan.category}
        </span>
      </div>

      {/* Contenido */}
      <div className="flex min-w-0 flex-1 flex-col justify-between p-4 sm:p-5">
        <div>
          <h3 className="line-clamp-1 text-lg font-bold text-card-foreground sm:text-[20px]">
            {plan.name}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {plan.rating > 0 && (
              <span className="flex items-center gap-0.5">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                {plan.rating.toFixed(1)} ({plan.reviewCount})
              </span>
            )}
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
            <span className="flex items-center gap-0.5">
              <Users className="h-3.5 w-3.5" /> Máx. {plan.maxGuests} personas
            </span>
            <span className="rounded-full bg-ocean/10 px-2 py-0.5 text-[11px] font-medium text-ocean">
              {plan.difficulty}
            </span>
          </div>
        </div>

        {/* Pie */}
        <div className="mt-4 flex flex-col gap-3 border-t border-border/30 pt-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="sm:text-right">
            <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">
              Desde
            </span>
            <span className="text-lg font-extrabold text-foreground">
              {formatPrice(plan.price)}
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(ROUTES.planDetail(plan.id));
            }}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-lg bg-zinc-900 px-5 py-2 text-xs font-semibold text-white hover:bg-black"
            )}
          >
            Ver detalle <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
}
