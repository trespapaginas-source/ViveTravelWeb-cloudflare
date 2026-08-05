import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Lugar } from "@/lib/data";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1501785888041-af3cff28a5ee?w=600&h=400&fit=crop";

/**
 * LugaresCarousel — carrusel horizontal para la sección "Lugares a conocer"
 * del detalle de un plan. Réplica visual del proyecto gemelo (embla) pero
 * implementado con CSS scroll-snap nativo (sin dependencias externas).
 *
 * - Slides responsivos: 72% móvil / 48% sm / 30% lg (mismas proporciones).
 * - Flechas prev/next que desaparecen en los extremos (disabled state).
 * - Las flechas solo se muestran si hay más de 3 lugares (como el gemelo).
 * - Las imágenes NO abren lightbox: clic no hace nada (solo decorativas).
 */
export function LugaresCarousel({ lugares }: { lugares: Lugar[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  // Ancho de un slide para saber cuánto scrollear. Se calcula en runtime
  // porque depende del breakpoint activo.
  const slideWidth = useRef<number>(0);

  const updateState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    // El ancho de un slide ≈ 72% / 48% / 30% del viewport del carrusel.
    // Lo medimos del primer hijo si existe.
    const firstChild = el.firstElementChild as HTMLElement | null;
    slideWidth.current = firstChild ? firstChild.offsetWidth + 16 : el.clientWidth * 0.72;

    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateState();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateState, { passive: true });
    window.addEventListener("resize", updateState);
    return () => {
      el.removeEventListener("scroll", updateState);
      window.removeEventListener("resize", updateState);
    };
  }, [updateState, lugares.length]);

  const scrollByDir = (dir: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * slideWidth.current, behavior: "smooth" });
  };

  // Las flechas solo aparecen si hay más slides de los visibles.
  const showArrows = lugares.length > 3;

  return (
    <section id="lugares" className="mt-8 scroll-mt-32">
      <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
        Lugares a conocer
      </h2>

      <div className="relative mt-4">
        {/* Track scroll-snap */}
        <div
          ref={scrollRef}
          className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-1"
        >
          {lugares.map((lugar, i) => (
            <div
              key={i}
              className={cn(
                "relative aspect-[3/2] shrink-0 snap-start overflow-hidden rounded-xl",
                // Anchos responsivos (mismas proporciones que el gemelo)
                "w-[72%] sm:w-[48%] lg:w-[30%]"
              )}
            >
              <img
                src={lugar.image}
                alt={lugar.name}
                loading="lazy"
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = FALLBACK_IMG;
                  e.currentTarget.onerror = null;
                }}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <span className="absolute bottom-2.5 left-3 right-3 text-sm font-semibold leading-tight text-white drop-shadow-sm">
                {lugar.name}
              </span>
            </div>
          ))}
        </div>

        {/* Flechas de navegación */}
        {showArrows && (
          <>
            <button
              type="button"
              onClick={() => scrollByDir(-1)}
              disabled={!canPrev}
              aria-label="Anterior"
              className={cn(
                "absolute left-0 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white p-2 text-foreground shadow-lg transition-colors hover:bg-ocean hover:text-white disabled:cursor-default disabled:opacity-40 sm:-left-3 sm:h-10 sm:w-10"
              )}
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollByDir(1)}
              disabled={!canNext}
              aria-label="Siguiente"
              className={cn(
                "absolute right-0 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white p-2 text-foreground shadow-lg transition-colors hover:bg-ocean hover:text-white disabled:cursor-default disabled:opacity-40 sm:-right-3 sm:h-10 sm:w-10"
              )}
            >
              <ChevronRight className="h-4 w-5 sm:h-5 sm:w-5" />
            </button>
          </>
        )}
      </div>
    </section>
  );
}
