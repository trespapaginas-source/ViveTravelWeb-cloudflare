import { useNavigate } from "react-router-dom";
import { Star, MapPin, Clock, Users } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { formatPrice, formatShortLocation } from "@/lib/utils";
import type { NormalizedPlan } from "@/lib/data-access";

/**
 * Tarjeta vertical de plan/experiencia para los catálogos.
 */
export function PlanCard({ plan }: { plan: NormalizedPlan }) {
  const navigate = useNavigate();

  return (
    <article
      onClick={() => navigate(ROUTES.planDetail(plan.id))}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={plan.images[0]}
          alt={plan.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src =
              "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop";
          }}
        />
        <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
          {plan.category}
        </span>
        {plan.is_featured && (
          <span className="absolute right-2 top-2 rounded-full bg-ocean px-2.5 py-1 text-[11px] font-semibold text-white">
            ★ Destacado
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-sm font-bold text-card-foreground">
          {plan.name}
        </h3>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
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

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-0.5">
            <Clock className="h-3 w-3" /> {plan.duration}
          </span>
          <span className="flex items-center gap-0.5">
            <Users className="h-3 w-3" /> {plan.maxGuests} máx.
          </span>
        </div>

        <div className="mt-auto pt-4">
          <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">
            Desde
          </span>
          <span className="text-lg font-extrabold text-foreground">
            {formatPrice(plan.price)}
          </span>
        </div>
      </div>
    </article>
  );
}
