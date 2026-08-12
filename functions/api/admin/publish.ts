/**
 * Cloudflare Pages Function — dispara la reconstrucción del sitio.
 *
 * POST /api/admin/publish
 *   Header: Authorization: Bearer <access_token de Supabase Auth del admin>
 *
 * Valida el token contra Supabase (RLS de public.admins: solo un admin puede
 * leer su propia fila) y, si es válido, reenvía al Deploy Hook de Cloudflare
 * Pages. La URL del hook nunca se expone al navegador — vive solo como
 * secreto de esta Function, igual que TURNSTILE_SECRET en /api/reviews.
 */

export interface Env {
  CF_PAGES_DEPLOY_HOOK_URL: string;
  SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json",
};

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }
  if (request.method !== "POST") {
    return jsonError("Método no permitido", 405);
  }

  const authHeader = request.headers.get("Authorization");
  if (!authHeader) {
    return jsonError("No autenticado", 401);
  }

  // La RLS de public.admins solo deja ver la fila propia si auth.uid() está
  // en admins — si el request no trae un token de un admin real, esto
  // devuelve un array vacío (no un error).
  let adminRows: unknown;
  try {
    const verifyRes = await fetch(`${env.SUPABASE_URL}/rest/v1/admins?select=id`, {
      headers: {
        Authorization: authHeader,
        apikey: env.VITE_SUPABASE_ANON_KEY,
      },
    });
    if (!verifyRes.ok) {
      return jsonError("No autorizado", 403);
    }
    adminRows = await verifyRes.json();
  } catch {
    return jsonError("No se pudo verificar la sesión", 502);
  }

  if (!Array.isArray(adminRows) || adminRows.length === 0) {
    return jsonError("No autorizado", 403);
  }

  try {
    const hookRes = await fetch(env.CF_PAGES_DEPLOY_HOOK_URL, { method: "POST" });
    if (!hookRes.ok) {
      return jsonError(`El deploy hook respondió ${hookRes.status}`, 502);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    return jsonError(`No se pudo disparar el deploy: ${msg}`, 502);
  }

  return new Response(JSON.stringify({ ok: true }), { headers: CORS_HEADERS });
};

function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: CORS_HEADERS,
  });
}
