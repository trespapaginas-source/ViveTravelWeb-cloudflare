import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  isWithinInterval,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"];

/**
 * AvailabilityCalendar — calendario de disponibilidad con selección de rango.
 *
 * - Las fechas en `blockedDates` se marcan como no seleccionables (ocupadas).
 * - El usuario elige un Check-in y un Check-out; no se permite que el rango
 *   cruce sobre una fecha bloqueada.
 * - Muestra 1 mes en móvil y 2 meses en desktop.
 *
 * Recibe callbacks para que el padre conozca la selección.
 */
export function AvailabilityCalendar({
  blockedDates,
  loading,
  onChange,
}: {
  blockedDates: Set<string>;
  loading: boolean;
  onChange: (range: { checkIn: Date | null; checkOut: Date | null }) => void;
}) {
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const [cursor, setCursor] = useState(() => startOfMonth(today));
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);

  const toKey = (d: Date) => format(d, "yyyy-MM-dd");
  const isBlocked = (d: Date) => blockedDates.has(toKey(d));
  const isPast = (d: Date) => isBefore(d, today);

  /** Verifica que no haya fechas bloqueadas entre dos fechas (inclusive inicio). */
  const rangeHasBlocked = (start: Date, end: Date): boolean => {
    const days = eachDayOfInterval({ start, end });
    return days.some((d) => isBlocked(d));
  };

  const handleSelect = (day: Date) => {
    if (isPast(day) || isBlocked(day)) return;

    // Sin check-in, o con check-in+check-out ya completos: empezar nuevo rango.
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(day);
      setCheckOut(null);
      onChange({ checkIn: day, checkOut: null });
      return;
    }

    // Tenemos check-in, elegimos check-out.
    if (checkIn) {
      // Si el día es anterior al check-in, reiniciar desde ese día.
      if (isBefore(day, checkIn)) {
        setCheckIn(day);
        setCheckOut(null);
        onChange({ checkIn: day, checkOut: null });
        return;
      }
      // Mismo día = no permitido como checkout (mínimo 1 noche).
      if (isSameDay(day, checkIn)) return;
      // Validar que no haya bloqueos en el rango [checkIn, day previo al checkout].
      const rangeEnd = new Date(day);
      rangeEnd.setDate(rangeEnd.getDate() - 1);
      if (rangeHasBlocked(checkIn, rangeEnd)) {
        // Hay bloqueo en medio: reiniciar selección desde este día.
        setCheckIn(day);
        setCheckOut(null);
        onChange({ checkIn: day, checkOut: null });
        return;
      }
      setCheckOut(day);
      onChange({ checkIn, checkOut: day });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-6 text-sm text-muted-foreground">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-900/30 border-t-neutral-900" />
        Sincronizando disponibilidad…
      </div>
    );
  }

  return (
    <div>
      {/* Navegación entre meses */}
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCursor((c) => subMonths(c, 1))}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted"
          aria-label="Mes anterior"
          disabled={isBefore(cursor, startOfMonth(today))}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold text-foreground">
          {format(cursor, "MMMM yyyy", { locale: es })}
        </span>
        <button
          type="button"
          onClick={() => setCursor((c) => addMonths(c, 1))}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <MonthGrid
        monthStart={cursor}
        checkIn={checkIn}
        checkOut={checkOut}
        isBlocked={isBlocked}
        isPast={isPast}
        onSelect={handleSelect}
      />

      {/* Leyenda */}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-neutral-900" /> Seleccionado
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-neutral-200" /> Disponible
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-100" /> Ocupado
        </span>
      </div>

      {/* Resumen selección */}
      {(checkIn || checkOut) && (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs">
          {checkIn && (
            <span>
              <span className="text-muted-foreground">Ingreso:</span>{" "}
              <span className="font-semibold text-foreground">
                {format(checkIn, "d MMM yyyy", { locale: es })}
              </span>
            </span>
          )}
          {checkOut && (
            <>
              <span className="text-muted-foreground">→</span>
              <span>
                <span className="text-muted-foreground">Salida:</span>{" "}
                <span className="font-semibold text-foreground">
                  {format(checkOut, "d MMM yyyy", { locale: es })}
                </span>
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ──────────────────── Grilla de un mes ──────────────────── */

function MonthGrid({
  monthStart,
  checkIn,
  checkOut,
  isBlocked,
  isPast,
  onSelect,
}: {
  monthStart: Date;
  checkIn: Date | null;
  checkOut: Date | null;
  isBlocked: (d: Date) => boolean;
  isPast: (d: Date) => boolean;
  onSelect: (d: Date) => void;
}) {
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(endOfMonth(monthStart), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  return (
    <div>
      <div className="mb-1 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="py-1 text-center text-[11px] font-semibold uppercase text-muted-foreground"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const inMonth = day.getMonth() === monthStart.getMonth();
          const blocked = isBlocked(day);
          const past = isPast(day);
          const disabled = blocked || past || !inMonth;
          const isStart = checkIn && isSameDay(day, checkIn);
          const isEnd = checkOut && isSameDay(day, checkOut);
          const inRange =
            checkIn &&
            checkOut &&
            isWithinInterval(day, { start: checkIn, end: checkOut });

          return (
            <button
              key={day.toISOString()}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(day)}
              className={cn(
                "relative aspect-square rounded-md text-xs font-medium transition-colors",
                !inMonth && "opacity-0",
                inMonth && !disabled && "text-foreground hover:bg-neutral-100",
                past && inMonth && "text-neutral-300 line-through cursor-not-allowed",
                blocked && inMonth && "bg-red-50 text-red-300 line-through cursor-not-allowed",
                isStart && "bg-neutral-900 text-white hover:bg-neutral-900",
                isEnd && "bg-neutral-900 text-white hover:bg-neutral-900",
                inRange && !isStart && !isEnd && "bg-neutral-100 text-neutral-700"
              )}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
