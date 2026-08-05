import { useParams, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";

interface PagePlaceholderProps {
  title: string;
  description?: string;
  /** Eyebrow / badge pequeño encima del título. */
  eyebrow?: string;
  /** Clase extra para el contenedor (ej. para fondos especiales). */
  className?: string;
}

/**
 * Placeholder reutilizable para páginas aún no implementadas.
 * Muestra título, descripción y (si aplica) los parámetros de ruta/query
 * para confirmar que la navegación funciona.
 *
 * Las páginas reales se construirán en fases posteriores reemplazando este
 * componente por la implementación definitiva de cada una.
 */
export function PagePlaceholder({
  title,
  description,
  eyebrow = "Próximamente",
  className,
}: PagePlaceholderProps) {
  const params = useParams();
  const [searchParams] = useSearchParams();

  const routeParams = Object.entries(params).filter(([, v]) => v);
  const queryParams = Array.from(searchParams.entries());

  return (
    <div
      className={cn(
        "min-h-[60vh] flex flex-col items-center justify-center gap-4 px-6 py-16 text-center",
        className
      )}
    >
      <span className="inline-block rounded-full bg-neutral-100 px-4 py-1 text-sm font-medium text-neutral-900-dark">
        {eyebrow}
      </span>
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
        {title}
      </h1>
      {description && (
        <p className="max-w-xl text-slate-600">{description}</p>
      )}

      {(routeParams.length > 0 || queryParams.length > 0) && (
        <div className="mt-4 rounded-lg border border-border bg-muted/50 px-4 py-3 text-left text-xs text-muted-foreground">
          <p className="font-semibold mb-1 text-foreground">
            Parámetros de navegación:
          </p>
          {routeParams.map(([k, v]) => (
            <div key={k}>
              <span className="font-mono">{k}</span>: {v}
            </div>
          ))}
          {queryParams.map(([k, v]) => (
            <div key={k}>
              <span className="font-mono">{k}</span>: {v}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
