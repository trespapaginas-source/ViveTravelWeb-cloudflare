import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSiteContent } from "@/lib/use-site-content";
import { cn } from "@/lib/utils";

const FALLBACK =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=600&fit=crop";

/**
 * PromotionsBanner — carrusel de banners promocionales.
 */
export function PromotionsBanner() {
  const { content } = useSiteContent();
  const banners = content.promotions.banners;

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
      <div className="pb-6">
      {/* Contenedor relativo para los controles del carrusel */}
      <div className="group relative max-w-full">
        {/* Carrusel de banners */}
        <div className="relative max-w-full overflow-hidden rounded-3xl">
          <div className="relative h-[119px] w-full sm:aspect-[2560/675] sm:h-auto">
            {banners.map((b, i) => (
              <img loading="lazy" decoding="async"
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
              {/* Indicadores del carrusel */}
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
      </div>
      </div>
    </section>
  );
}
