import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * StarRating — muestra O permite seleccionar una calificación de 1-5.
 *
 * - Modo `display` (sin onChange): solo muestra estrellas rellenas según `value`.
 * - Modo `input` (con onChange): estrellas clickeables con hover.
 */
export function StarRating({
  value,
  onChange,
  size = "md",
  className,
}: {
  value: number;
  onChange?: (n: number) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const interactive = typeof onChange === "function";
  const sizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-7 w-7",
  };
  const iconSize = sizes[size];

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(star)}
          className={cn(
            "transition-transform",
            interactive && "cursor-pointer hover:scale-110",
            !interactive && "cursor-default"
          )}
          aria-label={interactive ? `${star} estrella${star > 1 ? "s" : ""}` : undefined}
        >
          <Star
            className={cn(
              iconSize,
              star <= Math.round(value)
                ? "fill-amber-400 text-amber-400"
                : "fill-transparent text-neutral-300"
            )}
          />
        </button>
      ))}
    </div>
  );
}
