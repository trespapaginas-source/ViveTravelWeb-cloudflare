import { useState, type TouchEvent } from "react";
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const FALLBACK =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop";

/**
 * CardImageCarousel — mini carrusel de imágenes embebido en las tarjetas de
 * catálogo. Soporta swipe táctil y flechas de navegación (desktop al hover).
 */
export function CardImageCarousel({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [index, setIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  if (!images || images.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-zinc-100">
        <ImageIcon className="h-8 w-8 text-zinc-300" />
      </div>
    );
  }

  const safeImages = images.length > 0 ? images : [FALLBACK];
  const total = safeImages.length;
  const go = (delta: number) => setIndex((i) => (i + delta + total) % total);

  const onTouchStart = (e: TouchEvent) => setTouchStart(e.touches[0].clientX);
  const onTouchEnd = (e: TouchEvent) => {
    if (touchStart === null) return;
    const delta = e.changedTouches[0].clientX - touchStart;
    if (Math.abs(delta) > 50) go(delta > 0 ? -1 : 1);
    setTouchStart(null);
  };

  const stop = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <img
        src={safeImages[index]}
        alt={alt}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        onError={(e) => {
          e.currentTarget.src = FALLBACK;
        }}
      />

      {/* Flehas (solo si hay +1 imagen) */}
      {total > 1 && (
        <>
          <button
            onClick={(e) => {
              stop(e);
              go(-1);
            }}
            className="absolute left-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-4 w-4 text-zinc-700" />
          </button>
          <button
            onClick={(e) => {
              stop(e);
              go(1);
            }}
            className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
            aria-label="Siguiente"
          >
            <ChevronRight className="h-4 w-4 text-zinc-700" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5">
            {safeImages.slice(0, 6).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === index ? "w-3 bg-white" : "bg-white/50"
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
