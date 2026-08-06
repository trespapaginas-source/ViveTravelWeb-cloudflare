import { useNavigate } from "react-router-dom";
import { MapPin, Users, BedDouble, Bath, ArrowRight } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { formatPrice, formatShortLocation } from "@/lib/utils";
import { CardImageCarousel } from "@/components/shared/card-image-carousel";
import type { NormalizedCabin } from "@/lib/data-access";

/* ───────────── Tarjeta VERTICAL (grid 2/3 columnas) ───────────── */

/**
 * CabinCard — tarjeta vertical de cabaña para vista en cuadrícula.
 */
export function CabinCard({ cabin }: { cabin: NormalizedCabin }) {
  const navigate = useNavigate();

  return (
    <article
      onClick={() => navigate(ROUTES.cabinDetail(cabin.id))}
      className="group flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card py-0 shadow-sm transition-all hover:-translate-y-0.5 hover:border-neutral-900/20 hover:shadow-md"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <div className="absolute inset-0">
          <CardImageCarousel images={cabin.images} alt={cabin.name} />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        {cabin.is_featured && (
          <span className="absolute right-2.5 top-2.5 z-10 rounded-md border border-white/15 bg-black/30 px-3 py-1 text-xs font-medium text-white shadow-sm backdrop-blur-md">
            ★ Destacado
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        <h3 className="line-clamp-1 text-[17px] font-bold leading-snug text-card-foreground">
          {cabin.name}
        </h3>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-0.5">
            <MapPin className="h-3 w-3" />
            {formatShortLocation(cabin.location)}
          </span>
        </div>
        <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
          {cabin.shortDescription}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-muted-foreground sm:text-xs">
          <span className="flex items-center gap-0.5">
            <Users className="h-3 w-3" /> {cabin.capacity} guests
          </span>
          <span>·</span>
          <span className="flex items-center gap-0.5">
            <BedDouble className="h-3 w-3" /> {cabin.bedrooms} hab.
          </span>
          <span>·</span>
          <span className="flex items-center gap-0.5">
            <Bath className="h-3 w-3" /> {cabin.bathrooms} baños
          </span>
        </div>
      </div>

      <div className="space-y-2.5 border-t border-border/30 p-3.5 pt-2.5 sm:p-4">
        <div className="text-right">
          <span className="block text-[10px] uppercase tracking-wide text-muted-foreground sm:mr-1 sm:inline">
            Desde
          </span>
          <span className="text-[15px] font-extrabold text-foreground sm:text-[17px]">
            {formatPrice(cabin.pricePerNight)}
            <span className="text-xs font-normal text-muted-foreground"> / noche</span>
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(ROUTES.cabinDetail(cabin.id));
          }}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-zinc-900 py-2 text-xs font-semibold text-white hover:bg-black"
        >
          Ver disponibilidad <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </article>
  );
}

/* ───────────── Tarjeta HORIZONTAL (lista 1 columna) ───────────── */

/**
 * CabinCardHorizontal — tarjeta horizontal de cabaña para vista de lista.
 */
export function CabinCardHorizontal({ cabin }: { cabin: NormalizedCabin }) {
  const navigate = useNavigate();

  return (
    <article
      onClick={() => navigate(ROUTES.cabinDetail(cabin.id))}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:border-neutral-900/20 hover:shadow-md sm:flex-row"
    >
      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden sm:aspect-none sm:min-h-[220px] sm:w-[320px] sm:self-stretch">
        <div className="absolute inset-0">
          <CardImageCarousel images={cabin.images} alt={cabin.name} />
        </div>
        {cabin.is_featured && (
          <span className="absolute right-2.5 top-2.5 z-10 rounded-md border border-white/15 bg-black/30 px-3 py-1 text-xs font-medium text-white shadow-sm backdrop-blur-md">
            ★ Destacado
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between p-4 sm:p-5">
        <div>
          <h3 className="line-clamp-1 text-lg font-bold text-card-foreground sm:text-[20px]">
            {cabin.name}
          </h3>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-0.5">
              <MapPin className="h-3.5 w-3.5" /> {cabin.location}
            </span>
          </div>
          <p className="mt-2 line-clamp-2 text-xs text-muted-foreground sm:text-sm">
            {cabin.shortDescription}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-0.5">
              <Users className="h-3.5 w-3.5" /> {cabin.capacity} huéspedes
            </span>
            <span className="flex items-center gap-0.5">
              <BedDouble className="h-3.5 w-3.5" /> {cabin.bedrooms} hab.
            </span>
            <span className="flex items-center gap-0.5">
              <Bath className="h-3.5 w-3.5" /> {cabin.bathrooms} baño(s)
            </span>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-border/30 pt-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="sm:text-right">
            <span className="block text-[10px] uppercase tracking-wide text-muted-foreground sm:mr-1 sm:inline">
              Desde
            </span>
            <span className="text-lg font-extrabold text-foreground">
              {formatPrice(cabin.pricePerNight)}
              <span className="text-xs font-normal text-muted-foreground"> / noche</span>
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(ROUTES.cabinDetail(cabin.id));
            }}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-zinc-900 px-5 py-2 text-xs font-semibold text-white hover:bg-black"
          >
            Ver disponibilidad <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
}
