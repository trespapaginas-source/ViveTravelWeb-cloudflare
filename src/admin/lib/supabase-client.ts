import { createClient } from "@supabase/supabase-js";

// Ver reviews-api.ts: el proyecto no incluye los tipos de "vite/client", así
// que import.meta.env se castea explícitamente (mismo patrón ya usado ahí).
const env = (import.meta as unknown as { env?: Record<string, string | undefined> })
  .env;
const url = env?.VITE_SUPABASE_URL;
const anonKey = env?.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // eslint-disable-next-line no-console
  console.error(
    "[admin] Faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — el panel /admin no puede conectarse a Supabase."
  );
}

export const supabase = createClient(url ?? "", anonKey ?? "");
