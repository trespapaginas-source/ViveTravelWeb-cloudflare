import { useNavigate } from "react-router-dom";
import { Heart, Trash2, MapPin, ArrowRight, Compass, BedDouble } from "lucide-react";
import { useFavorites } from "@/hooks/use-favorites";
import { usePlanes } from "@/hooks/use-plans";
import { useCabanas } from "@/hooks/use-plans";
import { ROUTES } from "@/lib/routes";
import { formatPrice, formatShortLocation } from "@/lib/utils";

/**
 * FavoritesPage — colección de planes y cabañas guardados (localStorage).
 * Consume los datos vía hooks y filtra por los IDs favoritos.
 */
export function FavoritesPage() {
  const { favorites, isEmpty, toggle } = useFavorites();
  const { data: plans } = usePlanes();
  const { data: cabins } = useCabanas();
  const navigate = useNavigate();

  // Resolver favoritos a sus registros completos.
  const favPlans = favorites
    .filter((f) => f.type === "plan")
    .map((f) => plans.find((p) => p.id === f.id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const favCabins = favorites
    .filter((f) => f.type === "cabin")
    .map((f) => cabins.find((c) => c.id === f.id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ocean/10">
          <Heart className="h-6 w-6 fill-ocean text-ocean" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Tu Colección
          </h1>
          <p className="text-sm text-muted-foreground">
            {favorites.length} elemento{favorites.length !== 1 ? "s" : ""} guardado{favorites.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Empty state */}
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
          <Compass className="h-14 w-14 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-bold text-foreground">
            Aún no tienes favoritos
          </h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Explora nuestras experiencias y cabañas, y toca el corazón para
            guardarlas aquí.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => navigate(ROUTES.plansByCategory("pasadias"))}
              className="inline-flex items-center gap-2 rounded-full bg-ocean px-5 py-2.5 text-sm font-semibold text-white hover:bg-ocean-dark"
            >
              Explorar experiencias <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate(ROUTES.cabins)}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-accent"
            >
              Explorar cabañas <BedDouble className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Planes favoritos */}
          {favPlans.length > 0 && (
            <section>
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-muted-foreground">
                Experiencias ({favPlans.length})
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {favPlans.map((plan) => (
                  <FavCard
                    key={plan.id}
                    title={plan.name}
                    location={plan.location}
                    image={plan.images[0]}
                    priceLabel={formatPrice(plan.price)}
                    priceSuffix=""
                    onClick={() => navigate(ROUTES.planDetail(plan.id))}
                    onRemove={() => toggle(plan.id, "plan")}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Cabañas favoritas */}
          {favCabins.length > 0 && (
            <section>
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-muted-foreground">
                Cabañas ({favCabins.length})
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {favCabins.map((cabin) => (
                  <FavCard
                    key={cabin.id}
                    title={cabin.name}
                    location={cabin.location}
                    image={cabin.images[0]}
                    priceLabel={formatPrice(cabin.pricePerNight)}
                    priceSuffix=" / noche"
                    onClick={() => navigate(ROUTES.cabinDetail(cabin.id))}
                    onRemove={() => toggle(cabin.id, "cabin")}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function FavCard({
  title,
  location,
  image,
  priceLabel,
  priceSuffix,
  onClick,
  onRemove,
}: {
  title: string;
  location: string;
  image: string;
  priceLabel: string;
  priceSuffix: string;
  onClick: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
      <div className="relative h-40 overflow-hidden">
        <img
          src={image}
          alt={title}
          loading="lazy"
          className="h-full w-full cursor-pointer object-cover transition-transform duration-500 group-hover:scale-105"
          onClick={onClick}
          onError={(e) => {
            e.currentTarget.src =
              "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop";
          }}
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-rose-500 shadow transition-colors hover:bg-white"
          aria-label="Quitar de favoritos"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <div className="cursor-pointer p-4" onClick={onClick}>
        <h3 className="line-clamp-1 text-sm font-bold text-card-foreground group-hover:text-ocean">
          {title}
        </h3>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" /> {formatShortLocation(location)}
        </p>
        <p className="mt-2 text-sm font-extrabold text-foreground">
          {priceLabel}
          <span className="text-xs font-normal text-muted-foreground">
            {priceSuffix}
          </span>
        </p>
      </div>
    </div>
  );
}
