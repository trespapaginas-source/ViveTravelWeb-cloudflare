import { useState } from "react";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";
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
  Star,
  Calendar,
  Minus,
  Plus,
} from "lucide-react";
import { useCabinDetail } from "@/hooks/use-detail";
import { useIcalBlockedDates } from "@/hooks/use-ical-blocked-dates";
import { ROUTES } from "@/lib/routes";
import { formatPrice, cn } from "@/lib/utils";
import { PropertyGallery, Lightbox } from "@/components/shared/property-gallery";
import { GallerySidebar } from "@/components/shared/gallery-sidebar";
import { EmptyState } from "@/components/shared/empty-state";
import { AvailabilityCalendar } from "@/components/cabins/availability-calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  openWhatsApp,
  buildCabinQuoteMessage,
} from "@/lib/whatsapp";
import { useReviews } from "@/hooks/use-reviews";
import { ReviewForm } from "@/components/reviews/review-form";
import { ReviewList } from "@/components/reviews/review-list";
import { StarRating } from "@/components/reviews/star-rating";

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
  const [roomLightbox, setRoomLightbox] = useState<{
    title: string;
    images: string[];
  } | null>(null);

  // Disponibilidad iCal + selección de rango + modal de cotización.
  const { blockedDates, loading: icalLoading, error: icalError } =
    useIcalBlockedDates(cabin?.icsUrl);
  const [calendarRange, setCalendarRange] = useState<{
    checkIn: Date | null;
    checkOut: Date | null;
  }>({ checkIn: null, checkOut: null });
  const [quoteOpen, setQuoteOpen] = useState(false);

  // Datos del modal de cotización.
  const [quoteAdults, setQuoteAdults] = useState(2);
  const [quoteChildren, setQuoteChildren] = useState(0);
  const [quoteName, setQuoteName] = useState("");
  const [quotePhone, setQuotePhone] = useState("");

  // Reseñas reales de la cabaña (D1 vía Pages Function).
  const { reviews, avg, count, loading: reviewsLoading, submit } = useReviews(
    cabin ? "cabin" : null,
    cabin?.id
  );

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

  // Rango seleccionado válido: hay checkIn y checkOut del calendario.
  const hasValidRange =
    !!calendarRange.checkIn && !!calendarRange.checkOut && cabin !== null;
  const rangeNights =
    calendarRange.checkIn && calendarRange.checkOut
      ? Math.round(
          (calendarRange.checkOut.getTime() - calendarRange.checkIn.getTime()) /
            86400000
        )
      : 0;

  // Abre el modal de cotización si hay rango válido.
  const handleOpenQuote = () => {
    if (!hasValidRange) return;
    setQuoteOpen(true);
  };

  // Envía la cotización por WhatsApp con todos los datos del modal.
  const handleSubmitQuote = () => {
    if (!cabin || !calendarRange.checkIn || !calendarRange.checkOut) return;
    const ci = format(calendarRange.checkIn, "d MMM", { locale: es });
    const co = format(calendarRange.checkOut, "d MMM", { locale: es });
    const msg = `¡Hola! Quisiera cotizar mi estancia en ${cabin.name} del ${ci} al ${co} (${rangeNights} noches) para ${quoteAdults} adultos y ${quoteChildren} niños. Mi nombre es ${quoteName}.`;
    openWhatsApp(msg);
    setQuoteOpen(false);
  };

  // Scroll suave hacia el formulario de reseñas (usado por el badge "Sin reseñas").
  const scrollToReviews = () => {
    const el = document.getElementById("review-form");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Habitaciones activas ordenadas.
  const rooms = (cabin.bedroomDetails ?? [])
    .filter((r) => r.active !== false)
    .sort((a, b) => a.order - b.order);

  // Títulos/visibilidad de secciones personalizables desde el admin (CMS).
  const sectionTitle = (key: string, fallback: string) =>
    cabin.sectionTitles?.[key] || fallback;
  const sectionVisible = (key: string) => cabin.sectionVisibility?.[key] ?? true;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-32 pt-6 sm:px-6 lg:px-8 lg:pb-12">
      {/* Volver */}
      <button
        onClick={goBack}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Volver
      </button>

      {/* Galería + sidebar de reseñas/mapa (solo desktop; móvil sin cambios) */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-stretch">
        <PropertyGallery
          images={cabin.images}
          title={cabin.name}
          variant="booking"
          className="lg:min-w-0 lg:flex-1"
        />
        <GallerySidebar
          avg={avg}
          count={count}
          reviews={reviews}
          location={cabin.location}
          onWriteReview={scrollToReviews}
          className="hidden lg:flex lg:w-[260px] lg:shrink-0"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* Contenido principal */}
        <div className="min-w-0">
          {/* Título */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <span className="rounded-full bg-neutral-900/90 px-3 py-1 text-xs font-semibold text-white">
                {cabin.propertyType}
              </span>
              <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                {cabin.name}
              </h1>
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" /> {cabin.location}
              </p>
              {/* Rating real desde D1. Si no hay reseñas, estado neutral + CTA. */}
              {reviewsLoading ? null : count > 0 ? (
                <span className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <StarRating value={avg} size="sm" />
                  <span>{avg.toFixed(1)} ({count})</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={scrollToReviews}
                  className="mt-1 flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <Star className="h-3.5 w-3.5 fill-neutral-300 text-neutral-300" />
                  <span>Sin reseñas</span>
                  <span className="text-neutral-900 underline-offset-2 hover:underline">
                    · Sé el primero en opinar
                  </span>
                </button>
              )}
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
          {sectionVisible("about") && (
            <section className="mt-6">
              <h2 className="text-lg font-bold text-foreground">
                {sectionTitle("about", "Acerca de esta cabaña")}
              </h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {cabin.fullDescription}
              </p>
            </section>
          )}

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
                    <RoomCard
                      key={room.id}
                      title={room.title}
                      beds={room.beds}
                      image={imgs[0]}
                      onClick={() => setRoomLightbox({ title: room.title, images: imgs })}
                    />
                  );
                })}
              </div>
            </section>
          )}

          {/* Disponibilidad en tiempo real (iCal) */}
          <section className="mt-8">
            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <Calendar className="h-5 w-5 text-neutral-900" />
              Disponibilidad en tiempo real
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Consulta las fechas disponibles para esta cabaña. La disponibilidad se actualiza en tiempo real para garantizar tu reserva.
            </p>
            {icalError && (
              <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                No pudimos sincronizar el calendario en este momento. Las fechas mostradas pueden no reflejar la disponibilidad exacta — confirma tu reserva por WhatsApp.
              </p>
            )}
            <div className="mt-4 max-w-md">
              <AvailabilityCalendar
                blockedDates={blockedDates}
                loading={icalLoading}
                onChange={setCalendarRange}
              />
            </div>
          </section>

          {/* Puntos destacados */}
          {cabin.highlights.length > 0 && sectionVisible("highlights") && (
            <section className="mt-8">
              <h2 className="text-lg font-bold text-foreground">
                {sectionTitle("highlights", "Puntos destacados")}
              </h2>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {cabin.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-neutral-900" />
                    <span className="text-foreground">{h}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Comodidades */}
          {cabin.amenities.length > 0 && sectionVisible("amenities") && (
            <section className="mt-8">
              <h2 className="text-lg font-bold text-foreground">
                {sectionTitle("amenities", "Comodidades")}
              </h2>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {cabin.amenities.map((a, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-neutral-900" />
                    <span className="text-foreground">{a}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Reglas */}
          {cabin.rules.length > 0 && sectionVisible("rules") && (
            <section className="mt-8">
              <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                <Shield className="h-5 w-5 text-neutral-900" />{" "}
                {sectionTitle("rules", "Reglas de la cabaña")}
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
          {sectionVisible("location") && (
            <section className="mt-8">
              <h2 className="text-lg font-bold text-foreground">
                {sectionTitle("location", "A dónde irás")}
              </h2>
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
                  className="mt-2 inline-block text-xs font-medium text-neutral-900 hover:underline"
                >
                  Ver ubicación en Google Maps
                </a>
              )}
            </section>
          )}

          {/* Reseñas reales (D1 + Turnstile) */}
          <section id="resenas" className="mt-8 scroll-mt-24">
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="text-lg font-bold text-foreground">Reseñas de huéspedes</h2>
              {!reviewsLoading && count > 0 && (
                <span className="text-sm text-muted-foreground">
                  {avg.toFixed(1)} de 5 · {count} reseña{count !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <div className="space-y-4">
              <ReviewForm onSubmit={submit} formId="review-form" />
              {reviewsLoading ? (
                <p className="text-center text-sm text-muted-foreground">Cargando reseñas…</p>
              ) : (
                <ReviewList reviews={reviews} />
              )}
            </div>
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
            <p className="mt-0.5 text-[10px] font-normal normal-case text-muted-foreground/70">
              Impuestos y cargos incluidos
            </p>

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
                  className="w-full rounded-lg border border-border bg-background px-2 py-2 text-sm outline-none focus:border-neutral-900"
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
                  className="w-full rounded-lg border border-border bg-background px-2 py-2 text-sm outline-none focus:border-neutral-900"
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
          <div className="min-w-0">
            <span className="text-[11px] uppercase text-muted-foreground">Desde</span>
            <p className="text-lg font-extrabold text-foreground">
              {formatPrice(cabin.pricePerNight)}
              <span className="text-xs font-normal text-muted-foreground"> / noche</span>
            </p>
            <p className="text-[10px] font-normal normal-case text-muted-foreground/70">
              Impuestos y cargos incluidos
            </p>
          </div>
          <button
            onClick={hasValidRange ? handleOpenQuote : handleInquiry}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-colors",
              hasValidRange
                ? "animate-pulse bg-[#1DA851] hover:bg-[#17943e]"
                : "bg-[#1DA851] hover:bg-[#17943e]"
            )}
          >
            {hasValidRange ? (
              <>
                Cotizar <span className="text-xs opacity-90">· {rangeNights} noches</span>
              </>
            ) : (
              "Consultar"
            )}
          </button>
        </div>
      </div>

      {/* Visor de fotos de la habitación seleccionada */}
      {roomLightbox && (
        <Lightbox
          images={roomLightbox.images}
          initialIndex={0}
          title={roomLightbox.title}
          onClose={() => setRoomLightbox(null)}
        />
      )}

      {/* Modal de cotización (rango seleccionado en el calendario) */}
      <Dialog open={quoteOpen} onOpenChange={setQuoteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cotiza tu estancia</DialogTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">{cabin.name}</p>
          </DialogHeader>

          <div className="space-y-5">
            {/* Resumen de la reserva */}
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <div>
                  <span className="block text-[11px] uppercase tracking-wide text-muted-foreground">
                    Fechas
                  </span>
                  <span className="font-semibold text-foreground">
                    {calendarRange.checkIn &&
                      format(calendarRange.checkIn, "d MMM", { locale: es })}
                    {calendarRange.checkOut &&
                      " - " + format(calendarRange.checkOut, "d MMM", { locale: es })}
                  </span>
                </div>
                <div className="text-right">
                  <span className="block text-[11px] uppercase tracking-wide text-muted-foreground">
                    Estadía
                  </span>
                  <span className="font-semibold text-foreground">
                    {rangeNights} {rangeNights === 1 ? "noche" : "noches"}
                  </span>
                </div>
              </div>
            </div>

            {/* Huéspedes: adultos y niños */}
            <div className="grid grid-cols-2 gap-3">
              <GuestStepper
                label="Adultos"
                value={quoteAdults}
                onChange={setQuoteAdults}
                min={1}
                max={cabin.capacity}
              />
              <GuestStepper
                label="Niños"
                value={quoteChildren}
                onChange={setQuoteChildren}
                min={0}
                max={Math.max(0, cabin.capacity - quoteAdults)}
              />
            </div>

            {/* Datos de contacto */}
            <div className="space-y-3">
              <div>
                <label htmlFor="quote-name" className="mb-1 block text-xs font-medium text-gray-600">
                  Nombre completo
                </label>
                <input
                  id="quote-name"
                  type="text"
                  value={quoteName}
                  maxLength={60}
                  onChange={(e) => setQuoteName(e.target.value)}
                  placeholder="Ej: María González"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-neutral-900"
                />
              </div>
              <div>
                <label htmlFor="quote-phone" className="mb-1 block text-xs font-medium text-gray-600">
                  Teléfono / WhatsApp
                </label>
                <input
                  id="quote-phone"
                  type="tel"
                  value={quotePhone}
                  maxLength={20}
                  onChange={(e) => setQuotePhone(e.target.value)}
                  placeholder="Ej: 300 123 4567"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-neutral-900"
                />
              </div>
            </div>

            {/* Botón de envío */}
            <button
              type="button"
              onClick={handleSubmitQuote}
              disabled={quoteName.trim().length < 2}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1DA851] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#17943e] disabled:opacity-50"
            >
              <WhatsAppGlyph /> Enviar cotización por WhatsApp
            </button>
            <p className="text-center text-[11px] text-muted-foreground">
              Sin cargos por ahora · Cotización inmediata
            </p>
          </div>
        </DialogContent>
      </Dialog>
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
      <span className="text-neutral-900">{icon}</span>
      <span className="text-sm font-bold text-foreground">{value}</span>
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
  );
}

function RoomCard({
  title,
  beds,
  image,
  onClick,
}: {
  title: string;
  beds: string;
  image: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-[160px] shrink-0 overflow-hidden rounded-xl border border-border text-left"
    >
      <div className="h-[110px]">
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
      </div>
      <div className="p-2">
        <p className="text-xs font-bold text-foreground">{title}</p>
        <p className="text-[11px] text-muted-foreground">{beds}</p>
      </div>
    </button>
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

/** Stepper numérico para adultos/niños en el modal de cotización. */
function GuestStepper({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
}) {
  return (
    <div>
      <span className="mb-1 block text-xs font-medium text-gray-600">{label}</span>
      <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
        <span className="text-sm">{value}</span>
        <div className="flex items-center gap-2">
          <StepperBtn
            onClick={() => onChange(Math.max(min, value - 1))}
            disabled={value <= min}
          >
            <Minus className="h-3.5 w-3.5" />
          </StepperBtn>
          <StepperBtn
            onClick={() => onChange(Math.min(max, value + 1))}
            disabled={value >= max}
          >
            <Plus className="h-3.5 w-3.5" />
          </StepperBtn>
        </div>
      </div>
    </div>
  );
}

/** Glyph de WhatsApp para botones (SVG inline). */
function WhatsAppGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.7.3-.3.3-.9.9-.9 2.2 0 1.3.9 2.5 1.1 2.7.1.2 1.9 2.9 4.6 4 .6.3 1.1.4 1.5.5.6.2 1.2.2 1.6.1.5-.1 1.7-.7 1.9-1.3.2-.6.2-1.2.2-1.3-.1-.1-.3-.2-.6-.3z" />
      <path d="M12 2a10 10 0 0 0-8.5 15.3L2 22l4.8-1.5A10 10 0 1 0 12 2zm0 18.3c-1.5 0-3-.4-4.3-1.2l-.3-.2-2.9.9.9-2.8-.2-.3A8.3 8.3 0 1 1 12 20.3z" />
    </svg>
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
