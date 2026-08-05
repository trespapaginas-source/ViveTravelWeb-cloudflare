import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Package, CreditCard, Headset } from "lucide-react";
import { useSiteContent } from "@/lib/use-site-content";
import { cn } from "@/lib/utils";

const FALLBACK =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=600&fit=crop";

/**
 * PromotionsBanner — carrusel de banners promocionales + 3 tarjetas de valor.
 */
export function PromotionsBanner() {
  const { content } = useSiteContent();
  const banners = content.promotions.banners;
  const valueCards = content.promotions.valueCards;
  const whatsappNumber = (content.contact?.whatsapp ?? "").replace(/[^\d]/g, "") || "573001234567";

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % banners.length), 6000);
    return () => clearInterval(id);
  }, [banners.length]);

  const go = (dir: number) =>
    setIndex((i) => (i + dir + banners.length) % banners.length);

  return (
    <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8 lg:pt-8">
      {/* Espacio inferior reserva la mitad de las tarjetas superpuestas */}
      <div className="pb-10 sm:pb-11 lg:pb-12">
      {/* Contenedor relativo: banner + tarjetas superpuestas */}
      <div className="group relative max-w-full overflow-visible rounded-3xl">
        {/* Carrusel de banners */}
        <div className="relative max-w-full overflow-hidden rounded-3xl">
          <div className="relative h-[119px] w-full sm:aspect-[2560/675] sm:h-auto">
            {banners.map((b, i) => (
              <img
                key={b.id}
                src={b.url}
                alt={b.alt}
                className={cn(
                  "absolute inset-0 h-full w-full object-cover transition-opacity duration-700",
                  i === index ? "opacity-100" : "opacity-0"
                )}
                onError={(e) => {
                  e.currentTarget.src = FALLBACK;
                }}
              />
            ))}
          </div>

          {banners.length > 1 && (
            <>
              <button
                onClick={() => go(-1)}
                aria-label="Anterior"
                className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 opacity-0 shadow transition-opacity group-hover:opacity-100"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => go(1)}
                aria-label="Siguiente"
                className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 opacity-0 shadow transition-opacity group-hover:opacity-100"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              {/* Indicadores: en móvil se suben para no chocar con las tarjetas */}
              <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5 sm:bottom-3">
                {banners.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIndex(i)}
                    aria-label={`Ir al banner ${i + 1}`}
                    className={cn(
                      "h-1.5 rounded-full bg-white/60 transition-all",
                      i === index ? "w-5 bg-neutral-900" : "w-1.5"
                    )}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Tarjetas de valor superpuestas sobre el borde inferior del banner */}
        <div className="absolute inset-x-0 -bottom-0 grid translate-y-[42%] grid-cols-3 gap-2 px-2 sm:gap-4 sm:px-4">
          {valueCards.map((card, i) => {
            const inner = (
              <div className="flex h-full items-start gap-2 rounded-xl border border-border bg-white p-2.5 shadow-md sm:gap-3 sm:rounded-2xl sm:p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-900 sm:h-10 sm:w-10">
                  <ValueIcon index={i} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[11px] font-bold leading-tight text-card-foreground sm:text-sm">
                    {card.title}
                  </h3>
                  <p className="mt-0.5 hidden line-clamp-2 text-xs text-muted-foreground sm:mt-1 sm:block">
                    {card.description}
                  </p>
                </div>
              </div>
            );
            if (i === 2) {
              return (
                <a
                  key={card.id}
                  href={`https://wa.me/${whatsappNumber}?text=Hola,%20quiero%20conocer%20las%20promociones%20y%20descuentos%20de%20temporada`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {inner}
                </a>
              );
            }
            return <div key={card.id}>{inner}</div>;
          })}
        </div>
      </div>
      </div>
    </section>
  );
}

function ValueIcon({ index }: { index: number }) {
  // Iconos lucide por posición (promos / medios de pago / agente).
  const icons = [
    <Package key="0" className="h-5 w-5" />,
    <CreditCard key="1" className="h-5 w-5" />,
    <Headset key="2" className="h-5 w-5" />,
  ];
  return icons[index] ?? icons[0];
}
