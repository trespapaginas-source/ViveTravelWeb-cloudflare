import { Link } from "react-router-dom";
import { EXPERIENCE_SECTIONS } from "@/lib/experience-sections";
import { ROUTES } from "@/lib/routes";
import { useSiteContent } from "@/lib/use-site-content";
import { PagePlaceholder } from "@/pages/page-placeholder";

/**
 * HomePage — versión FASE 1 (estructura base).
 * El hero completo (buscador multi-tab) y las secciones del home se
 * implementarán en una fase posterior. Aquí se garantiza que la página es
 * navegable y muestra el hero + accesos a las categorías de experiencias.
 */
export function HomePage() {
  const { content } = useSiteContent();
  const hero = content.hero;

  return (
    <>
      {/* Hero mínimo (placeholder del HeroSection multi-tab real) */}
      <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden">
        <img
          src="/images/hero/desktop.jpg"
          alt="Vive Travel"
          className="absolute inset-0 h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.src =
              "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=900&fit=crop&q=80";
            e.currentTarget.onerror = null;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center text-white">
          <span className="inline-block rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
            {hero.brandLabel}
          </span>
          <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight drop-shadow-lg">
            {hero.title}{" "}
            <span className="text-ocean-light">{hero.titleHighlight}</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base sm:text-lg text-white/90 drop-shadow">
            {hero.subtitle}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to={ROUTES.plans}
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-zinc-900 shadow-lg transition-colors hover:bg-zinc-100"
            >
              {hero.ctaPlans}
            </Link>
            <Link
              to={ROUTES.cabins}
              className="inline-flex items-center justify-center rounded-full bg-ocean px-6 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-ocean-dark"
            >
              {hero.ctaCabins}
            </Link>
          </div>
        </div>
      </section>

      {/* Accesos a las 6 categorías de experiencias */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <PagePlaceholder
          eyebrow="FASE 1 · Layout base"
          title="Experiencias y viajes"
          description="El listado completo de planes con filtros, orden y cotizador se implementará en la siguiente fase. Mientras tanto, explora las categorías:"
        />
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {EXPERIENCE_SECTIONS.map((section) => (
            <Link
              key={section.id}
              to={ROUTES.plansByCategory(section.id)}
              className="rounded-xl border border-border bg-card p-4 text-center text-sm font-medium text-card-foreground transition-colors hover:border-ocean hover:bg-ocean/5 hover:text-ocean"
            >
              {section.label}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
