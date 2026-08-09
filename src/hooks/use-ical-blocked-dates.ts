import { useEffect, useState } from "react";

export interface IcalState {
  /** Set de fechas bloqueadas en formato 'yyyy-MM-dd'. */
  blockedDates: Set<string>;
  loading: boolean;
  error: string | null;
}

/**
 * useIcalBlockedDates — descarga y parsea un feed iCal (.ics) público para
 * extraer los días ocupados/bloqueados. Pensado para sincronizar la
 * disponibilidad de una cabaña con Google Calendar, Airbnb, Booking, etc.
 *
 * Implementación sin dependencias externas: parsea VEVENT / DTSTART / DTEND
 * manualmente. Si la petición falla, devuelve error y la UI puede seguir
 * operando con el calendario vacío (fallback graceful).
 *
 * Estrategia de cache: guarda el set parseado en el estado; si la URL cambia
 * vuelve a hacer fetch. No re-fetch en cada render.
 */
export function useIcalBlockedDates(icalUrl: string | undefined): IcalState {
  const [state, setState] = useState<IcalState>({
    blockedDates: new Set(),
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!icalUrl) {
      setState({ blockedDates: new Set(), loading: false, error: null });
      return;
    }
    let cancelled = false;
    setState({ blockedDates: new Set(), loading: true, error: null });

    fetch(icalUrl, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((raw) => {
        if (cancelled) return;
        const blocked = parseIcalBlockedDates(raw);
        setState({ blockedDates: blocked, loading: false, error: null });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({
          blockedDates: new Set(),
          loading: false,
          error: err instanceof Error ? err.message : "Error desconocido",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [icalUrl]);

  return state;
}

/**
 * Parsea un texto iCal crudo y devuelve el set de fechas bloqueadas.
 * Recorre cada VEVENT, toma DTSTART y DTEND, y marca todos los días del
 * rango (exclusivo en DTEND, como dicta la spec RFC 5545 para eventos de día
 * completo: un evento del 12 al 15 bloquea 12, 13 y 14).
 */
function parseIcalBlockedDates(raw: string): Set<string> {
  const blocked = new Set<string>();
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  let inEvent = false;
  let dtStart: Date | null = null;
  let dtEnd: Date | null = null;

  const extractDate = (line: string): Date | null => {
    // Formatos comunes: DTSTART:20240112  o  DTSTART;VALUE=DATE:20240112
    // o DTSTART:20240112T090000Z (con hora)
    const match = line.match(/DTSTART[^:]*:(\d{4})(\d{2})(\d{2})(?:T\d{6}Z?)?/);
    if (!match) return null;
    const [, y, m, d] = match;
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    return isNaN(date.getTime()) ? null : date;
  };

  const extractDateEnd = (line: string): Date | null => {
    const match = line.match(/DTEND[^:]*:(\d{4})(\d{2})(\d{2})(?:T\d{6}Z?)?/);
    if (!match) return null;
    const [, y, m, d] = match;
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    return isNaN(date.getTime()) ? null : date;
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === "BEGIN:VEVENT") {
      inEvent = true;
      dtStart = null;
      dtEnd = null;
    } else if (trimmed === "END:VEVENT") {
      if (inEvent && dtStart) {
        // Si no hay DTEND, el evento dura 1 día (bloquea solo ese día).
        const end = dtEnd ?? new Date(dtStart.getTime() + 86400000);
        // Marcar todos los días del rango [dtStart, end) — DTEND exclusivo.
        const cursor = new Date(dtStart);
        let safety = 0;
        while (cursor < end && safety < 400) {
          blocked.add(toIsoDate(cursor));
          cursor.setDate(cursor.getDate() + 1);
          safety++;
        }
      }
      inEvent = false;
    } else if (inEvent) {
      if (trimmed.startsWith("DTSTART")) dtStart = extractDate(trimmed);
      else if (trimmed.startsWith("DTEND")) dtEnd = extractDateEnd(trimmed);
    }
  }
  return blocked;
}

/** Convierte un Date local a 'yyyy-MM-dd' sin zona horaria. */
function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
