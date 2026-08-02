/**
 * Utilidades de WhatsApp — centraliza el número y la construcción de URLs
 * de cotización con mensajes pre-llenados (extraído de los templates del
 * proyecto de referencia).
 */

export const WHATSAPP_NUMBER = "573126380048";

/** Construye una URL wa.me con el mensaje codificado. */
export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/** Abre WhatsApp (nueva pestaña) con el mensaje dado. */
export function openWhatsApp(message: string): void {
  window.open(buildWhatsAppUrl(message), "_blank", "noopener,noreferrer");
}

/* ─────────────── Templates de cotización ─────────────── */

export interface PlanQuoteData {
  name: string;
  location: string;
  origin?: string;
  guests: number;
  roomType?: string;
  dateLabel: string;
  total: string;
}

/** Mensaje de cotización de un plan turístico. */
export function buildPlanQuoteMessage(d: PlanQuoteData): string {
  return [
    "🌴 *CONSULTA VIVE TRAVEL*",
    "",
    `📋 *Plan:* ${d.name}`,
    `📍 *Destino:* ${d.location}`,
    d.origin ? `🛫 *Origen:* ${d.origin}` : "",
    `👥 *Viajeros:* ${d.guests} persona${d.guests !== 1 ? "s" : ""}`,
    d.roomType ? `🛏️ *Habitación:* ${d.roomType}` : "",
    `📅 *Fecha de viaje:* ${d.dateLabel}`,
    `💵 *Total estimado:* ${d.total}`,
    "",
    "Hola, acabo de cotizar esta experiencia en su sitio web. ¿Podrían confirmarme disponibilidad de cupos y opciones de pago?",
  ]
    .filter(Boolean)
    .join("\n");
}

export interface CabinQuoteData {
  name: string;
  location: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  capacity: number;
  roomsBreakdown?: string;
  nights: number;
  total: string;
}

/** Mensaje de cotización de una cabaña. */
export function buildCabinQuoteMessage(d: CabinQuoteData): string {
  return [
    "🏡 *COTIZACIÓN DE CABAÑA - VIVE TRAVEL*",
    "",
    `🏡 *Alojamiento:* ${d.name}`,
    `📍 *Ubicación:* ${d.location}`,
    `📅 *Check-in:* ${d.checkIn}`,
    `📅 *Check-out:* ${d.checkOut}`,
    `👥 *Huéspedes:* ${d.guests} persona${d.guests !== 1 ? "s" : ""} (máx. ${d.capacity})`,
    d.roomsBreakdown ? `🏨 *Habitaciones:* ${d.roomsBreakdown}` : "",
    `🌙 *Estadía:* ${d.nights} noche${d.nights !== 1 ? "s" : ""}`,
    `💵 *Total estimado:* ${d.total}`,
    "",
    "Hola, me interesa reservar esta cabaña en las fechas indicadas. ¿Podrían confirmarme la disponibilidad y pasos a seguir?",
  ]
    .filter(Boolean)
    .join("\n");
}
