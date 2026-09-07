import { createClient } from "@supabase/supabase-js";

// Ver reviews-api.ts: el proyecto no incluye los tipos de "vite/client", así
// que import.meta.env se castea explícitamente (mismo patrón ya usado ahí).
const env = (import.meta as unknown as { env?: Record<string, string | undefined> })
  .env;
const url = env?.VITE_SUPABASE_URL;
const anonKey = env?.VITE_SUPABASE_ANON_KEY;

// Sin credenciales, createClient("", "") lanza "supabaseUrl is required" y
// tumba todo /admin (error boundary). Usamos placeholders para que la app
// arranque y AdminApp muestre el aviso de configuración.
export const supabaseConfigMissing = !url || !anonKey;

if (supabaseConfigMissing) {
  // eslint-disable-next-line no-console
  console.error(
    "[admin] Faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — el panel /admin no puede conectarse a Supabase."
  );
}

export const supabase = createClient(
  url ?? "https://placeholder.supabase.co",
  anonKey ?? "placeholder-anon-key"
);
