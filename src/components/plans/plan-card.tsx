import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Clock,
  BedDouble,
  Plane,
  UtensilsCrossed,
  Car,
  Check,
  type LucideIcon,
} from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { formatPrice, formatPlanLocation, resolveServiceIcon } from "@/lib/utils";
import { CardImageCarousel } from "@/components/shared/card-image-carousel";
import { RatingBadge } from "@/components/reviews/rating-badge";
import type { NormalizedPlan } from "@/lib/data-access";
import type { PlanService } from "@/lib/data";

/* ───────────── Resolución dinámica de iconos de servicios ───────────── */
// Mapa nombre-de-icono-Lucide → componente. Permite que el CMS envíe un
// identificador de icono y el frontend lo resuelva sin acoplamiento.
const ICON_COMPONENTS: Record<string, LucideIcon> = {
  "bed-double": BedDouble,
  plane: Plane,
  "utensils-crossed": UtensilsCrossed,
  car: Car,
  check: Check,
};

/**
 * PlanServices — renderiza la lista dinámica de servicios incluidos.
 * Si `servicios` es undefined o vacío, NO renderiza nada (container absent
 * del DOM, no un contenedor vacío).
 */
export function PlanServices({ servicios }: { servicios?: PlanService[] }) {
  if (!servicios || servicios.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      {servicios.map(({ id, label, icon }) => {
        const iconName = resolveServiceIcon(icon || id);
        const Icon = ICON_COMPONENTS[iconName] ?? Check;
        return (
          <span key={id} className="flex items-center gap-1">
            <Icon
              aria-hidden="true"
              className="h-[18px] w-[18px] shrink-0 text-neutral-600"
              strokeWidth={1.5}
            />
            <span className="text-[10px] font-medium text-gray-600">
              {label}
            </span>
          </span>
        );
      })}
    </div>
  );
}

/**
 * ImageBadge — badge flotante sobre la esquina superior izquierda de la foto.
 * Sólo se renderiza si el plan trae `badge_imagen`.
 */
function ImageBadge({ text }: { text: string }) {
  return (
    <span className="absolute left-3 top-3 z-10 rounded-full bg-black/70 px-2.5 py-1 text-xs font-bold text-white shadow-sm backdrop-blur-sm">
      {text}
    </span>
  );
}

/**
 * PriceBadge — badge promocional flotante en la esquina superior derecha de la
 * foto. Fondo esmeralda brillante para destacar sobre la imagen.
 * Sólo se renderiza si el plan trae `badge_precio`.
 */
function PriceBadge({ text }: { text: string }) {
  return (
    <span className="absolute right-3 top-3 z-10 rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
      {text}
    </span>
  );
}

/* ───────────── Tarjeta VERTICAL (grid 2/3 columnas) ───────────── */

/**
 * PlanCard — tarjeta vertical de plan para vista en cuadrícula.
 * Imagen arriba + contenido abajo.
 */
export function PlanCard({ plan }: { plan: NormalizedPlan }) {
  const navigate = useNavigate();

  return (
    <article
      onClick={() => navigate(ROUTES.planDetail(plan.id))}
      className="group flex h-full cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card py-0 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      {/* Imagen */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <div className="absolute inset-0">
          <CardImageCarousel images={plan.images} alt={plan.name} />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        {plan.badge_imagen && <ImageBadge text={plan.badge_imagen} />}
        {plan.badge_precio && <PriceBadge text={plan.badge_precio} />}
        {plan.is_featured && !plan.badge_precio && (
          <span className="absolute right-2.5 top-2.5 z-10 rounded-md border border-white/15 bg-black/30 px-3 py-1 text-xs font-medium text-white shadow-sm backdrop-blur-md">
            ★ Destacado
          </span>
        )}
      </div>

      {/* Contenido — flex-1 ocupa el espacio restante */}
      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        <h3 className="line-clamp-1 text-[17px] font-bold leading-snug text-card-foreground">
          {plan.name}
        </h3>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-0.5">
            <MapPin className="h-3.5 w-3.5" />
            {formatPlanLocation(plan)}
          </span>
        </div>
        <p className="mt-2 line-clamp-2 text-sm text-gray-700">
          {plan.shortDescription}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-0.5">
            <Clock className="h-3.5 w-3.5" /> {plan.duration}
          </span>
        </div>
        {/* Servicios incluidos — dinámico, no renderiza si está vacío */}
        {plan.servicios_incluidos && plan.servicios_incluidos.length > 0 && (
          <div className="mt-3">
            <PlanServices servicios={plan.servicios_incluidos} />
          </div>
        )}
      </div>

      {/* Pie — anclado al fondo con mt-auto */}
      <div className="mt-auto flex items-center justify-between gap-2 border-t border-gray-100 p-3.5 pt-3 sm:p-4">
        <RatingBadge serviceType="plan" serviceId={plan.id} />
        <div className="text-right">
          <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">
            Desde
          </span>
          <span className="text-xl font-extrabold text-foreground sm:text-[17px]">
            {formatPrice(plan.price)}
          </span>
          <span className="block text-[10px] font-normal normal-case text-muted-foreground/70">
            Impuestos y cargos incluidos
          </span>
        </div>
      </div>
    </article>
  );
}

/* ───────────── Tarjeta HORIZONTAL (lista 1 columna) ───────────── */

/**
 * PlanCardHorizontal — tarjeta horizontal de plan para vista de lista.
 * Imagen izquierda + contenido derecha.
 */
export function PlanCardHorizontal({ plan }: { plan: NormalizedPlan }) {
  const navigate = useNavigate();

  return (
    <article
      onClick={() => navigate(ROUTES.planDetail(plan.id))}
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-md sm:flex-row"
    >
      {/* Imagen */}
      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden sm:aspect-none sm:min-h-[220px] sm:w-[320px] sm:self-stretch">
        <div className="absolute inset-0">
          <CardImageCarousel images={plan.images} alt={plan.name} />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent to-black/10" />
        {plan.badge_imagen && <ImageBadge text={plan.badge_imagen} />}
        {plan.badge_precio && <PriceBadge text={plan.badge_precio} />}
      </div>

      {/* Contenido — flex flex-col justify-between para anclar pie */}
      <div className="flex min-w-0 flex-1 flex-col justify-between p-4 sm:p-5">
        <div className="flex-1">
          <h3 className="line-clamp-1 text-lg font-bold text-card-foreground sm:text-[20px]">
            {plan.name}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-0.5">
              <MapPin className="h-3.5 w-3.5" /> {formatPlanLocation(plan)}
            </span>
            <span className="flex items-center gap-0.5">
              <Clock className="h-3.5 w-3.5" /> {plan.duration}
            </span>
          </div>
          <p className="mt-2 line-clamp-2 text-sm text-gray-700">
            {plan.shortDescription}
          </p>
          {/* Servicios incluidos — dinámico, no renderiza si está vacío */}
          {plan.servicios_incluidos && plan.servicios_incluidos.length > 0 && (
            <div className="mt-3">
              <PlanServices servicios={plan.servicios_incluidos} />
            </div>
          )}
        </div>

        {/* Pie — anclado al fondo con mt-auto */}
        <div className="mt-auto flex flex-col gap-3 border-t border-gray-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
          <RatingBadge serviceType="plan" serviceId={plan.id} />
          <div className="sm:text-right">
            <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">
              Desde
            </span>
            <span className="text-xl font-extrabold text-foreground sm:text-lg">
              {formatPrice(plan.price)}
            </span>
            <span className="block text-[10px] font-normal normal-case text-muted-foreground/70">
              Impuestos y cargos incluidos
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
