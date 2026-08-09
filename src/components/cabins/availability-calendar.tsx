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

// Días de la semana en mayúsculas sostenidas, abreviados a 2 letras (estilominimalista).
const WEEKDAYS = ["LU", "MA", "MI", "JU", "VI", "SÁ", "DO"];

/**
 * AvailabilityCalendar — calendario minimalista de disponibilidad con selección
 * de rango. Estética limpia: fondo crema, tipografía serif para el mes, grilla
 * aireada, círculos sutiles para selección.
 *
 * - Las fechas en `blockedDates` se marcan como no seleccionables (ocupadas).
 * - El usuario elige un Check-in y un Check-out; no se permite que el rango
 *   cruce sobre una fecha bloqueada.
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

    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(day);
      setCheckOut(null);
      onChange({ checkIn: day, checkOut: null });
      return;
    }

    if (checkIn) {
      if (isBefore(day, checkIn)) {
        setCheckIn(day);
        setCheckOut(null);
        onChange({ checkIn: day, checkOut: null });
        return;
      }
      if (isSameDay(day, checkIn)) return;
      const rangeEnd = new Date(day);
      rangeEnd.setDate(rangeEnd.getDate() - 1);
      if (rangeHasBlocked(checkIn, rangeEnd)) {
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
      <div className="flex items-center gap-3 rounded-lg bg-[#FDFBF7] p-6 text-sm text-neutral-500">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-400/40 border-t-neutral-700" />
        Sincronizando disponibilidad…
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-[#FDFBF7] p-4 sm:p-6">
      {/* Encabezado + navegación de meses */}
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCursor((c) => subMonths(c, 1))}
          className="flex h-8 w-8 items-center justify-center rounded-sm border border-gray-300 bg-transparent text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Mes anterior"
          disabled={isBefore(cursor, startOfMonth(today))}
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
        </button>
        <h3
          className="text-lg font-normal text-neutral-800"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          {format(cursor, "MMMM yyyy", { locale: es })}
        </h3>
        <button
          type="button"
          onClick={() => setCursor((c) => addMonths(c, 1))}
          className="flex h-8 w-8 items-center justify-center rounded-sm border border-gray-300 bg-transparent text-gray-700 transition-colors hover:bg-gray-100"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
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

      {/* Leyenda minimalista */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[11px] font-sans text-neutral-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-neutral-800" /> Seleccionado
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full border border-gray-300 bg-transparent" /> Disponible
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-gray-200" /> Ocupado
        </span>
      </div>

      {/* Resumen selección */}
      {(checkIn || checkOut) && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 border-t border-gray-200/70 pt-3 text-xs font-sans">
          {checkIn && (
            <span>
              <span className="text-neutral-500">Ingreso:</span>{" "}
              <span className="font-medium text-neutral-800">
                {format(checkIn, "d MMM yyyy", { locale: es })}
              </span>
            </span>
          )}
          {checkOut && (
            <>
              <span className="text-neutral-400">→</span>
              <span>
                <span className="text-neutral-500">Salida:</span>{" "}
                <span className="font-medium text-neutral-800">
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
      {/* Días de la semana: mayúsculas sostenidas, micro, gris medio */}
      <div className="mb-2 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="py-1 text-center font-sans text-[10px] font-medium uppercase tracking-wide text-neutral-400"
          >
            {d}
          </div>
        ))}
      </div>
      {/* Días del mes */}
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
                "relative flex aspect-square items-center justify-center rounded-full font-sans text-xs font-light transition-colors",
                !inMonth && "pointer-events-none opacity-0",
                // Disponible (default): texto oscuro, hover sutil
                inMonth && !disabled && "text-neutral-700 hover:bg-neutral-200/60",
                // Pasado: muy claro, tachado
                past && inMonth && "text-neutral-300 line-through",
                // Ocupado: gris claro neutro + tachado (sin rojo)
                blocked && inMonth && "bg-gray-200/70 text-neutral-400 line-through",
                // Selección: círculo sólido oscuro
                (isStart || isEnd) && "bg-neutral-800 font-medium text-white hover:bg-neutral-800",
                // Rango intermedio: fondo claro sutil
                inRange && !isStart && !isEnd && "bg-neutral-200/50 text-neutral-600"
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
