/**
 * Cloudflare Pages Function — API de reseñas.
 *
 * GET  /api/reviews?service_type=plan&service_id=xxx
 *      → { reviews: ReviewRow[], avg: number, count: number }
 *
 * POST /api/reviews
 *      body: { serviceType, serviceId, reviewerName, destination, rating, turnstileToken }
 *      → valida Turnstile → inserta en D1 → { ok: true, review: ReviewRow }
 *
 * Protección anti-spam: Cloudflare Turnstile (token validado server-side)
 * + rate-limit suave por hash de IP (máx 3 reseñas por IP cada 10 min).
 */

export interface Env {
  DB: D1Database;
  TURNSTILE_SECRET: string;
}

interface ReviewRow {
  id: number;
  service_type: string;
  service_id: string;
  reviewer_name: string;
  destination: string;
  rating: number;
  created_at: string;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

const MAX_REVIEWS_PER_WINDOW = 3;
const RATE_LIMIT_WINDOW_MINUTES = 10;

/** Hash SHA-256 de un string (para hashear la IP sin almacenarla en claro). */
async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Valida el token de Turnstile contra la API de Cloudflare. */
async function verifyTurnstile(
  token: string,
  secret: string,
  remoteip: string | null
): Promise<boolean> {
  try {
    const params: Record<string, string> = {
      secret,
      response: token,
    };
    if (remoteip) params.remoteip = remoteip;

    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(params),
      }
    );
    if (!res.ok) return false;
    const data = (await res.json()) as { success: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // CORS preflight.
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  if (request.method === "GET") {
    return handleGet(request, env);
  }
  if (request.method === "POST") {
    return handlePost(request, env);
  }

  return new Response(JSON.stringify({ error: "Método no permitido" }), {
    status: 405,
    headers: CORS_HEADERS,
  });
};

async function handleGet(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const serviceType = url.searchParams.get("service_type");
  const serviceId = url.searchParams.get("service_id");

  if (!serviceType || !serviceId) {
    return jsonError("Faltan service_type o service_id", 400);
  }
  if (!["plan", "cabin"].includes(serviceType)) {
    return jsonError("service_type inválido (debe ser 'plan' o 'cabin')", 400);
  }

  const rows = await env.DB.prepare(
    "SELECT id, service_type, service_id, reviewer_name, destination, rating, created_at FROM reviews WHERE service_type = ? AND service_id = ? ORDER BY created_at DESC LIMIT 100"
  )
    .bind(serviceType, serviceId)
    .all<ReviewRow>();

  const reviews = rows.results ?? [];
  const count = reviews.length;
  const avg =
    count > 0
      ? Math.round(
          (reviews.reduce((s, r) => s + r.rating, 0) / count) * 10
        ) / 10
      : 0;

  return new Response(JSON.stringify({ reviews, avg, count }), {
    headers: CORS_HEADERS,
  });
}

async function handlePost(request: Request, env: Env): Promise<Response> {
  let body: {
    serviceType?: string;
    serviceId?: string;
    reviewerName?: string;
    destination?: string;
    rating?: number;
    turnstileToken?: string;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return jsonError("JSON inválido", 400);
  }

  // Validación de campos.
  const { serviceType, serviceId, reviewerName, destination, rating, turnstileToken } = body;
  if (!serviceType || !["plan", "cabin"].includes(serviceType)) {
    return jsonError("serviceType inválido", 400);
  }
  if (!serviceId || typeof serviceId !== "string") {
    return jsonError("serviceId requerido", 400);
  }
  if (!reviewerName || reviewerName.trim().length < 2 || reviewerName.trim().length > 60) {
    return jsonError("Nombre inválido (2-60 caracteres)", 400);
  }
  if (!destination || destination.trim().length < 2 || destination.trim().length > 80) {
    return jsonError("Destino inválido (2-80 caracteres)", 400);
  }
  const ratingNum = Number(rating);
  if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return jsonError("Rating debe ser un entero entre 1 y 5", 400);
  }
  if (!turnstileToken || typeof turnstileToken !== "string") {
    return jsonError("Token de Turnstile requerido", 400);
  }

  // Validar Turnstile.
  const remoteIp = request.headers.get("CF-Connecting-IP");
  const turnstileOk = await verifyTurnstile(
    turnstileToken,
    env.TURNSTILE_SECRET,
    remoteIp
  );
  if (!turnstileOk) {
    return jsonError("Verificación anti-spam fallida", 403);
  }

  // Rate-limit suave por hash de IP.
  const ipHash = remoteIp ? await sha256(remoteIp) : null;
  if (ipHash) {
    const recent = await env.DB.prepare(
      `SELECT COUNT(*) as c FROM reviews WHERE ip_hash = ? AND created_at >= datetime('now', '-${RATE_LIMIT_WINDOW_MINUTES} minutes')`
    )
      .bind(ipHash)
      .first<{ c: number }>();
    if (recent && recent.c >= MAX_REVIEWS_PER_WINDOW) {
      return jsonError(
        `Demasiadas reseñas recientes. Intenta de nuevo en ${RATE_LIMIT_WINDOW_MINUTES} minutos.`,
        429
      );
    }
  }

  // Insertar.
  const result = await env.DB.prepare(
    "INSERT INTO reviews (service_type, service_id, reviewer_name, destination, rating, ip_hash) VALUES (?, ?, ?, ?, ?, ?) RETURNING id, service_type, service_id, reviewer_name, destination, rating, created_at"
  )
    .bind(
      serviceType,
      serviceId,
      reviewerName.trim(),
      destination.trim(),
      ratingNum,
      ipHash
    )
    .first<ReviewRow>();

  if (!result) {
    return jsonError("No se pudo guardar la reseña", 500);
  }

  return new Response(JSON.stringify({ ok: true, review: result }), {
    status: 201,
    headers: CORS_HEADERS,
  });
}

function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: CORS_HEADERS,
  });
}
