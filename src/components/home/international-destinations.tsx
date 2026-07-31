import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useSiteContent } from "@/lib/use-site-content";
import { ROUTES } from "@/lib/routes";
import { SectionHeader } from "@/components/shared/section-header";

const FALLBACK =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&h=1125&fit=crop&q=80";

/**
 * InternationalDestinations — tarjetas de destinos internacionales.
 * Cada tarjeta navega a /planes?categoria=internacionales.
 */
export function InternationalDestinations() {
  const { content } = useSiteContent();
  const intl = content.international;
  const navigate = useNavigate();

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <SectionHeader
        title={intl.title}
        titleHighlight={intl.titleHighlight}
        subtitle={intl.subtitle}
      />

      <div className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-3">
        {intl.destinations.map((dest) => (
          <article
            key={dest.name}
            onClick={() => navigate(ROUTES.plansByCategory("internacionales"))}
            className="group relative aspect-[4/5] w-[80vw] max-w-[290px] shrink-0 cursor-pointer snap-start overflow-hidden rounded-3xl sm:w-auto"
          >
            <img
              src={dest.image}
              alt={dest.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.src = FALLBACK;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-white/90">
                {dest.eyebrow}
              </span>
              <h3 className="mt-1 text-2xl font-extrabold drop-shadow-lg lg:text-3xl">
                {dest.name}
              </h3>
              <p className="mt-1 line-clamp-3 text-xs text-white/85">{dest.description}</p>
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm transition-colors group-hover:bg-white group-hover:text-ocean">
                Ver destino <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
