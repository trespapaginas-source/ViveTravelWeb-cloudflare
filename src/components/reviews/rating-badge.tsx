import { Star } from "lucide-react";
import { useReviews } from "@/hooks/use-reviews";
import { ratingLabel } from "@/components/reviews/star-rating";
import type { ServiceType } from "@/lib/reviews-api";

/**
 * RatingBadge — puntuación estilo Expedia (caja + etiqueta + conteo) para
 * tarjetas de listado. Consume reseñas reales de D1 vía `useReviews`; sin
 * reseñas muestra un estado neutral, nunca un puntaje inventado.
 */
export function RatingBadge({
  serviceType,
  serviceId,
}: {
  serviceType: ServiceType;
  serviceId: string;
}) {
  const { avg, count, loading } = useReviews(serviceType, serviceId);

  if (loading) return null;

  if (count === 0) {
    return (
      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
        <Star className="h-3.5 w-3.5 fill-neutral-300 text-neutral-300" />
        Sin reseñas
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1.5">
      <span className="flex h-8 min-w-8 items-center justify-center rounded-md bg-neutral-900 px-2.5 py-1 text-sm font-bold text-white">
        {avg.toFixed(1)}
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-xs font-semibold text-foreground">
          {ratingLabel(Math.round(avg))}
        </span>
        <span className="text-[11px] text-gray-500">
          {count} reseña{count !== 1 ? "s" : ""}
        </span>
      </span>
    </span>
  );
}
