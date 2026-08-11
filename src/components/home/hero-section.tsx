import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Calendar as CalendarIcon,
  Users,
  ChevronDown,
  Sparkles,
  Search,
  Minus,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDragScroll } from "@/hooks/use-drag-scroll";
import { useNavigation } from "@/lib/store";
import { useSiteContent } from "@/lib/use-site-content";
import { useGeoCity } from "@/hooks/use-geo-city";
import { usePlanes } from "@/hooks/use-plans";
import { getPlanExperienceSection } from "@/hooks/use-plan-filters";
import { getHeroImages } from "@/lib/data-access";
import { formatDateLong } from "@/lib/utils";
import { ROUTES } from "@/lib/routes";
import {
  SEARCH_TABS,
  DEFAULT_TAB,
  CITIES,
  POPULAR_DESTINATIONS,
  ROOM_TABS,
  getDestinationPlaceholder,
  type SearchTab,
} from "@/lib/hero-data";

const HERO_FALLBACK =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=900&fit=crop&q=80";

export interface RoomDetail {
  adults: number;
  children: number;
}

interface TabParams {
  origen?: string;
  destino: string;
  fecha: string;
  fechaFin?: string;
  rooms?: RoomDetail[];
  adultos: number;
  ninos: number;
  actividad?: string;
  tipoViajero?: string;
}

function makeInitial(tab: SearchTab): TabParams {
  const base: TabParams = {
    destino: "",
    fecha: "",
    adultos: 2,
    ninos: 0,
  };
  if (ROOM_TABS.includes(tab)) {
    base.rooms = [{ adults: 2, children: 0 }];
    base.fechaFin = "";
  }
  if (tab !== "alojamientos" && ROOM_TABS.includes(tab)) {
    base.origen = "";
  }
  if (tab === "tours") base.actividad = "";
  if (tab === "grupales") {
    base.tipoViajero = "";
    base.origen = "";
  }
  return base;
}

/**
 * layoutCols — devuelve el peso relativo (flex-grow) de cada campo del
 * buscador según la pestaña activa, sobre una base de 12. Determina qué
 * tan ancha es cada sección de la barra tipo "pill" en desktop.
 */
function layoutCols(tab: SearchTab): {
  origen: number;
  destino: number;
  actividad: number;
  entrada: number;
  salida: number;
  fecha: number;
  travelers: number;
  buscar: number;
} {
  switch (tab) {
    // Origen + Destino + Entrada/Salida + Pasajeros + Buscar = 2+3+2+2+2+1 = 12
    case "internacionales":
    case "nacionales":
    case "circuitos":
      return { origen: 2, destino: 3, actividad: 0, entrada: 2, salida: 2, fecha: 0, travelers: 2, buscar: 1 };
    // Destino + Entrada/Salida + Hab + Buscar = 5+2+2+2+1 = 12
    case "alojamientos":
      return { origen: 0, destino: 5, actividad: 0, entrada: 2, salida: 2, fecha: 0, travelers: 2, buscar: 1 };
    // Destino + Actividad + Fecha + Viajeros + Buscar = 3+2+3+3+1 = 12
    case "tours":
      return { origen: 0, destino: 3, actividad: 2, entrada: 0, salida: 0, fecha: 3, travelers: 3, buscar: 1 };
    // Destino + Fecha + Viajeros + Buscar = 4+3+4+1 = 12
    case "pasadias":
      return { origen: 0, destino: 4, actividad: 0, entrada: 0, salida: 0, fecha: 4, travelers: 3, buscar: 1 };
    // Ciudad de origen + Fechas disponibles + Pasajeros + Buscar = 3+5+3+1 = 12
    case "grupales":
      return { origen: 3, destino: 0, actividad: 0, entrada: 0, salida: 0, fecha: 5, travelers: 3, buscar: 1 };
    default:
      return { origen: 0, destino: 4, actividad: 0, entrada: 0, salida: 0, fecha: 4, travelers: 3, buscar: 1 };
  }
}

export function HeroSection() {
  const { content } = useSiteContent();
  const navigate = useNavigate();
  const { setSearchPayload } = useNavigation();
  const { data: allPlans } = usePlanes();

  // Viajes grupales con fechas de salida programadas, para el selector
  // "Fechas disponibles" de la pestaña grupales.
  const groupTripsWithDates = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return allPlans
      .filter(
        (p) =>
          getPlanExperienceSection(p) === "grupales" &&
          p.is_active &&
          p.departureDates?.some((d) => d.end >= today)
      )
      .flatMap((p) =>
        (p.departureDates ?? [])
          .filter((d) => d.end >= today)
          .map((d) => ({
            planId: p.id,
            planName: p.name,
            start: d.start,
            end: d.end,
          }))
      )
      .sort((a, b) => a.start.localeCompare(b.start));
  }, [allPlans]);

  const [activeTab, setActiveTab] = useState<SearchTab>(DEFAULT_TAB);
  // Ref al input de "Salida" para abrir su selector automáticamente en
  // cuanto el usuario elige la fecha de "Entrada" (ahorra un clic).
  const salidaInputRef = useRef<HTMLInputElement>(null);
  const [tabParams, setTabParams] = useState<Record<SearchTab, TabParams>>({
    internacionales: makeInitial("internacionales"),
    nacionales: makeInitial("nacionales"),
    circuitos: makeInitial("circuitos"),
    pasadias: makeInitial("pasadias"),
    grupales: makeInitial("grupales"),
    alojamientos: makeInitial("alojamientos"),
    tours: makeInitial("tours"),
  });

  // Autodetección de la ciudad de origen por IP (no bloqueante). Si el
  // usuario ya escribió manualmente, no se sobreescribe.
  const { city: geoCity, loading: geoLoading } = useGeoCity();
  const [originTouched, setOriginTouched] = useState(false);
  useEffect(() => {
    if (originTouched) return;
    if (geoCity) {
      setTabParams((prev) => {
        const next = { ...prev };
        (["internacionales", "nacionales", "circuitos", "grupales"] as SearchTab[]).forEach(
          (tab) => {
            next[tab] = { ...next[tab], origen: geoCity };
          }
        );
        return next;
      });
    }
  }, [geoCity, originTouched]);

  const hero = content.hero;
  const heroImages = useMemo(() => getHeroImages(), []);
  const backgroundImage = heroImages[0]?.url ?? "/images/hero/desktop.jpg";
  const mobileImage = heroImages[0]?.mobileUrl ?? "/images/hero/mobile.jpg";

  const hasRooms = ROOM_TABS.includes(activeTab);
  const params = tabParams[activeTab];

  const update = (patch: Partial<TabParams>) =>
    setTabParams((prev) => ({
      ...prev,
      [activeTab]: { ...prev[activeTab], ...patch },
    }));

  /** Submit: serializa la búsqueda en la URL y navega con react-router. */
  const handleSearch = () => {
    const p = tabParams[activeTab];
    const roomsDetailStr = p.rooms ? JSON.stringify(p.rooms) : undefined;

    // Primero guardamos en el store (para el StickySummaryBar).
    setSearchPayload({
      destino: p.destino,
      origen: p.origen,
      fecha: p.fecha,
      fechaFin: p.fechaFin,
      adultos: p.adultos,
      ninos: p.ninos,
      habitaciones: p.rooms?.length || 1,
      roomsDetail: roomsDetailStr,
      tipoViajero: p.tipoViajero,
      categoria: activeTab,
      actividad: p.actividad,
    });

    if (activeTab === "alojamientos") {
      // /cabanas con query params
      const qs = new URLSearchParams({
        destino: p.destino,
        fecha: p.fecha,
        adultos: String(p.adultos),
        ninos: String(p.ninos),
        habitaciones: String(p.rooms?.length || 1),
      });
      if (p.fechaFin) qs.set("fechaFin", p.fechaFin);
      navigate(`${ROUTES.cabins}?${qs.toString()}`);
    } else {
      // /planes?categoria=<tab> + resto de búsqueda
      const qs = new URLSearchParams({ categoria: activeTab });
      if (p.destino) qs.set("destino", p.destino);
      if (p.origen) qs.set("origen", p.origen);
      if (p.fecha) qs.set("fecha", p.fecha);
      if (p.fechaFin) qs.set("fechaFin", p.fechaFin);
      qs.set("adultos", String(p.adultos));
      qs.set("ninos", String(p.ninos));
      if (p.actividad) qs.set("actividad", p.actividad);
      if (p.tipoViajero) qs.set("tipoViajero", p.tipoViajero);
      navigate(`${ROUTES.plans}?${qs.toString()}`);
    }
  };

  return (
    <section className="relative w-full min-h-[660px] md:h-[80vh] lg:h-[92vh]">
      {/* Fondo */}
      <div className="absolute inset-0 z-0">
        <picture>
          <source media="(max-width: 768px)" srcSet={mobileImage} />
          <img
            src={backgroundImage}
            alt="Vive Travel"
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.src = HERO_FALLBACK;
              e.currentTarget.onerror = null;
            }}
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-black/15" />
      </div>

      {/* Contenido */}
      <div className="relative z-20 mx-auto flex max-w-7xl flex-col items-center px-4 pb-10 pt-28 sm:px-6 sm:pt-32 lg:pt-40">
        <div className="mx-auto max-w-3xl text-center text-white">
          <span className="inline-block rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
            {hero.brandLabel}
          </span>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight drop-shadow-lg sm:text-5xl lg:text-6xl">
            {hero.title}{" "}
            <span className="text-white">{hero.titleHighlight}</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/90 drop-shadow sm:text-lg">
            {hero.subtitle}
          </p>
        </div>

        {/* Tarjeta del buscador */}
        <div className="mt-8 w-full max-w-5xl rounded-2xl border border-white/20 bg-white/65 p-3 backdrop-blur-xl sm:bg-white/95 sm:p-4">
          {/* Tabs */}
          <TabBar activeTab={activeTab} onChange={setActiveTab} />

          {/* Campos dinámicos — barra tipo "pill" con divisores verticales
              entre secciones (estilo buscador de referencia), una sola fila
              en desktop y apiladas en móvil. Los pesos (weight) reutilizan
              los mismos anchos relativos que antes definía layoutCols. */}
          {(() => {
            const hasOrigin = ["internacionales", "nacionales", "circuitos", "grupales"].includes(activeTab);
            const hasDestino = activeTab !== "grupales";
            const cols = layoutCols(activeTab);
            return (
              <div className="mt-3 flex flex-col divide-y divide-border rounded-2xl border border-border bg-white md:flex-row md:items-center md:divide-x md:divide-y-0 md:rounded-full">
                {/* Origen (internacionales/nacionales/circuitos/grupales) — autodetectado por IP */}
                {hasOrigin && (
                  <Field
                    weight={cols.origen}
                    icon={<MapPin className="h-4 w-4 text-muted-foreground" />}
                    label="Origen"
                  >
                    <AutocompleteInput
                      value={params.origen ?? ""}
                      placeholder={
                        geoLoading && !params.origen
                          ? "Detectando ciudad…"
                          : "Ciudad de salida"
                      }
                      options={CITIES}
                      onChange={(v) => {
                        setOriginTouched(true);
                        update({ origen: v });
                      }}
                    />
                  </Field>
                )}

                {/* Destino */}
                {hasDestino && (
                  <Field
                    weight={cols.destino}
                    icon={<MapPin className="h-4 w-4 text-muted-foreground" />}
                    label="Destino"
                  >
                    <AutocompleteInput
                      value={params.destino}
                      placeholder={getDestinationPlaceholder(activeTab)}
                      options={destinationOptions(activeTab)}
                      onChange={(v) => update({ destino: v })}
                    />
                  </Field>
                )}

                {/* Actividad (solo tours) */}
                {activeTab === "tours" && (
                  <Field
                    weight={cols.actividad}
                    icon={<Sparkles className="h-4 w-4 text-muted-foreground" />}
                    label="Actividad"
                  >
                    <input
                      type="text"
                      value={params.actividad ?? ""}
                      placeholder="Ej: Paracaidismo, Buceo"
                      onChange={(e) => update({ actividad: e.target.value })}
                      className="w-full bg-transparent text-sm font-medium text-foreground outline-none placeholder:font-normal placeholder:text-muted-foreground"
                    />
                  </Field>
                )}

                {/* Entrada / Salida (pestañas con habitaciones) */}
                {hasRooms && (
                  <>
                    <Field
                      weight={cols.entrada}
                      icon={<CalendarIcon className="h-4 w-4 text-muted-foreground" />}
                      label="Entrada"
                    >
                      <input
                        type="date"
                        value={params.fecha}
                        min={todayStr()}
                        onChange={(e) => {
                          const value = e.target.value;
                          update({ fecha: value });
                          // Al elegir la entrada, abre automáticamente el selector
                          // de salida para que el usuario no tenga que hacer clic.
                          if (value) {
                            setTimeout(() => {
                              const input = salidaInputRef.current;
                              if (!input) return;
                              if (typeof input.showPicker === "function") {
                                try {
                                  input.showPicker();
                                } catch {
                                  input.focus();
                                }
                              } else {
                                input.focus();
                              }
                            }, 0);
                          }
                        }}
                        className="w-full bg-transparent text-sm font-medium text-foreground outline-none"
                      />
                    </Field>
                    <Field
                      weight={cols.salida}
                      icon={<CalendarIcon className="h-4 w-4 text-muted-foreground" />}
                      label="Salida"
                    >
                      <input
                        ref={salidaInputRef}
                        type="date"
                        value={params.fechaFin ?? ""}
                        min={params.fecha || todayStr()}
                        onChange={(e) => update({ fechaFin: e.target.value })}
                        className="w-full bg-transparent text-sm font-medium text-foreground outline-none"
                      />
                    </Field>
                  </>
                )}

                {/* Fecha simple (pasadías/tours) */}
                {!hasRooms && cols.fecha > 0 && activeTab !== "grupales" && (
                  <Field
                    weight={cols.fecha}
                    icon={<CalendarIcon className="h-4 w-4 text-muted-foreground" />}
                    label="Fecha"
                  >
                    <input
                      type="date"
                      value={params.fecha}
                      min={todayStr()}
                      onChange={(e) => update({ fecha: e.target.value })}
                      className="w-full bg-transparent text-sm font-medium text-foreground outline-none"
                    />
                  </Field>
                )}

                {/* Fechas disponibles (solo grupales) — selector de viajes con salida programada */}
                {activeTab === "grupales" && (
                  <Field
                    weight={cols.fecha}
                    icon={<CalendarIcon className="h-4 w-4 text-muted-foreground" />}
                    label="Fechas disponibles"
                  >
                    <select
                      value={
                        params.fecha && params.destino
                          ? `${params.destino}|${params.fecha}`
                          : ""
                      }
                      onChange={(e) => {
                        const [destino, fecha] = e.target.value.split("|");
                        update({ destino, fecha });
                      }}
                      className="w-full bg-transparent text-sm font-medium text-foreground outline-none"
                    >
                      <option value="">Elige un viaje con fecha…</option>
                      {groupTripsWithDates.map((trip) => (
                        <option
                          key={`${trip.planId}-${trip.start}`}
                          value={`${trip.planName}|${trip.start}`}
                        >
                          {trip.planName} — {formatDateLong(trip.start)}
                        </option>
                      ))}
                    </select>
                  </Field>
                )}

                {/* Pasajeros (y habitaciones salvo en grupales) */}
                <Field
                  weight={cols.travelers}
                  icon={<Users className="h-4 w-4 text-muted-foreground" />}
                  label={activeTab === "grupales" ? "Pasajeros" : "Pasajeros y habitaciones"}
                >
                  <TravelersPopover
                    adults={params.adultos}
                    children={params.ninos}
                    rooms={params.rooms}
                    hasRooms={activeTab === "grupales" ? false : hasRooms}
                    onChange={(patch) => update(patch)}
                  />
                </Field>

                {/* Botón buscar — circular en desktop (con animación hover de
                    escala+rotación sobre el icono) / full-width en móvil.
                    Único acento de color del Hero (5% rule). */}
                <div className="flex items-center justify-center p-2 md:pl-1.5 md:pr-2">
                  <button
                    onClick={handleSearch}
                    aria-label="Buscar"
                    className="group/btn flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-ocean text-white shadow-md transition-colors hover:bg-ocean-dark md:h-11 md:w-11 md:flex-shrink-0 md:rounded-full"
                  >
                    <Search className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover/btn:scale-110 group-hover/btn:rotate-6 md:h-[18px] md:w-[18px]" />
                    <span className="text-sm font-semibold md:hidden">Buscar</span>
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </section>
  );
}

/** Devuelve la lista combinada de destinos sugeridos para una pestaña. */
function destinationOptions(tab: SearchTab): string[] {
  if (tab === "grupales") return [];
  return (POPULAR_DESTINATIONS[tab as Exclude<SearchTab, "grupales">] ?? []).slice(0, 10);
}

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

/* ─────────────────────────── Sub-componentes ─────────────────────────── */

function TabBar({
  activeTab,
  onChange,
}: {
  activeTab: SearchTab;
  onChange: (t: SearchTab) => void;
}) {
  const drag = useDragScroll<HTMLDivElement>();
  return (
    <div
      ref={drag.ref}
      onMouseDown={drag.onMouseDown}
      onMouseMove={drag.onMouseMove}
      onMouseUp={drag.onMouseUp}
      onMouseLeave={drag.onMouseLeave}
      onClickCapture={drag.onClickCapture}
      className="no-scrollbar flex gap-1 overflow-x-auto rounded-xl bg-muted/60 p-1"
    >
      {SEARCH_TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition-colors sm:text-sm",
            activeTab === tab.id
              ? "bg-zinc-900 text-white shadow-sm"
              : "text-muted-foreground hover:bg-background hover:text-foreground"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function Field({
  icon,
  label,
  weight,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  weight?: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex min-w-0 flex-1 flex-col justify-center px-4 py-2.5 md:py-2"
      style={weight ? { flex: `${weight} ${weight} 0%` } : undefined}
    >
      {/* Etiqueta en negrita encima del valor, sin caja/borde individual. */}
      <label className="flex items-center gap-1.5 text-xs font-bold text-foreground">
        {icon}
        <span className="truncate">{label}</span>
      </label>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}

function AutocompleteInput({
  value,
  placeholder,
  options,
  onChange,
}: {
  value: string;
  placeholder: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setQuery(value), [value]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const filtered = useMemo(() => {
    if (!query) return options;
    const q = query.toLowerCase();
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [query, options]);

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        value={query}
        placeholder={placeholder}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        className="w-full bg-transparent text-sm font-medium text-foreground outline-none placeholder:font-normal placeholder:text-muted-foreground"
      />
      {open && filtered.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-auto rounded-lg border border-border bg-popover p-1 shadow-lg">
          {filtered.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                setQuery(opt);
                onChange(opt);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-popover-foreground hover:bg-accent"
            >
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function TravelersPopover({
  adults,
  children: kids,
  rooms,
  hasRooms,
  onChange,
}: {
  adults: number;
  children: number;
  rooms?: RoomDetail[];
  hasRooms: boolean;
  onChange: (patch: Partial<TabParams>) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const summary = hasRooms
    ? `${adults}A · ${kids}N · ${rooms?.length ?? 1}H`
    : `${adults}A · ${kids}N`;

  const setAdults = (n: number) =>
    onChange({ adultos: Math.max(1, Math.min(10, n)) });
  const setKids = (n: number) =>
    onChange({ ninos: Math.max(0, Math.min(6, n)) });

  const setRoomsCount = (n: number) => {
    const count = Math.max(1, Math.min(5, n));
    const next = Array.from({ length: count }, (_, i) => ({
      adults: rooms?.[i]?.adults ?? 2,
      children: rooms?.[i]?.children ?? 0,
    }));
    const totalAdults = next.reduce((s, r) => s + r.adults, 0);
    const totalKids = next.reduce((s, r) => s + r.children, 0);
    onChange({ rooms: next, adultos: totalAdults, ninos: totalKids });
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-sm font-medium text-foreground"
      >
        <span className="truncate">{summary}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-border bg-popover p-3 shadow-lg sm:right-auto sm:min-w-[240px]">
          <Stepper
            label="Adultos"
            value={adults}
            min={1}
            max={10}
            onChange={setAdults}
          />
          <Stepper
            label="Niños"
            value={kids}
            min={0}
            max={6}
            onChange={setKids}
          />
          {hasRooms && (
            <Stepper
              label="Habitaciones"
              value={rooms?.length ?? 1}
              min={1}
              max={5}
              onChange={setRoomsCount}
            />
          )}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-2 w-full rounded-md bg-neutral-900 py-1.5 text-xs font-semibold text-white hover:bg-black"
          >
            Listo
          </button>
        </div>
      )}
    </div>
  );
}

function Stepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-popover-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(value - 1)}
          disabled={value <= min}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-popover-foreground disabled:opacity-40"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="w-6 text-center text-sm font-semibold">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          disabled={value >= max}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-popover-foreground disabled:opacity-40"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
