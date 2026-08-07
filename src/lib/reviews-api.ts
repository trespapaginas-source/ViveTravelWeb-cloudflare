/**
 * Cliente del API de reseñas (/api/reviews).
 * Habla con la Cloudflare Pages Function que persiste en D1.
 */

export type ServiceType = "plan" | "cabin";

export interface ReviewRow {
  id: number;
  service_type: string;
  service_id: string;
  reviewer_name: string;
  destination: string | null;
  rating: number;
  comment: string | null;
  country: string | null;
  created_at: string;
}

export interface ReviewsResponse {
  reviews: ReviewRow[];
  avg: number;
  count: number;
}

export interface SubmitReviewPayload {
  serviceType: ServiceType;
  serviceId: string;
  reviewerName: string;
  rating: number;
  /** Comentario opcional (máx 20 palabras / 200 chars, validado en backend). */
  comment?: string;
  turnstileToken: string;
}

/**
 * Obtiene las reseñas + agregado (avg, count) de un servicio.
 * Lanza Error si la petición falla.
 */
export async function fetchReviews(
  serviceType: ServiceType,
  serviceId: string
): Promise<ReviewsResponse> {
  const url = `/api/reviews?service_type=${encodeURIComponent(
    serviceType
  )}&service_id=${encodeURIComponent(serviceId)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Error al cargar reseñas (${res.status})`);
  }
  return (await res.json()) as ReviewsResponse;
}

/**
 * Envía una reseña nueva. Devuelve la reseña creada.
 * Lanza Error con mensaje legible si falla.
 */
export async function submitReview(
  payload: SubmitReviewPayload
): Promise<ReviewRow> {
  const res = await fetch("/api/reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    review?: ReviewRow;
    error?: string;
  };
  if (!res.ok || !data.ok) {
    throw new Error(data.error ?? `Error al enviar (${res.status})`);
  }
  return data.review!;
}

/**
 * Normaliza un código ISO 3166-1 alpha-2 (ej. "co", "US") a minúsculas para
 * usar como clase de `flag-icons` (ej. "fi-co"). No se usa el emoji de
 * bandera Unicode porque Windows no lo renderiza (muestra las dos letras
 * sueltas en vez de la banderita). Devuelve null si el código no es válido.
 */
export function normalizeCountryCode(
  code: string | null | undefined
): string | null {
  if (!code || code.length !== 2) return null;
  const lower = code.toLowerCase();
  if (!/^[a-z]{2}$/.test(lower)) return null;
  return lower;
}

/**
 * Sitekey público de Turnstile.
 * Se sirve como variable pública de entorno en Cloudflare Pages
 * (Settings → Environment variables → VITE_TURNSTILE_SITEKEY).
 * En desarrollo local se puede omitir (el form simplemente no mostrará widget).
 */
export const TURNSTILE_SITEKEY: string | undefined =
  (import.meta as unknown as { env?: { VITE_TURNSTILE_SITEKEY?: string } }).env
    ?.VITE_TURNSTILE_SITEKEY;
