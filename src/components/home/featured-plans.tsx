import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Star, MapPin, ArrowRight } from "lucide-react";
import { usePlanes } from "@/hooks/use-plans";
import { useSiteContent } from "@/lib/use-site-content";
import { ROUTES } from "@/lib/routes";
import { formatPrice, formatShortDuration, formatShortLocation } from "@/lib/utils";
import { SectionHeader } from "@/components/shared/section-header";

/**
 * FeaturedPlans — muestra hasta 6 planes destacados (ordenados por
 * `is_featured` / `featuredOrder`) en grid responsive (carrusel en móvil).
 * Consume los datos vía el hook `usePlanes()`.
 */
export function FeaturedPlans() {
  const { data: allPlans } = usePlanes();
  const { content } = useSiteContent();
  const fp = content.featuredPlans;
  const navigate = useNavigate();

  const featured = useMemo(
    () =>
      allPlans
        .filter((p) => p.is_active && p.is_featured)
        .sort((a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0))
        .slice(0, 6),
    [allPlans]
  );

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <SectionHeader
        title={fp.title.replace(/\s*Destacados\s*/i, "")}
        titleHighlight="Destacados"
        subtitle={fp.subtitle}
      />

      {/* Grid idéntico al de Salidas Programadas: 1 col móvil, 2 cols sm, 3 cols lg, mismo gap-4 */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((plan, i) => (
          <article
            key={plan.id}
            onClick={() => navigate(ROUTES.planDetail(plan.id))}
            className={`group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-md animate-fade-up stagger-${Math.min(i + 1, 6)}`}
          >
            {/* Imagen */}
            <div className="relative h-52 overflow-hidden">
              <img
                src={plan.images[0]}
                alt={plan.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop";
                }}
              />
              <span className="absolute right-2 top-2 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                {formatShortDuration(plan.duration)}
              </span>
            </div>

            {/* Cuerpo */}
            <div className="flex flex-1 flex-col p-4">
              <h3 className="line-clamp-2 text-sm font-bold text-card-foreground">
                {plan.name}
              </h3>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
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

              {/* Pie */}
              <div className="mt-auto flex items-end justify-between pt-4">
                <div>
                  <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">
                    {fp.priceLabel}
                  </span>
                  <span className="text-base font-extrabold text-foreground">
                    {formatPrice(plan.price)}
                  </span>
                </div>
                <span className="flex items-center gap-1 text-xs font-semibold text-neutral-900">
                  {fp.viewMore} <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* CTA ver todos */}
      <div className="mt-6 text-center">
        <button
          onClick={() => navigate(ROUTES.plans)}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-6 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
        >
          {fp.viewAll}
        </button>
      </div>
    </section>
  );
}
