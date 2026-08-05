import { useNavigate } from "react-router-dom";
import {
  Users,
  Percent,
  Calendar,
  Heart,
  ArrowRight,
} from "lucide-react";
import { useSiteContent } from "@/lib/use-site-content";
import { ROUTES } from "@/lib/routes";

const ICONS_MAP = [Percent, Calendar, Heart, Users];

/**
 * GroupTrips — sección de viajes en grupo con beneficios, estadísticas y CTAs.
 */
export function GroupTrips() {
  const { content } = useSiteContent();
  const g = content.groupTrips;
  const navigate = useNavigate();

  return (
    <section className="border-y border-border bg-gray-50 py-8 lg:py-10">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        {/* Columna izquierda: copy + CTAs + stats */}
        <div className="flex flex-col justify-center">
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-900">
            <Users className="h-4 w-4" />
            {g.label}
          </span>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {g.title} <span className="text-muted-foreground">{g.titleHighlight}</span>
          </h2>
          <p className="mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
            {g.description}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => navigate(ROUTES.contact)}
              className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-black"
            >
              {g.ctaQuote}
            </button>
            <button
              onClick={() => navigate(ROUTES.plansByCategory("grupales"))}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-6 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
            >
              {g.ctaPlans} <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Stats */}
          <div className="mt-6 flex gap-6">
            {g.stats.map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-extrabold text-neutral-900">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Columna derecha: tarjetas de beneficios */}
        <div className="hidden grid-cols-2 gap-4 sm:grid">
          {g.benefits.map((b, i) => {
            const Icon = ICONS_MAP[i] ?? Users;
            return (
              <div
                key={b.title}
                className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Icon className="h-5 w-5 text-neutral-900" />
                </div>
                <h3 className="mt-3 text-sm font-bold text-card-foreground">{b.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{b.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
