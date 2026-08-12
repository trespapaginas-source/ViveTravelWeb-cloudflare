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
      checkAdmin(data.session);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(true);
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
