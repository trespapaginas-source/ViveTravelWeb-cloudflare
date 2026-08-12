import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase-client";

export interface AdminAuthState {
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
}

/**
 * Sesión de Supabase Auth + verificación de pertenencia a public.admins.
 * La verificación real de acceso ocurre en RLS (auth.uid() en admins); este
 * hook solo controla la UI (mostrar login / redirigir / mostrar el panel).
 */
export function useAdminAuth(): AdminAuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let firstCheckDone = false;

    async function checkAdmin(currentSession: Session | null) {
      if (!currentSession) {
        if (!cancelled) {
          setIsAdmin(false);
          setLoading(false);
        }
        return;
      }
      const { data } = await supabase
        .from("admins")
        .select("id")
        .eq("id", currentSession.user.id)
        .maybeSingle();
      if (!cancelled) {
        setIsAdmin(!!data);
        setLoading(false);
      }
    }

    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setSession(data.session);
      checkAdmin(data.session).finally(() => {
        firstCheckDone = true;
      });
    });

    // Supabase dispara onAuthStateChange no solo al iniciar/cerrar sesión,
    // sino también en refrescos silenciosos de token (ej. al recuperar el
    // foco de la ventana). Volver a poner loading=true ahí desmontaría todo
    // AdminLayout — incluida la vista de edición con cambios sin guardar —
    // por eso solo se muestra el loader de pantalla completa en la carga
    // inicial; después, un cierre de sesión real (next === null) es la
    // única razón para volver a bloquear la UI.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (!firstCheckDone || !next) {
        setLoading(true);
      }
      checkAdmin(next);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { session, isAdmin, loading };
}

export async function signInAdmin(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return error?.message ?? null;
}

export async function signOutAdmin() {
  await supabase.auth.signOut();
}
