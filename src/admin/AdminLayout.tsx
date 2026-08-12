import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAdminAuth, signOutAdmin } from "./lib/use-admin-auth";
import { AdminLogin } from "./AdminLogin";
import { supabase } from "./lib/supabase-client";

const NAV_ITEMS = [
  { to: "/admin/planes", label: "Planes" },
  { to: "/admin/cabanas", label: "Cabañas" },
  { to: "/admin/categorias", label: "Categorías del buscador" },
  { to: "/admin/destinos", label: "Destinos sugeridos" },
  { to: "/admin/hero", label: "Hero (portada)" },
  { to: "/admin/secciones", label: "Inicio" },
];

export function AdminLayout() {
  const { session, isAdmin, loading } = useAdminAuth();
  const [publishing, setPublishing] = useState(false);
  const [publishMsg, setPublishMsg] = useState<string | null>(null);
  const [navOpen, setNavOpen] = useState(false);
  const location = useLocation();

  // Cierra el cajón de navegación móvil automáticamente al cambiar de página.
  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent" />
      </div>
    );
  }

  if (!session) return <AdminLogin />;

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-foreground">
          Tu cuenta ({session.user.email}) no tiene acceso al panel de administración.
        </p>
        <Button variant="outline" onClick={signOutAdmin}>
          Cerrar sesión
        </Button>
      </div>
    );
  }

  const handlePublish = async () => {
    setPublishing(true);
    setPublishMsg(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const res = await fetch("/api/admin/publish", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !body.ok) {
        setPublishMsg(body.error ?? "No se pudo publicar.");
      } else {
        setPublishMsg("¡Publicado! El sitio se está reconstruyendo (toma 1-2 min).");
      }
    } catch {
      setPublishMsg("No se pudo conectar con el servidor.");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-neutral-50">
      {/* Overlay móvil — toca fuera del cajón para cerrarlo */}
      {navOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setNavOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-border bg-white transition-transform duration-200 md:static md:z-auto md:w-60 md:translate-x-0",
          navOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-4">
          <div>
            <p className="text-sm font-bold text-foreground">Vive Travel</p>
            <p className="text-xs text-muted-foreground">Panel de administración</p>
          </div>
          <button
            type="button"
            onClick={() => setNavOpen(false)}
            className="rounded-md p-2 text-muted-foreground hover:bg-neutral-100 md:hidden"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "block rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-neutral-900 text-white"
                    : "text-foreground hover:bg-neutral-100"
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-border p-3">
          <p className="truncate px-1 text-xs text-muted-foreground">{session.user.email}</p>
          <Button variant="ghost" size="sm" className="mt-1 w-full justify-start" onClick={signOutAdmin}>
            Cerrar sesión
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-col gap-2 border-b border-border bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setNavOpen(true)}
              className="-ml-1 shrink-0 rounded-md p-2 text-foreground hover:bg-neutral-100 md:hidden"
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </button>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Los cambios se guardan al instante. Presiona <strong>Publicar</strong> para que salgan al sitio en vivo.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {publishMsg && <span className="text-xs text-muted-foreground">{publishMsg}</span>}
            <Button onClick={handlePublish} disabled={publishing} className="shrink-0">
              {publishing ? "Publicando…" : "Publicar"}
            </Button>
          </div>
        </header>
        <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
