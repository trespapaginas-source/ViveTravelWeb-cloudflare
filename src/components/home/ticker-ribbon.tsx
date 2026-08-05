import { PackageCheck, Sparkles, Users, Compass, ArrowDownRight } from "lucide-react";

const TICKER_ITEMS = [
  { label: "PAQUETES TODO INCLUIDO", icon: PackageCheck },
  { label: "VIAJES 2x1", icon: Sparkles },
  { label: "VIAJES GRUPALES INCREÍBLES", icon: Users },
  { label: "ARMA TU COMBO", icon: Compass },
];

/**
 * TickerRibbon — cinta animada con mensajes promocionales (marquee infinito).
 */
export function TickerRibbon() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS];
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
