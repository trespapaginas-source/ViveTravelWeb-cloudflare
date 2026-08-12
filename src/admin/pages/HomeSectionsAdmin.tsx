import { useEffect, useState } from "react";
import { getSiteContent, updateSiteContent, type SiteContentRow } from "../lib/admin-data";
import { Button } from "@/components/ui/button";
import { SectionEditor } from "../components/SectionEditor";
import {
  FeaturedPlansForm,
  PromotionsForm,
  InternationalForm,
  GroupTripsForm,
  ReadyCtaForm,
  TestimonialsHeaderForm,
  TickerForm,
  ScheduledDeparturesBannerForm,
  ScheduledDeparturesForm,
} from "../components/HomeContentForms";

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero (portada)",
  promotions: "Banner de promociones",
  ticker: "Cinta de destinos (ticker)",
  plans: "Planes destacados",
  bannerSalidas: "Banner de salidas programadas",
  salidas: "Salidas programadas",
  gallery: "Galería de destinos nacionales",
  international: "Destinos internacionales",
  stats: "Estadísticas",
  groups: "Viajes en grupo",
  custom: "Viajes personalizados",
  testimonials: "Testimonios",
  team: "Equipo",
  readyCta: "Llamado a la acción final",
};

// Cada sección con contenido editable apunta a su columna en site_content.
// Las secciones que no aparecen aquí (gallery, stats, custom, team) no tienen
// todavía una página pública que las consuma (fuera de alcance actual), así
// que solo se pueden reordenar/ocultar.
const SECTION_CONTENT: Record<string, { column: string; description?: string }> = {
  plans: { column: "featured_plans" },
  promotions: { column: "promotions" },
  ticker: { column: "ticker" },
  bannerSalidas: { column: "scheduled_departures_banner" },
  salidas: { column: "scheduled_departures" },
  international: { column: "international" },
  groups: { column: "group_trips" },
  readyCta: {
    column: "custom_trips",
    description: "Solo el llamado a la acción final; el resto del contenido es para una sección futura.",
  },
  testimonials: {
    column: "testimonials",
    description: "Título y subtítulo del bloque — las reseñas se administran aparte.",
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderForm(key: string, value: any, onChange: (v: any) => void) {
  switch (key) {
    case "plans":
      return <FeaturedPlansForm value={value} onChange={onChange} />;
    case "promotions":
      return <PromotionsForm value={value} onChange={onChange} />;
    case "ticker":
      return <TickerForm value={value} onChange={onChange} />;
    case "bannerSalidas":
      return <ScheduledDeparturesBannerForm value={value} onChange={onChange} />;
    case "salidas":
      return <ScheduledDeparturesForm value={value} onChange={onChange} />;
    case "international":
      return <InternationalForm value={value} onChange={onChange} />;
    case "groups":
      return <GroupTripsForm value={value} onChange={onChange} />;
    case "readyCta":
      return <ReadyCtaForm value={value} onChange={onChange} />;
    case "testimonials":
      return <TestimonialsHeaderForm value={value} onChange={onChange} />;
    default:
      return null;
  }
}

interface HomeConfig {
  order: string[];
  active: Record<string, boolean>;
}

/** Reordena/oculta las secciones de la página de inicio y edita el contenido de cada una. */
export function HomeSectionsAdmin() {
  const [config, setConfig] = useState<HomeConfig | null>(null);
  const [content, setContent] = useState<SiteContentRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingOrder, setSavingOrder] = useState(false);

  const load = () =>
    getSiteContent().then((sc) => {
      setConfig(sc.home_config as HomeConfig);
      setContent(sc);
    });

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const move = (key: string, dir: "up" | "down") => {
    if (!config) return;
    const idx = config.order.indexOf(key);
    const swap = dir === "up" ? idx - 1 : idx + 1;
    if (swap < 0 || swap >= config.order.length) return;
    const next = [...config.order];
    [next[idx], next[swap]] = [next[swap], next[idx]];
    setConfig({ ...config, order: next });
  };

  const toggle = (key: string) => {
    if (!config) return;
    setConfig({ ...config, active: { ...config.active, [key]: !config.active[key] } });
  };

  const saveOrder = async () => {
    if (!config) return;
    setSavingOrder(true);
    await updateSiteContent({ home_config: config });
    setSavingOrder(false);
  };

  const patchColumn = (column: string, value: unknown) => {
    setContent((prev) => (prev ? { ...prev, [column]: value } : prev));
  };

  const saveColumn = async (column: string) => {
    if (!content) return;
    await updateSiteContent({ [column]: content[column] });
  };

  if (loading || !config || !content) return <p className="text-sm text-muted-foreground">Cargando…</p>;

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-bold text-foreground">Inicio</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Orden, visibilidad y contenido de las secciones de la página de inicio.
      </p>

      <div className="mt-5 divide-y divide-border rounded-lg border border-border bg-white">
        {config.order.map((key, i) => (
          <div key={key} className="flex flex-wrap items-center gap-x-3 gap-y-2 px-3 py-3 sm:flex-nowrap sm:px-4">
            <div className="flex flex-col">
              <button
                type="button"
                onClick={() => move(key, "up")}
                disabled={i === 0}
                className="flex h-8 w-8 items-center justify-center text-sm text-neutral-500 hover:text-neutral-900 disabled:opacity-25"
              >
                ▲
              </button>
              <button
                type="button"
                onClick={() => move(key, "down")}
                disabled={i === config.order.length - 1}
                className="flex h-8 w-8 items-center justify-center text-sm text-neutral-500 hover:text-neutral-900 disabled:opacity-25"
              >
                ▼
              </button>
            </div>
            <span className="min-w-0 flex-1 truncate text-sm text-foreground">{SECTION_LABELS[key] ?? key}</span>
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <input type="checkbox" checked={config.active[key] ?? false} onChange={() => toggle(key)} />
              Visible
            </label>
          </div>
        ))}
      </div>

      <Button onClick={saveOrder} disabled={savingOrder} className="mt-4">
        {savingOrder ? "Guardando…" : "Guardar orden y visibilidad"}
      </Button>

      <h2 className="mt-8 text-sm font-bold text-foreground">Contenido de cada sección</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        El Hero (portada) tiene su propia pantalla — ver "Hero" en el menú.
      </p>

      <div className="mt-3 space-y-3">
        {config.order
          .filter((key) => SECTION_CONTENT[key])
          .map((key) => {
            const { column, description } = SECTION_CONTENT[key];
            return (
              <SectionEditor
                key={key}
                title={SECTION_LABELS[key] ?? key}
                description={description}
                onSave={() => saveColumn(column)}
              >
                {renderForm(key, content[column], (v) => patchColumn(column, v))}
              </SectionEditor>
            );
          })}
      </div>
    </div>
  );
}
