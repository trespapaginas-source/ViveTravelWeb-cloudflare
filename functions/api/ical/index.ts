/**
 * Proxy iCal — sirve un feed .ics externo con cabeceras CORS permisivas.
 *
 * Uso: GET /api/ical?url=<feed .ics codificado>
 *
 * Sin este proxy, el navegador bloquea el fetch directo a Google Calendar /
 * Airbnb / Booking por CORS, y el calendario de disponibilidad nunca carga.
 * La Pages Function actúa como intermediario server-side (sin restricción CORS)
 * y devuelve el contenido con Access-Control-Allow-Origin: *.
 *
 * Hardening:
 *   - Solo permite URLs https (evita redirecciones a http).
 *   - Allowlist de hosts conocidos (google calendar, airbnb, booking).
 *   - Timeout de 10s para evitar que la página cuelgue.
 *   - Pasa User-Agent para que Google no responda 403.
 */

const ALLOWED_HOSTS = [
  "calendar.google.com",
  "www.google.com",
  "ical.airbnb.com",
  "www.airbnb.com",
  "calendar.booking.com",
  "secure.booking.com",
];

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const onRequest: PagesFunction = async (context) => {
  const { request } = context;

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  const url = new URL(request.url);
  const target = url.searchParams.get("url");

  if (!target) {
    return jsonError("Falta el parámetro 'url'", 400);
  }

  // Validar que sea https y host permitido (evita proxy abierto / SSRF).
  let targetUrl: URL;
  try {
    targetUrl = new URL(target);
  } catch {
    return jsonError("URL inválida", 400);
  }
  if (targetUrl.protocol !== "https:") {
    return jsonError("Solo se permiten URLs https", 400);
  }
  if (!ALLOWED_HOSTS.some((h) => targetUrl.hostname === h || targetUrl.hostname.endsWith("." + h))) {
    return jsonError("Host no permitido", 403);
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(targetUrl.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; ViveTravelBot/1.0; +https://vive-travel-web.pages.dev)",
        Accept: "text/calendar,text/plain;q=0.9,*/*;q=0.8",
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return jsonError(`El feed respondió ${res.status}`, 502);
    }

    const text = await res.text();
    return new Response(text, {
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "text/calendar; charset=utf-8",
        "Cache-Control": "public, max-age=300", // cachea 5 min en el edge
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    return jsonError(`No se pudo obtener el feed: ${msg}`, 502);
  }
};

function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}
