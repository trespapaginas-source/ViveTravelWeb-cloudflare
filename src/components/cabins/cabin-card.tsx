import { useNavigate } from "react-router-dom";
import { Star, MapPin, Users, BedDouble, Bath } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { formatPrice, formatShortLocation } from "@/lib/utils";
import type { NormalizedCabin } from "@/lib/data-access";

/**
 * Tarjeta de cabaña/alojamiento para el catálogo.
 */
export function CabinCard({ cabin }: { cabin: NormalizedCabin }) {
  const navigate = useNavigate();

  return (
    <article
      onClick={() => navigate(ROUTES.cabinDetail(cabin.id))}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
    >
      <div className="relative h-52 overflow-hidden">
        <img
          src={cabin.images[0]}
          alt={cabin.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src =
              "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop";
          }}
        />
        {cabin.is_featured && (
          <span className="absolute right-2 top-2 rounded-full bg-ocean px-2.5 py-1 text-[11px] font-semibold text-white">
            ★ Destacado
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-1 text-sm font-bold text-card-foreground">
          {cabin.name}
        </h3>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          {cabin.rating > 0 && (
            <span className="flex items-center gap-0.5">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {cabin.rating.toFixed(1)}
            </span>
          )}
          <span className="flex items-center gap-0.5">
            <MapPin className="h-3 w-3" />
            {formatShortLocation(cabin.location)}
          </span>
        </div>
        <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
          {cabin.shortDescription}
        </p>

        {/* Stats */}
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-0.5">
            <Users className="h-3 w-3" /> {cabin.capacity} huéspedes
          </span>
          <span className="flex items-center gap-0.5">
            <BedDouble className="h-3 w-3" /> {cabin.bedrooms} hab.
          </span>
          <span className="flex items-center gap-0.5">
            <Bath className="h-3 w-3" /> {cabin.bathrooms} baños
          </span>
        </div>

        <div className="mt-auto pt-4">
          <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">
            Desde
          </span>
          <span className="text-lg font-extrabold text-foreground">
            {formatPrice(cabin.pricePerNight)}
          </span>
          <span className="text-[11px] text-muted-foreground"> / noche</span>
        </div>
      </div>
    </article>
  );
}
