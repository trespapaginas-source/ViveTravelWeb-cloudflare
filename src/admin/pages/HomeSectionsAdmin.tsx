import { useEffect, useState } from "react";
import { getSiteContent, updateSiteContent } from "../lib/admin-data";
import { Button } from "@/components/ui/button";

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

interface HomeConfig {
  order: string[];
  active: Record<string, boolean>;
}

/** Reordena/oculta las secciones de la página de inicio (mismo patrón que ya usa home.tsx). */
export function HomeSectionsAdmin() {
  const [config, setConfig] = useState<HomeConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSiteContent()
      .then((sc) => setConfig(sc.home_config as HomeConfig))
      .finally(() => setLoading(false));
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

  const save = async () => {
    if (!config) return;
    setSaving(true);
    await updateSiteContent({ home_config: config });
    setSaving(false);
  };

  if (loading || !config) return <p className="text-sm text-muted-foreground">Cargando…</p>;

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-bold text-foreground">Secciones del home</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Orden y visibilidad de las secciones de la página de inicio.
      </p>

      <div className="mt-5 divide-y divide-border rounded-lg border border-border bg-white">
        {config.order.map((key, i) => (
          <div key={key} className="flex items-center gap-3 px-4 py-3">
            <div className="flex flex-col">
              <button
                type="button"
                onClick={() => move(key, "up")}
                disabled={i === 0}
                className="h-5 text-xs text-neutral-500 hover:text-neutral-900 disabled:opacity-25"
              >
                ▲
              </button>
              <button
                type="button"
                onClick={() => move(key, "down")}
                disabled={i === config.order.length - 1}
                className="h-5 text-xs text-neutral-500 hover:text-neutral-900 disabled:opacity-25"
              >
                ▼
              </button>
            </div>
            <span className="flex-1 text-sm text-foreground">
              {SECTION_LABELS[key] ?? key}
            </span>
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={config.active[key] ?? false}
                onChange={() => toggle(key)}
              />
              Visible
            </label>
          </div>
        ))}
      </div>

      <Button onClick={save} disabled={saving} className="mt-4">
        {saving ? "Guardando…" : "Guardar cambios"}
      </Button>
    </div>
  );
}
