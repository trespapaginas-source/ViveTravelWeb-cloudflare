import { useState } from "react";
import { useParams } from "react-router-dom";
import { useGoBack } from "@/hooks/use-go-back";
import {
  ArrowLeft,
  MapPin,
  Users,
  BedDouble,
  Bath,
  Waves,
  Check,
  Shield,
  AlertCircle,
  Sparkles,
  Maximize2,
} from "lucide-react";
import { useCabinDetail } from "@/hooks/use-detail";
import { ROUTES } from "@/lib/routes";
import { formatPrice } from "@/lib/utils";
import { PropertyGallery } from "@/components/shared/property-gallery";
import { EmptyState } from "@/components/shared/empty-state";
import {
  openWhatsApp,
  buildCabinQuoteMessage,
} from "@/lib/whatsapp";

/**
 * CabinDetailPage — detalle de una cabaña/alojamiento.
 * Consume los datos vía `useCabinDetail(id)`.
 */
export function CabinDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: cabin, notFound } = useCabinDetail(id);
  const goBack = useGoBack(ROUTES.cabins);

  const [guests, setGuests] = useState(2);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  if (notFound) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <EmptyState
          title="Cabaña no encontrada"
          description="El alojamiento que buscas no existe o fue removido."
        />
      </div>
    );
  }
  if (!cabin) return null;

  const nightCount = computeNights(checkIn, checkOut);
  const subtotal = nightCount * cabin.pricePerNight;
  const serviceFee = Math.round(subtotal * 0.08);
  const total = subtotal + serviceFee;

  const handleReserve = () => {
    if (!checkIn || !checkOut) return;
    openWhatsApp(
      buildCabinQuoteMessage({
        name: cabin.name,
        location: cabin.location,
        checkIn: formatDate(checkIn),
        checkOut: formatDate(checkOut),
        guests,
        capacity: cabin.capacity,
        nights: nightCount,
        total: formatPrice(total),
      })
    );
  };

  const handleInquiry = () => {
    openWhatsApp(
      `Hola, me interesa la ${cabin.name} en ${cabin.location}. ¿Podrían darme más información?`
    );
  };

  // Habitaciones activas ordenadas.
  const rooms = (cabin.bedroomDetails ?? [])
    .filter((r) => r.active !== false)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-32 pt-6 sm:px-6 lg:px-8 lg:pb-12">
      {/* Volver */}
      <button
        onClick={goBack}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Volver
      </button>

      {/* Galería */}
      <PropertyGallery
        images={cabin.images}
        title={cabin.name}
        variant="cabin"
        className="mb-6"
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* Contenido principal */}
        <div className="min-w-0">
          {/* Título */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <span className="rounded-full bg-ocean/85 px-3 py-1 text-xs font-semibold text-white">
                {cabin.propertyType}
              </span>
              <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                {cabin.name}
              </h1>
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" /> {cabin.location}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 grid grid-cols-2 gap-3 border-y border-border py-4 sm:grid-cols-4">
            <Stat icon={<Users className="h-5 w-5" />} value={`${cabin.capacity}`} label="huéspedes" />
            <Stat icon={<BedDouble className="h-5 w-5" />} value={`${cabin.bedrooms}`} label="habitaciones" />
            <Stat icon={<Bath className="h-5 w-5" />} value={`${cabin.bathrooms}`} label="baños" />
            <Stat icon={<Waves className="h-5 w-5" />} value="Piscina" label="y más" />
          </div>

          {/* Descripción */}
          <section className="mt-6">
            <h2 className="text-lg font-bold text-foreground">
              Acerca de esta cabaña
            </h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {cabin.fullDescription}
            </p>
          </section>

          {/* Habitaciones */}
          {rooms.length > 0 && (
            <section className="mt-8">
              <h2 className="text-lg font-bold text-foreground">
                ¿Dónde vas a dormir?
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {cabin.bedrooms} habitaciones · {cabin.capacity} huéspedes
              </p>
              <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto pb-2">
                {rooms.map((room) => {
                  const imgs = room.images?.length ? room.images : [room.image];
                  return (
                    <RoomCard key={room.id} title={room.title} beds={room.beds} image={imgs[0]} />
                  );
                })}
              </div>
            </section>
          )}

          {/* Puntos destacados */}
          {cabin.highlights.length > 0 && (
            <section className="mt-8">
              <h2 className="text-lg font-bold text-foreground">Puntos destacados</h2>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {cabin.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-ocean" />
                    <span className="text-foreground">{h}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Comodidades */}
          {cabin.amenities.length > 0 && (
            <section className="mt-8">
              <h2 className="text-lg font-bold text-foreground">Comodidades</h2>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {cabin.amenities.map((a, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <span className="text-foreground">{a}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Reglas */}
          {cabin.rules.length > 0 && (
            <section className="mt-8">
              <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                <Shield className="h-5 w-5 text-ocean" /> Reglas de la cabaña
              </h2>
              <div className="mt-3 space-y-2">
                {cabin.rules.map((r, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-sm"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="text-muted-foreground">{r}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Ubicación */}
          <section className="mt-8">
            <h2 className="text-lg font-bold text-foreground">A dónde irás</h2>
            <p className="mt-1 text-sm text-muted-foreground">{cabin.location}</p>
            <div className="mt-3 overflow-hidden rounded-2xl border border-border">
              <iframe
                title={`Mapa de ${cabin.name}`}
                src={`https://maps.google.com/maps?q=${encodeURIComponent(
                  cabin.location
                )}&z=14&output=embed`}
                className="h-[280px] w-full"
                loading="lazy"
              />
            </div>
            {cabin.mapsUrl && (
              <a
                href={cabin.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-xs font-medium text-ocean hover:underline"
              >
                Ver ubicación exacta en Google Maps
              </a>
            )}
          </section>
        </div>

        {/* Price card (desktop sticky) */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-extrabold text-foreground">
                  {formatPrice(cabin.pricePerNight)}
                </span>
                <span className="text-sm text-muted-foreground"> / noche</span>
              </div>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{cabin.priceRange}</p>

            {/* Fechas */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">
                  Check-in
                </label>
                <input
                  type="date"
                  value={checkIn}
                  min={todayStr()}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-2 py-2 text-sm outline-none focus:border-ocean"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">
                  Check-out
                </label>
                <input
                  type="date"
                  value={checkOut}
                  min={checkIn || todayStr()}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-2 py-2 text-sm outline-none focus:border-ocean"
                />
              </div>
            </div>

            {/* Huéspedes */}
            <div className="mt-3">
              <label className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">
                Huéspedes
              </label>
              <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                <span className="text-sm">Personas (máx. {cabin.capacity})</span>
                <div className="flex items-center gap-2">
                  <StepperBtn onClick={() => setGuests((g) => Math.max(1, g - 1))} disabled={guests <= 1}>
                    −
                  </StepperBtn>
                  <span className="w-6 text-center text-sm font-semibold">{guests}</span>
                  <StepperBtn
                    onClick={() => setGuests((g) => Math.min(cabin.capacity, g + 1))}
                    disabled={guests >= cabin.capacity}
                  >
                    +
                  </StepperBtn>
                </div>
              </div>
            </div>

            {/* Desglose de precio */}
            {nightCount > 0 && (
              <div className="mt-4 space-y-1 border-t border-border pt-3 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>
                    {formatPrice(cabin.pricePerNight)} × {nightCount} noche{nightCount !== 1 ? "s" : ""}
                  </span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Tarifa de servicio (8%)</span>
                  <span>{formatPrice(serviceFee)}</span>
                </div>
                <div className="flex justify-between pt-1 font-bold text-foreground">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            )}

            {/* Botones */}
            <button
              onClick={handleReserve}
              disabled={!checkIn || !checkOut}
              className="mt-4 w-full rounded-xl bg-[#1DA851] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#17943e] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Reservar por WhatsApp
            </button>
            <button
              onClick={handleInquiry}
              className="mt-2 w-full rounded-xl border border-border py-2.5 text-sm font-medium text-foreground hover:bg-accent"
            >
              Preguntar por WhatsApp
            </button>

            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              No se hará ningún cargo por el momento
            </p>
          </div>
        </aside>
      </div>

      {/* CTA flotante móvil */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="text-[11px] uppercase text-muted-foreground">Desde</span>
            <p className="text-lg font-extrabold text-foreground">
              {formatPrice(cabin.pricePerNight)}
              <span className="text-xs font-normal text-muted-foreground"> / noche</span>
            </p>
          </div>
          <button
            onClick={handleInquiry}
            className="rounded-xl bg-[#1DA851] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Consultar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── Sub-componentes ─────────────────────── */

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <span className="text-ocean">{icon}</span>
      <span className="text-sm font-bold text-foreground">{value}</span>
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
  );
}

function RoomCard({
  title,
  beds,
  image,
}: {
  title: string;
  beds: string;
  image: string;
}) {
  return (
    <div className="w-[160px] shrink-0 overflow-hidden rounded-xl border border-border">
      <div className="relative h-[110px]">
        <img
          src={image}
          alt={title}
          loading="lazy"
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.src =
              "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=300&fit=crop";
          }}
        />
        <div className="absolute right-1.5 top-1.5 rounded-full bg-black/50 p-1 text-white">
          <Maximize2 className="h-3 w-3" />
        </div>
      </div>
      <div className="p-2">
        <p className="text-xs font-bold text-foreground">{title}</p>
        <p className="text-[11px] text-muted-foreground">{beds}</p>
      </div>
    </div>
  );
}

function StepperBtn({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-sm disabled:opacity-40"
    >
      {children}
    </button>
  );
}

/* ─────────────────────── Helpers ─────────────────────── */

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function computeNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.max(0, Math.round(diff / 86400000));
}

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
