import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * `cn` — combina clases de Tailwind resolviendo conflictos (equivalente al
 * helper del mismo nombre en el proyecto de referencia).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formatea un número como moneda COP sin decimales (es-CO). */
export function formatPrice(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Devuelve el contenido del primer paréntesis de una cadena de duración.
 * Ej: "4 días, 3 noches (Todo incluido)" → "Todo incluido";
 * si no hay paréntesis devuelve la cadena completa; si es muy larga la recorta.
 */
export function formatShortDuration(duration: string | undefined): string {
  if (!duration) return "";
  const match = duration.match(/\(([^)]+)\)/);
  if (match && match[1]) {
    const inner = match[1].trim();
    if (inner.length <= 24) return inner;
  }
  return duration.length > 24 ? duration.slice(0, 22) + "…" : duration;
}

/**
 * Devuelve el último segmento separado por coma de una ubicación.
 * Ej: "Madrid, París y Roma" → "Roma"; "Cartagena" → "Cartagena".
 */
export function formatShortLocation(location: string | undefined): string {
  if (!location) return "";
  const parts = location.split(",").map((s) => s.trim());
  return parts[parts.length - 1] || location;
}

/**
 * Construye la etiqueta de ubicación priorizando el modelo estructurado
 * (ubicacion_principal + ubicacion_secundaria opcional). Si el plan no usa
 * ese modelo (planes legacy), cae a `location` plano.
 *
 * - Con ciudad:  "México, Cancún"
 * - Solo país:   "México"
 * - Legacy:      el valor de `location` (ej: "Madrid, París y Roma")
 */
export function formatPlanLocation(plan: {
  ubicacion_principal?: string;
  ubicacion_secundaria?: string;
  location: string;
}): string {
  const { ubicacion_principal, ubicacion_secundaria, location } = plan;
  if (ubicacion_principal && ubicacion_principal.trim()) {
    const ciudad = ubicacion_secundaria?.trim();
    return ciudad ? `${ubicacion_principal}, ${ciudad}` : ubicacion_principal;
  }
  return location;
}

const MESES_ES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

/**
 * Genera el rango dinámico de salidas programadas:
 * "Salidas programadas de [mes actual] a [mes última fecha]".
 *
 * - `mes actual`: mes de la fecha del sistema (cuando visita el usuario).
 * - `mes final`: mes del último elemento de `departureDates`.
 *
 * Devuelve "" si no hay fechas, para que el render condicional lo omita.
 */
export function formatDepartureRange(
  departureDates?: { start: string; end: string }[]
): string {
  if (!departureDates || departureDates.length === 0) return "";
  const last = departureDates[departureDates.length - 1];
  const lastDate = new Date(last.start + "T00:00:00");
  if (isNaN(lastDate.getTime())) return "";
  const now = new Date();
  const mesActual = MESES_ES[now.getMonth()];
  const mesFinal = MESES_ES[lastDate.getMonth()];
  return `Salidas programadas de ${mesActual} a ${mesFinal}`;
}

/** Convierte "2026-07-31" → "31 jul 2026" (locale es). */
export function formatDateLong(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

