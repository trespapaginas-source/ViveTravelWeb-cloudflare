import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      {/* Carrusel de banners */}
      <div className="group relative max-w-full overflow-hidden rounded-3xl">
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
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  aria-label={`Ir al banner ${i + 1}`}
                  className={cn(
                    "h-1.5 rounded-full bg-white/60 transition-all",
                    i === index ? "w-5 bg-ocean" : "w-1.5"
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Tarjetas de valor */}
      <div className="-mt-8 hidden gap-4 md:grid md:grid-cols-3">
        {valueCards.map((card, i) => {
          const inner = (
            <div className="flex h-full items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ocean/10 text-ocean">
                <ValueIcon index={i} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-card-foreground">{card.title}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
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
    </section>
  );
}

function ValueIcon({ index }: { index: number }) {
  // Iconos simples por posición (promos / beneficios / agente).
  const icons = [
    <svg key="0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><path d="M20 7L12 3 4 7m16 0-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
    <svg key="1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" /><path d="M4 6v12c0 1.1.9 2 2 2h14v-4" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" /></svg>,
    <svg key="2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><path d="M12 2a5 5 0 0 1 5 5v3a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5Z" /><path d="M5 21v-1a7 7 0 0 1 14 0v1" /></svg>,
  ];
  return icons[index] ?? icons[0];
}
