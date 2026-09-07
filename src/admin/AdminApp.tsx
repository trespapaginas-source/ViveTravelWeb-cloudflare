import { Navigate, Route, Routes } from "react-router-dom";
import { AdminLayout } from "./AdminLayout";
import { supabaseConfigMissing } from "./lib/supabase-client";
import { PlansAdmin } from "./pages/PlansAdmin";
import { CabinsAdmin } from "./pages/CabinsAdmin";
import { ServiceCategoriesAdmin } from "./pages/ServiceCategoriesAdmin";
import { PopularDestinationsAdmin } from "./pages/PopularDestinationsAdmin";
import { HeroAdmin } from "./pages/HeroAdmin";
import { HomeSectionsAdmin } from "./pages/HomeSectionsAdmin";

/** Router interno de /admin — AdminLayout controla el login/acceso. */
export function AdminApp() {
  if (supabaseConfigMissing) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-6">
        <div className="max-w-lg bg-white border border-neutral-200 rounded-xl p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-neutral-900 mb-3">
            CMS sin configurar
          </h1>
          <p className="text-neutral-600 mb-4">
            El panel de administración necesita las credenciales de Supabase.
            Crea un archivo <code className="bg-neutral-100 px-1.5 py-0.5 rounded text-sm">.env</code> en
            la raíz del proyecto con:
          </p>
          <pre className="bg-neutral-900 text-neutral-100 text-xs rounded-lg p-4 overflow-x-auto mb-4">
{`VITE_SUPABASE_URL=https://<tu-proyecto>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>`}
          </pre>
          <p className="text-sm text-neutral-500">
            Ambas variables están en la consola de Supabase (Project Settings →
            API) y deben coincidir con las configuradas en Cloudflare Pages.
            Luego reinicia el servidor de desarrollo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <Routes>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="planes" replace />} />
          <Route path="planes" element={<PlansAdmin />} />
          <Route path="cabanas" element={<CabinsAdmin />} />
          <Route path="categorias" element={<ServiceCategoriesAdmin />} />
          <Route path="destinos" element={<PopularDestinationsAdmin />} />
          <Route path="hero" element={<HeroAdmin />} />
          <Route path="secciones" element={<HomeSectionsAdmin />} />
        </Route>
      </Routes>
    </div>
  );
}
