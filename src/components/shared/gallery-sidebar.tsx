import { useState } from "react";
import { MapPin, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { StarRating, ratingLabel } from "@/components/reviews/star-rating";
import { normalizeCountryCode, type ReviewRow } from "@/lib/reviews-api";
import { cn } from "@/lib/utils";

/**
 * GallerySidebar — panel lateral junto a la galería de fotos (solo desktop).
 * Muestra la puntuación real (D1) con un carrusel de reseñas y un mapa
 * pequeño de la ubicación, estilo Booking.com. Nunca inventa puntuaciones:
 * sin reseñas muestra un estado neutral con CTA para ser el primero.
 */
export function GallerySidebar({
  avg,
  count,
  reviews,
  location,
  onWriteReview,
  className,
}: {
  avg: number;
  count: number;
  reviews: ReviewRow[];
  location: string;
  onWriteReview: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <ReviewsCard
        avg={avg}
        count={count}
        reviews={reviews}
        onWriteReview={onWriteReview}
      />
      <LocationCard location={location} className="flex-1" />
    </div>
  );
}

function ReviewsCard({
  avg,
  count,
  reviews,
  onWriteReview,
}: {
  avg: number;
  count: number;
  reviews: ReviewRow[];
  onWriteReview: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const current = reviews[idx];

  if (count === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-start gap-2.5">
          <Star className="mt-0.5 h-5 w-5 shrink-0 fill-neutral-300 text-neutral-300" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              Sin reseñas todavía
            </p>
            <button
              type="button"
              onClick={onWriteReview}
              className="mt-0.5 text-xs font-medium text-neutral-900 underline underline-offset-2 hover:no-underline"
            >
              Sé el primero en opinar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-11 min-w-11 items-center justify-center rounded-lg bg-neutral-900 px-2 text-base font-bold text-white">
          {avg.toFixed(1)}
        </span>
        <div>
          <p className="text-sm font-bold leading-tight text-foreground">
            {ratingLabel(Math.round(avg))}
          </p>
          <p className="text-xs text-muted-foreground">
            {count} comentario{count !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {current && (
        <div className="mt-3 border-t border-border pt-3">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Lo que más les gustó a quienes visitaron el lugar
          </p>
          {current.comment ? (
            <p className="line-clamp-3 text-xs italic leading-relaxed text-muted-foreground">
              "{current.comment}"
            </p>
          ) : (
            <StarRating value={current.rating} size="sm" />
          )}
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="flex min-w-0 items-center gap-1.5 truncate text-xs font-semibold text-foreground">
              {normalizeCountryCode(current.country) && (
                <img
                  src={`https://flagcdn.com/20x15/${normalizeCountryCode(current.country)}.png`}
                  srcSet={`https://flagcdn.com/40x30/${normalizeCountryCode(current.country)}.png 2x`}
                  width={16}
                  height={12}
                  alt=""
                  className="shrink-0 rounded-[2px] object-cover"
                />
              )}
              <span className="truncate">{current.reviewer_name}</span>
            </span>
            {reviews.length > 1 && (
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  aria-label="Reseña anterior"
                  onClick={() =>
                    setIdx((i) => (i - 1 + reviews.length) % reviews.length)
                  }
                  className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <span className="text-[10px] text-muted-foreground">
                  {idx + 1}/{reviews.length}
                </span>
                <button
                  type="button"
                  aria-label="Siguiente reseña"
                  onClick={() => setIdx((i) => (i + 1) % reviews.length)}
                  className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function LocationCard({
  location,
  className,
}: {
  location: string;
  className?: string;
}) {
  const mapsSearchUrl = `https://www.google.com/maps?q=${encodeURIComponent(location)}`;

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border border-border bg-card",
        className
      )}
    >
      <div className="relative min-h-[80px] w-full flex-1 bg-muted">
        <iframe
          title={`Mapa de ${location}`}
          src={`https://maps.google.com/maps?q=${encodeURIComponent(
            location
          )}&z=11&output=embed`}
          className="pointer-events-none h-full w-full"
          loading="lazy"
        />
      </div>
      <a
        href={mapsSearchUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex shrink-0 items-center justify-center gap-1.5 border-t border-border py-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
      >
        <MapPin className="h-3.5 w-3.5" /> Ver en el mapa
      </a>
    </div>
  );
}
