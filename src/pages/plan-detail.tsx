import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  MapPin,
  Clock,
  Users,
  Check,
  X,
  Sparkles,
  Navigation,
  Calendar as CalendarIcon,
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { usePlanDetail } from "@/hooks/use-detail";
import { useGoBack } from "@/hooks/use-go-back";
import { useGeoCity } from "@/hooks/use-geo-city";
import { ROUTES } from "@/lib/routes";
import { formatPrice, formatDateLong, cn } from "@/lib/utils";
import { PropertyGallery } from "@/components/shared/property-gallery";
import { EmptyState } from "@/components/shared/empty-state";
import { LugaresCarousel } from "@/components/plans/lugares-carousel";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  openWhatsApp,
  buildPlanQuoteMessage,
  type PlanQuoteData,
} from "@/lib/whatsapp";
import { useReviews } from "@/hooks/use-reviews";
import { ReviewForm } from "@/components/reviews/review-form";
import { ReviewList } from "@/components/reviews/review-list";
import { StarRating } from "@/components/reviews/star-rating";

/**
 * PlanDetailPage — detalle de un plan/experiencia.
 * Consume los datos vía `usePlanDetail(id)`.
 *
 * Refactor: itinerario en acordeón, lugares en carrusel, fechas de salida y
 * configuración de reserva dentro de un modal (sin tipo de habitación).
 */
export function PlanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: plan, notFound } = usePlanDetail(id);
  const goBack = useGoBack(ROUTES.plans);

  // Estado de reserva (campos del modal).
  const [reserveOpen, setReserveOpen] = useState(false);
  const [guests, setGuests] = useState(2);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [originCity, setOriginCity] = useState("");

  // Reseñas reales del plan (D1 vía Pages Function).
  const { reviews, avg, count, loading: reviewsLoading, submit } = useReviews(
    plan ? "plan" : null,
    plan?.id
  );

  // Detecta la ciudad del usuario por IP (no bloqueante). Si el usuario ya
  // escribió algo manualmente, no se sobreescribe (bandera touched).
  const { city: geoCity, loading: geoLoading } = useGeoCity();
  const [cityTouched, setCityTouched] = useState(false);
  useEffect(() => {
    if (!cityTouched && geoCity) {
      setOriginCity(geoCity);
    }
  }, [geoCity, cityTouched]);

  // Próximas fechas de salida (solo futuras).
  const upcomingDepartures = useMemo(() => {
    if (!plan?.departureDates) return [];
    const today = new Date().toISOString().split("T")[0];
    return plan.departureDates.filter((d) => d.end >= today);
  }, [plan]);

  if (notFound) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <EmptyState
          title="Plan no encontrado"
          description="La experiencia que buscas no existe o fue removida."
        />
      </div>
    );
  }
  if (!plan) return null;

  const total = formatPrice(guests * plan.price);
  const isFixedDeparture = plan.fixedDeparture === true;
  const maxGuests = plan.maxGuests || 30;
  const selectedDeparture = upcomingDepartures.find((d) => d.start === selectedDate);

  // Etiqueta de fecha para el mensaje de WhatsApp.
  const dateLabel = plan.fecha_salida
    ? plan.fecha_salida
    : isFixedDeparture
    ? selectedDeparture
      ? `${formatDateLong(selectedDeparture.start)} al ${formatDateLong(selectedDeparture.end)}`
      : "Por confirmar — salida programada"
    : selectedDate
    ? formatDateLong(selectedDate)
    : "Por definir";

  const handleReserve = () => {
    const quote: PlanQuoteData = {
      name: plan.name,
      location: plan.location,
      origin: originCity,
      guests,
      dateLabel,
      total,
    };
    openWhatsApp(buildPlanQuoteMessage(quote));
  };

  const handleShare = () => {
    const msg = `Mira este increíble plan en Vive Travel: ${plan.name}\n${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-32 pt-6 sm:px-6 lg:px-8 lg:pb-12">
      {/* Volver */}
      <button
        onClick={goBack}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Volver
      </button>

      {/* Galería */}
      <PropertyGallery
        images={plan.images}
        title={plan.name}
        variant="booking"
        className="mb-4"
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* Contenido principal */}
        <div className="min-w-0">
          {/* Título */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-neutral-900/90 px-3 py-1 text-xs font-semibold text-white">
                  {plan.category}
                </span>
                {/* Rating real de reseñas (D1); fallback al del JSON si no hay reseñas reales aún */}
                {(() => {
                  const displayAvg = count > 0 ? avg : plan.rating;
                  const displayCount = count > 0 ? count : plan.reviewCount;
                  if (displayAvg <= 0) return null;
                  return (
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <StarRating value={displayAvg} size="sm" />
                      <span>{displayAvg.toFixed(1)} ({displayCount})</span>
                    </span>
                  );
                })()}
              </div>
              <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                {plan.name}
              </h1>
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" /> {plan.location}
              </p>
            </div>
            <button
              onClick={handleShare}
              className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-accent"
            >
              Compartir
            </button>
          </div>

          {/* Stats rápidas */}
          <div className="mt-4 flex flex-wrap gap-4 border-y border-border py-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-neutral-900" /> {plan.duration}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-neutral-900" /> Máx. {plan.maxGuests} personas
            </span>
            {plan.difficulty && (
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-neutral-900" /> {plan.difficulty}
              </span>
            )}
          </div>

          {/* Descripción — Acerca de este plan */}
          <section id="general" className="mt-6 scroll-mt-24">
            <h2 className="text-lg font-bold text-foreground">Acerca de este plan</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {plan.fullDescription}
            </p>
          </section>

          {/* Lugares a conocer — carrusel (movido aquí, antes de Incluye) */}
          {plan.lugares && plan.lugares.length > 0 && (
            <LugaresCarousel lugares={plan.lugares} />
          )}

          {/* Incluye / No incluye */}
          <section id="incluye" className="mt-8 scroll-mt-24">
            <h2 className="text-lg font-bold text-foreground">Qué incluye este plan</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {plan.includes.map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-neutral-900" />
                  <span className="text-foreground">{item}</span>
                </div>
              ))}
            </div>
            {plan.excludes.length > 0 && (
              <>
                <h3 className="mt-5 text-sm font-semibold text-muted-foreground">
                  No incluye
                </h3>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {plan.excludes.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                      <span className="text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>

          {/* Actividades / Highlights */}
          {plan.highlights.length > 0 && (
            <section className="mt-8">
              <h2 className="text-lg font-bold text-foreground">
                Actividades incluidas
              </h2>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {plan.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-neutral-900" />
                    <span className="text-foreground">{h}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Itinerario — acordeón interactivo */}
          {plan.itinerary && plan.itinerary.length > 0 && (
            <section id="itinerario" className="mt-8 scroll-mt-24">
              <h2 className="text-lg font-bold text-foreground">Itinerario día a día</h2>
              <Accordion
                type="single"
                collapsible
                defaultValue="day-0"
                className="mt-3"
              >
                {plan.itinerary.map((day, i) => (
                  <AccordionItem key={i} value={`day-${i}`}>
                    <AccordionTrigger>
                      <span className="text-left text-[15px] text-foreground">
                        <span className="font-bold text-neutral-900">Día {i + 1}:</span>{" "}
                        <span className="font-normal">{day.title}</span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {day.description}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          )}

          {/* Horario y punto de encuentro */}
          {!isFixedDeparture && (plan.schedule || plan.meeting) && (
            <section className="mt-8">
              <h2 className="text-lg font-bold text-foreground">
                Horario y punto de encuentro
              </h2>
              <div className="mt-3 space-y-2">
                {plan.schedule && (
                  <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-sm">
                    <CalendarIcon className="mt-0.5 h-4 w-4 text-neutral-900" />
                    <div>
                      <strong>Horario:</strong> {plan.schedule}
                    </div>
                  </div>
                )}
                {plan.meeting && (
                  <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-sm">
                    <Navigation className="mt-0.5 h-4 w-4 text-neutral-900" />
                    <div>
                      <strong>Punto de encuentro:</strong> {plan.meeting}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Notas / Condiciones */}
          {plan.notes && plan.notes.length > 0 && (
            <section id="condiciones" className="mt-8 scroll-mt-24">
              <h2 className="text-lg font-bold text-foreground">
                Información importante
              </h2>
              <div className="mt-3 space-y-2">
                {plan.notes.map((note, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800"
                  >
                    {note}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Reseñas reales (D1 + Turnstile) */}
          <section className="mt-8">
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="text-lg font-bold text-foreground">Reseñas de viajeros</h2>
              {!reviewsLoading && count > 0 && (
                <span className="text-sm text-muted-foreground">
                  {avg.toFixed(1)} de 5 · {count} reseña{count !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <div className="space-y-4">
              <ReviewForm onSubmit={submit} />
              {reviewsLoading ? (
                <p className="text-center text-sm text-muted-foreground">Cargando reseñas…</p>
              ) : (
                <ReviewList reviews={reviews} />
              )}
            </div>
          </section>
        </div>

        {/* Cotizador (desktop sticky) — formulario directo en el sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-border bg-card p-5 shadow-sm">
            {/* Precio */}
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  {guests === 1 ? "Desde" : `Total (${guests} personas)`}
                </span>
                <p className="text-2xl font-extrabold text-foreground">{total}</p>
              </div>
              <span className="text-xs text-muted-foreground">{plan.priceRange}</span>
            </div>

            {/* Campos de reserva directos (sin modal en desktop) */}
            <div className="mt-4 space-y-3 border-t border-border pt-4">
              {/* Fecha de salida */}
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {isFixedDeparture ? "Fecha de salida" : "Fecha de viaje"}
                </label>
                {isFixedDeparture ? (
                  upcomingDepartures.length > 0 ? (
                    <DatePopover
                      upcomingDepartures={upcomingDepartures}
                      selectedDate={selectedDate}
                      onSelectDate={setSelectedDate}
                    />
                  ) : (
                    <p className="rounded-lg bg-muted/50 p-2.5 text-[11px] text-muted-foreground">
                      Salidas todo el año. Confirma al reservar.
                    </p>
                  )
                ) : (
                  <input
                    type="date"
                    value={selectedDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-neutral-900"
                  />
                )}
              </div>

              {/* Ciudad de origen (editable, autodetectada por IP) */}
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Ciudad de salida
                </label>
                <CityInput
                  value={originCity}
                  onChange={(c) => {
                    setCityTouched(true);
                    setOriginCity(c);
                  }}
                  loading={geoLoading}
                />
              </div>

              {/* Viajeros */}
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Viajeros
                </label>
                <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                  <span className="text-sm text-foreground">Personas</span>
                  <div className="flex items-center gap-2">
                    <StepperBtn
                      onClick={() => setGuests(Math.max(1, guests - 1))}
                      disabled={guests <= 1}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </StepperBtn>
                    <span className="w-8 text-center text-sm font-semibold">{guests}</span>
                    <StepperBtn
                      onClick={() => setGuests(Math.min(maxGuests, guests + 1))}
                      disabled={guests >= maxGuests}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </StepperBtn>
                  </div>
                </div>
              </div>
            </div>

            {/* Botón reservar directo */}
            <button
              onClick={handleReserve}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1DA851] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#17943e]"
            >
              <WhatsAppGlyph /> Reservar
            </button>

            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              Sin cargos por ahora · Cotización inmediata
            </p>

            <Link
              to={ROUTES.contact}
              className="mt-3 block text-center text-xs font-medium text-neutral-900 hover:underline"
            >
              ¿Dudas? Contáctanos directamente
              <ChevronRight className="ml-0.5 inline h-3 w-3" />
            </Link>
          </div>
        </aside>
      </div>

      {/* CTA flotante móvil */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[11px] uppercase text-muted-foreground">
              {guests === 1 ? "Desde" : `Total · ${guests} pers.`}
            </span>
            <p className="text-lg font-extrabold text-foreground">{total}</p>
          </div>
          <button
            onClick={() => setReserveOpen(true)}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-[#1DA851] px-5 py-2.5 text-sm font-semibold text-white"
          >
            <WhatsAppGlyph /> Reservar
          </button>
        </div>
      </div>

      {/* Modal de reserva */}
      <ReserveModal
        open={reserveOpen}
        onOpenChange={setReserveOpen}
        planName={plan.name}
        total={total}
        guests={guests}
        onGuestsChange={setGuests}
        maxGuests={plan.maxGuests || 30}
        isFixedDeparture={isFixedDeparture}
        upcomingDepartures={upcomingDepartures}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        originCity={originCity}
        onOriginCityChange={(c) => {
          setCityTouched(true);
          setOriginCity(c);
        }}
        geoLoading={geoLoading}
        onConfirm={handleReserve}
      />
    </div>
  );
}

/* ─────────────────────── Modal de reserva ─────────────────────── */

function ReserveModal({
  open,
  onOpenChange,
  planName,
  total,
  guests,
  onGuestsChange,
  maxGuests,
  isFixedDeparture,
  upcomingDepartures,
  selectedDate,
  onSelectDate,
  originCity,
  onOriginCityChange,
  geoLoading,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planName: string;
  total: string;
  guests: number;
  onGuestsChange: (n: number) => void;
  maxGuests: number;
  isFixedDeparture: boolean;
  upcomingDepartures: { start: string; end: string }[];
  selectedDate: string;
  onSelectDate: (d: string) => void;
  originCity: string;
  onOriginCityChange: (c: string) => void;
  geoLoading: boolean;
  onConfirm: () => void;
}) {
  // Controla si la lista de fechas está expandida o colapsada (móvil).
  // Por defecto expandida si no hay fecha elegida; al elegir una se colapsa
  // automáticamente para no llenar la pantalla con la lista completa.
  const [datesExpanded, setDatesExpanded] = useState(true);
  const hasSelection = !!selectedDate;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configura tu reserva</DialogTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">{planName}</p>
        </DialogHeader>

        <div className="space-y-5">
          {/* Fecha de salida */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {isFixedDeparture ? "Fecha de salida" : "Fecha de viaje"}
            </label>
            {isFixedDeparture ? (
              upcomingDepartures.length > 0 ? (
                <div>
                  {/* Resumen de la fecha seleccionada (colapsable) */}
                  {hasSelection && !datesExpanded && (
                    <button
                      type="button"
                      onClick={() => setDatesExpanded(true)}
                      className="flex w-full items-center justify-between rounded-lg border border-neutral-900 bg-neutral-50 p-2.5 text-left text-sm transition-colors hover:bg-neutral-100"
                    >
                      <div className="min-w-0">
                        <span className="block truncate text-[13px] font-semibold text-neutral-900">
                          {formatDateLong(selectedDate)}
                        </span>
                        {(() => {
                          const sel = upcomingDepartures.find(
                            (d) => d.start === selectedDate
                          );
                          return sel ? (
                            <span className="text-[11px] text-muted-foreground">
                              al {formatDateLong(sel.end)}
                            </span>
                          ) : null;
                        })()}
                      </div>
                      <span className="flex items-center gap-1 text-[11px] font-medium text-neutral-900">
                        Cambiar
                        <ChevronDown className="h-3.5 w-3.5" />
                      </span>
                    </button>
                  )}

                  {/* Lista completa de fechas (colapsable) */}
                  {(!hasSelection || datesExpanded) && (
                    <div className="max-h-[260px] space-y-1.5 overflow-y-auto rounded-xl border border-border p-1.5">
                      {upcomingDepartures.map((d) => {
                        const isSelected = selectedDate === d.start;
                        return (
                          <button
                            key={d.start}
                            type="button"
                            onClick={() => {
                              onSelectDate(d.start);
                              // Colapsa automáticamente tras elegir.
                              setDatesExpanded(false);
                            }}
                            className={cn(
                              "flex w-full items-center justify-between rounded-lg border p-2.5 text-left text-sm transition-colors",
                              isSelected
                                ? "border-neutral-900 bg-neutral-50"
                                : "border-transparent hover:bg-muted"
                            )}
                          >
                            <div className="min-w-0">
                              <span
                                className={cn(
                                  "block truncate text-[13px] font-semibold",
                                  isSelected ? "text-neutral-900" : "text-foreground"
                                )}
                              >
                                {formatDateLong(d.start)}
                              </span>
                              <span className="text-[11px] text-muted-foreground">
                                al {formatDateLong(d.end)}
                              </span>
                            </div>
                            {isSelected && (
                              <Check className="h-4 w-4 shrink-0 text-neutral-900" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <p className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                  Salidas programadas todo el año. Confirma la próxima salida
                  disponible al reservar por WhatsApp.
                </p>
              )
            ) : (
              <input
                type="date"
                value={selectedDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => onSelectDate(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-neutral-900"
              />
            )}
          </div>

          {/* Ciudad de origen (editable, autodetectada por IP) */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Ciudad de salida
            </label>
            <CityInput
              value={originCity}
              onChange={onOriginCityChange}
              loading={geoLoading}
            />
          </div>

          {/* Viajeros */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Viajeros
            </label>
            <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
              <span className="text-sm text-foreground">Personas</span>
              <div className="flex items-center gap-2">
                <StepperBtn
                  onClick={() => onGuestsChange(Math.max(1, guests - 1))}
                  disabled={guests <= 1}
                >
                  <Minus className="h-3.5 w-3.5" />
                </StepperBtn>
                <span className="w-8 text-center text-sm font-semibold">{guests}</span>
                <StepperBtn
                  onClick={() => onGuestsChange(Math.min(maxGuests, guests + 1))}
                  disabled={guests >= maxGuests}
                >
                  <Plus className="h-3.5 w-3.5" />
                </StepperBtn>
              </div>
            </div>
          </div>

          {/* Total + confirmar */}
          <div className="flex items-center justify-between border-t border-border pt-4">
            <div>
              <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Total estimado
              </span>
              <p className="text-xl font-extrabold text-foreground">{total}</p>
            </div>
            <button
              onClick={() => {
                onOpenChange(false);
                onConfirm();
              }}
              className="flex items-center gap-2 rounded-xl bg-[#1DA851] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#17943e]"
            >
              <WhatsAppGlyph /> Confirmar y reservar
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─────────────────────── Sub-componentes ─────────────────────── */

/** Ciudades colombianas sugeridas en el datalist del input de ciudad. */
const POPULAR_CITIES = [
  "Barranquilla",
  "Bogotá",
  "Medellín",
  "Cali",
  "Cartagena",
  "Santa Marta",
  "Bucaramanga",
  "Pereira",
  "Manizales",
  "Cúcuta",
];

/**
 * CityInput — input de texto editable para la ciudad de salida, con un
 * `datalist` que sugiere las principales ciudades colombianas. Muestra un
 * indicador sutil mientras se detecta la ubicación por IP.
 */
function CityInput({
  value,
  onChange,
  loading,
}: {
  value: string;
  onChange: (v: string) => void;
  loading?: boolean;
}) {
  return (
    <div className="relative">
      <input
        type="text"
        list="popular-cities"
        value={value}
        placeholder={loading ? "Detectando ubicación…" : "Escribe tu ciudad"}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-neutral-900"
      />
      <datalist id="popular-cities">
        {POPULAR_CITIES.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
      {loading && !value && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2">
          <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-neutral-900/30 border-t-neutral-900" />
        </span>
      )}
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
      className="flex h-7 w-7 items-center justify-center rounded-full border border-border disabled:opacity-40"
    >
      {children}
    </button>
  );
}

/**
 * DatePopover — trigger compacto que muestra la fecha seleccionada y, al
 * pulsarlo, despliega la lista de próximas salidas (popover). Pensado para
 * el sidebar de desktop donde el espacio es limitado y una lista siempre
 * visible sería demasiado alta.
 */
function DatePopover({
  upcomingDepartures,
  selectedDate,
  onSelectDate,
}: {
  upcomingDepartures: { start: string; end: string }[];
  selectedDate: string;
  onSelectDate: (d: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected =
    upcomingDepartures.find((d) => d.start === selectedDate) ?? null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center justify-between rounded-lg border bg-background px-3 py-2 text-left text-sm outline-none transition-colors",
          open ? "border-neutral-900" : "border-border focus:border-neutral-900"
        )}
      >
        <span className={cn("truncate", selected ? "text-foreground" : "text-muted-foreground")}>
          {selected
            ? `${formatDateLong(selected.start)}`
            : "Elige una fecha disponible"}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <>
          {/* Capa para cerrar al clicar fuera */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-[260px] overflow-y-auto rounded-xl border border-border bg-white p-1.5 shadow-lg">
            {upcomingDepartures.map((d) => {
              const isSelected = selectedDate === d.start;
              return (
                <button
                  key={d.start}
                  type="button"
                  onClick={() => {
                    onSelectDate(d.start);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg border p-2.5 text-left text-sm transition-colors",
                    isSelected
                      ? "border-neutral-900 bg-neutral-50"
                      : "border-transparent hover:bg-muted"
                  )}
                >
                  <div className="min-w-0">
                    <span
                      className={cn(
                        "block truncate text-[13px] font-semibold",
                        isSelected ? "text-neutral-900" : "text-foreground"
                      )}
                    >
                      {formatDateLong(d.start)}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      al {formatDateLong(d.end)}
                    </span>
                  </div>
                  {isSelected && <Check className="h-4 w-4 shrink-0 text-neutral-900" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function WhatsAppGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.7.3-.3.3-.9.9-.9 2.2 0 1.3.9 2.5 1.1 2.7.1.2 1.9 2.9 4.6 4 .6.3 1.1.4 1.5.5.6.2 1.2.2 1.6.1.5-.1 1.7-.7 1.9-1.3.2-.6.2-1.2.2-1.3-.1-.1-.3-.2-.6-.3z" />
      <path d="M12 2a10 10 0 0 0-8.5 15.3L2 22l4.8-1.5A10 10 0 1 0 12 2zm0 18.3c-1.5 0-3-.4-4.3-1.2l-.3-.2-2.9.9.9-2.8-.2-.3A8.3 8.3 0 1 1 12 20.3z" />
    </svg>
  );
}
