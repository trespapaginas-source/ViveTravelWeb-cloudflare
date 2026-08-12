import { PackageCheck, Sparkles, Users, Compass, ArrowDownRight } from "lucide-react";
import { useSiteContent } from "@/lib/use-site-content";

const TICKER_ICONS = [PackageCheck, Sparkles, Users, Compass];

const DEFAULT_TICKER_LABELS = [
  "PAQUETES TODO INCLUIDO",
  "VIAJES 2x1",
  "VIAJES GRUPALES INCREÍBLES",
  "ARMA TU COMBO",
];

/**
 * TickerRibbon — cinta animada con mensajes promocionales (marquee infinito).
 * Los textos vienen de site_content.ticker; los íconos se asignan por
 * posición (ciclando entre los 4 disponibles) ya que no son editables desde
 * el CMS todavía.
 */
export function TickerRibbon() {
  const { content } = useSiteContent();
  const labels = content.ticker?.items?.length ? content.ticker.items : DEFAULT_TICKER_LABELS;
  const base = labels.map((label, i) => ({ label, icon: TICKER_ICONS[i % TICKER_ICONS.length] }));
  const items = [...base, ...base, ...base, ...base];
  return (
    <div className="relative overflow-hidden border-y border-zinc-800 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 py-3">
      <div className="flex w-max animate-[marquee_30s_linear_infinite] gap-8">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-3 text-white">
            <item.icon className="h-4 w-4 text-white" />
            <span className="text-xs font-extrabold uppercase tracking-widest sm:text-sm">
              {item.label}
            </span>
            <ArrowDownRight className="h-3 w-3 rotate-45 text-white/40" />
          </div>
        ))}
      </div>
    </div>
  );
}
