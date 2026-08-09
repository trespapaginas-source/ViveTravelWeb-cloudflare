import { useState } from "react";
import { StarRating } from "./star-rating";
import type { ReviewRow } from "@/lib/reviews-api";
import { cn } from "@/lib/utils";

/**
 * ReviewList — renderiza la lista de reseñas reales de un servicio.
 * Cada ítem muestra: iniciales, nombre, estrellas, etiqueta y, si la hay, el
 * comentario dejado por el usuario, junto con la fecha relativa.
 */
export function ReviewList({ reviews }: { reviews: ReviewRow[] }) {
  if (reviews.length === 0) {
    return (
      <p className="rounded-xl bg-muted/50 px-4 py-6 text-center text-sm text-muted-foreground">
        Aún no hay reseñas. ¡Sé el primero en calificar esta experiencia!
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((rev) => (
        <ReviewItem key={rev.id} rev={rev} />
      ))}
    </div>
  );
}

/**
 * ReviewItem — reseña individual con truncado inteligente del comentario.
 * Si el comentario supera las 3 líneas visibles, muestra un botón "Ver más"
 * que despliega el texto completo sin alterar el layout general.
 */
function ReviewItem({ rev }: { rev: ReviewRow }) {
  const [expanded, setExpanded] = useState(false);
  // Heurística: si el comentario supera ~140 caracteres probablemente ocupa
  // más de 3 líneas y necesita el toggle. Es conservador y visualmente seguro.
  const isLong = !!rev.comment && rev.comment.length > 140;

  return (
    <article className="flex gap-3 rounded-xl border border-border bg-card p-4">
      <Avatar name={rev.reviewer_name} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-2">
          <span className="truncate text-sm font-semibold text-foreground">
            {rev.reviewer_name}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {formatRelative(rev.created_at)}
          </span>
        </div>
        <div className="mt-0.5 flex items-center gap-2">
          <StarRating value={rev.rating} size="sm" />
          <span className="text-[11px] font-medium text-muted-foreground">
            {labelFor(rev.rating)}
          </span>
        </div>
        {rev.comment && (
          <div className="mt-1.5">
            <p
              className={cn(
                "text-xs leading-relaxed text-foreground",
                !expanded && isLong && "line-clamp-3"
              )}
            >
              {rev.comment}
            </p>
            {isLong && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="mt-1 text-[11px] font-semibold text-neutral-700 underline-offset-2 hover:underline"
              >
                {expanded ? "Ver menos" : "Ver más"}
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

/** Etiqueta corta para el detalle de cada reseña. */
function labelFor(rating: number): string {
  switch (rating) {
    case 5:
      return "Excelente";
    case 4:
      return "Muy bueno";
    case 3:
      return "Bueno";
    case 2:
      return "Regular";
    default:
      return "Malo";
  }
}

/** Burbuja con las iniciales del nombre (sin avatar real). */
function Avatar({ name }: { name: string }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-xs font-bold text-neutral-700">
      {initials || "?"}
    </span>
  );
}

/** Fecha relativa legible (ej: "hace 3 días"). */
function formatRelative(isoDate: string): string {
  const d = new Date(isoDate + (isoDate.endsWith("Z") ? "" : "Z"));
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "ahora";
  if (diffMin < 60) return `hace ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `hace ${diffH} h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 30) return `hace ${diffD} d`;
  const diffMo = Math.floor(diffD / 30);
  if (diffMo < 12) return `hace ${diffMo} mes(es)`;
  return `hace ${Math.floor(diffMo / 12)} año(s)`;
}
