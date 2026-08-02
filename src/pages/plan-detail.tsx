import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useGoBack } from "@/hooks/use-go-back";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Users,
  Check,
  X,
  Sparkles,
  CalendarDays,
  Navigation,
  Calendar as CalendarIcon,
  Minus,
  Plus,
  ChevronRight,
} from "lucide-react";
import { usePlanDetail } from "@/hooks/use-detail";
import { ROUTES } from "@/lib/routes";
import { formatPrice, formatDateLong, cn } from "@/lib/utils";
import { PropertyGallery } from "@/components/shared/property-gallery";
import { EmptyState } from "@/components/shared/empty-state";
import {
  openWhatsApp,
  buildPlanQuoteMessage,
  type PlanQuoteData,
} from "@/lib/whatsapp";

/**
 * PlanDetailPage — detalle de un plan/experiencia.
 * Consume los datos vía `usePlanDetail(id)`.
 */
export function PlanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: plan, notFound } = usePlanDetail(id);
  const goBack = useGoBack(ROUTES.plans);

  const [guests, setGuests] = useState(2);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [originCity, setOriginCity] = useState("Barranquilla");
  const [roomType, setRoomType] = useState<"individual" | "doble" | "triple" | "cuadruple">("doble");

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
  const selectedDeparture = upcomingDepartures.find((d) => d.start === selectedDate);

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
      roomType: roomTypeLabel(roomType),
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
        <ArrowLeft className="h-4 w-4" /> Volver
      </button>

      {/* Galería */}
      <PropertyGallery
        images={plan.images}
        title={plan.name}
        variant="booking"
        className="mb-6"
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* Contenido principal */}
        <div className="min-w-0">
          {/* Título */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-ocean/85 px-3 py-1 text-xs font-semibold text-white">
                  {plan.category}
                </span>
                {plan.rating > 0 && (
                  <span className="text-sm text-muted-foreground">
                    ★ {plan.rating.toFixed(1)} ({plan.reviewCount})
                  </span>
                )}
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
              <Clock className="h-4 w-4 text-ocean" /> {plan.duration}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-ocean" /> Máx. {plan.maxGuests} personas
            </span>
            {plan.difficulty && (
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-ocean" /> {plan.difficulty}
              </span>
            )}
          </div>

          {/* Descripción */}
          <section id="general" className="mt-6 scroll-mt-24">
            <h2 className="text-lg font-bold text-foreground">Acerca de este plan</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {plan.fullDescription}
            </p>
          </section>

          {/* Incluye / No incluye */}
          <section id="incluye" className="mt-8 scroll-mt-24">
            <h2 className="text-lg font-bold text-foreground">Qué incluye este plan</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {plan.includes.map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
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
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-ocean" />
                    <span className="text-foreground">{h}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Itinerario */}
          {plan.itinerary && plan.itinerary.length > 0 && (
            <section id="itinerario" className="mt-8 scroll-mt-24">
              <h2 className="text-lg font-bold text-foreground">Itinerario día a día</h2>
              <div className="mt-3 space-y-3">
                {plan.itinerary.map((day, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-border bg-card p-4"
                  >
                    <h3 className="text-sm font-bold text-foreground">
                      <span className="text-ocean">Día {i + 1}:</span> {day.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {day.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Lugares */}
          {plan.lugares && plan.lugares.length > 0 && (
            <section id="lugares" className="mt-8 scroll-mt-24">
              <h2 className="text-lg font-bold text-foreground">Lugares a conocer</h2>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {plan.lugares.map((lugar, i) => (
                  <div
                    key={i}
                    className="relative aspect-square overflow-hidden rounded-xl"
                  >
                    <img
                      src={lugar.image}
                      alt={lugar.name}
                      loading="lazy"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://images.unsplash.com/photo-1501785888041-af3cff28a5ee?w=600&h=600&fit=crop";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <span className="absolute bottom-2 left-2 text-xs font-semibold text-white">
                      {lugar.name}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Fechas de salida (fixedDeparture) */}
          {isFixedDeparture && upcomingDepartures.length > 0 && (
            <section className="mt-8">
              <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                <CalendarDays className="h-5 w-5 text-ocean" /> Próximas fechas de salida
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Selecciona una fecha para tu reserva:
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {upcomingDepartures.slice(0, 8).map((d) => (
                  <button
                    key={d.start}
                    onClick={() => setSelectedDate(d.start)}
                    className={cn(
                      "flex items-center justify-between rounded-xl border p-3 text-left text-sm transition-colors",
                      selectedDate === d.start
                        ? "border-ocean bg-ocean/5 text-ocean"
                        : "border-border hover:bg-accent"
                    )}
                  >
                    <span>
                      <strong>{formatDateLong(d.start)}</strong>
                      <br />
                      <span className="text-xs text-muted-foreground">
                        al {formatDateLong(d.end)}
                      </span>
                    </span>
                    {selectedDate === d.start && <Check className="h-4 w-4 text-ocean" />}
                  </button>
                ))}
              </div>
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
                    <CalendarIcon className="mt-0.5 h-4 w-4 text-ocean" />
                    <div>
                      <strong>Horario:</strong> {plan.schedule}
                    </div>
                  </div>
                )}
                {plan.meeting && (
                  <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-sm">
                    <Navigation className="mt-0.5 h-4 w-4 text-ocean" />
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
            <section className="mt-8">
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
        </div>

        {/* Cotizador (desktop sticky) */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  {guests === 1 ? "Desde" : `Total (${guests} personas)`}
                </span>
                <p className="text-2xl font-extrabold text-foreground">{total}</p>
              </div>
              <span className="text-xs text-muted-foreground">{plan.priceRange}</span>
            </div>

            {/* Viajeros */}
            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Viajeros
              </label>
              <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                <span className="text-sm">Personas</span>
                <div className="flex items-center gap-2">
                  <StepperBtn
                    onClick={() => setGuests((g) => Math.max(1, g - 1))}
                    disabled={guests <= 1}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </StepperBtn>
                  <span className="w-8 text-center text-sm font-semibold">{guests}</span>
                  <StepperBtn
                    onClick={() => setGuests((g) => Math.min(plan.maxGuests || 30, g + 1))}
                    disabled={guests >= (plan.maxGuests || 30)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </StepperBtn>
                </div>
              </div>
            </div>

            {/* Habitación */}
            <div className="mt-3">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Tipo de habitación
              </label>
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value as typeof roomType)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ocean"
              >
                <option value="individual">Individual</option>
                <option value="doble">Doble</option>
                <option value="triple">Triple</option>
                <option value="cuadruple">Cuádruple</option>
              </select>
            </div>

            {/* Ciudad de origen */}
            <div className="mt-3">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Ciudad de salida
              </label>
              <select
                value={originCity}
                onChange={(e) => setOriginCity(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ocean"
              >
                <option>Barranquilla</option>
                <option>Bogotá</option>
                <option>Medellín</option>
                <option>Cali</option>
              </select>
            </div>

            {/* Botón reservar WhatsApp */}
            <button
              onClick={handleReserve}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1DA851] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#17943e]"
            >
              <WhatsAppGlyph /> Reservar por WhatsApp
            </button>

            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              Sin cargos por ahora · Cotización inmediata
            </p>

            <Link
              to={ROUTES.contact}
              className="mt-3 block text-center text-xs font-medium text-ocean hover:underline"
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
          <div>
            <span className="text-[11px] uppercase text-muted-foreground">
              {guests === 1 ? "Desde" : `Total · ${guests} pers.`}
            </span>
            <p className="text-lg font-extrabold text-foreground">{total}</p>
          </div>
          <button
            onClick={handleReserve}
            className="flex items-center gap-2 rounded-xl bg-[#1DA851] px-5 py-2.5 text-sm font-semibold text-white"
          >
            <WhatsAppGlyph /> Reservar
          </button>
        </div>
      </div>
    </div>
  );
}

function roomTypeLabel(t: string): string {
  const labels: Record<string, string> = {
    individual: "Individual",
    doble: "Doble",
    triple: "Triple",
    cuadruple: "Cuádruple",
  };
  return labels[t] ?? t;
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

function WhatsAppGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.7.3-.3.3-.9.9-.9 2.2 0 1.3.9 2.5 1.1 2.7.1.2 1.9 2.9 4.6 4 .6.3 1.1.4 1.5.5.6.2 1.2.2 1.6.1.5-.1 1.7-.7 1.9-1.3.2-.6.2-1.2.2-1.3-.1-.1-.3-.2-.6-.3z" />
      <path d="M12 2a10 10 0 0 0-8.5 15.3L2 22l4.8-1.5A10 10 0 1 0 12 2zm0 18.3c-1.5 0-3-.4-4.3-1.2l-.3-.2-2.9.9.9-2.8-.2-.3A8.3 8.3 0 1 1 12 20.3z" />
    </svg>
  );
}
