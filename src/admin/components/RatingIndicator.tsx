import { Star } from "lucide-react";
import { useReviews } from "@/hooks/use-reviews";
import type { ServiceType } from "@/lib/reviews-api";

/**
 * Indicador de solo lectura — el rating y el conteo de reseñas ya no se
 * editan a mano: se calculan a partir de las reseñas reales enviadas por
 * los usuarios (D1). Este componente solo muestra el valor actual.
 */
export function RatingIndicator({
  serviceType,
  serviceId,
}: {
  serviceType: ServiceType;
  serviceId: string;
}) {
  const { avg, count, loading } = useReviews(serviceType, serviceId);

  return (
    <div className="flex items-center gap-1.5 rounded-md bg-neutral-50 px-3 py-2 text-xs text-muted-foreground">
      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
      {loading ? (
        "Cargando calificación…"
      ) : count > 0 ? (
        <span>
          <strong className="text-foreground">{avg.toFixed(1)}</strong> · {count} reseña
          {count !== 1 ? "s" : ""} (calculado automáticamente a partir de reseñas reales)
        </span>
      ) : (
        <span>Sin reseñas todavía (se calculará automáticamente cuando lleguen)</span>
      )}
    </div>
  );
}
