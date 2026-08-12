import { Navigate, Route, Routes } from "react-router-dom";
import { AdminLayout } from "./AdminLayout";
import { PlansAdmin } from "./pages/PlansAdmin";
import { CabinsAdmin } from "./pages/CabinsAdmin";
import { ServiceCategoriesAdmin } from "./pages/ServiceCategoriesAdmin";
import { PopularDestinationsAdmin } from "./pages/PopularDestinationsAdmin";
import { HeroAdmin } from "./pages/HeroAdmin";
import { HomeSectionsAdmin } from "./pages/HomeSectionsAdmin";

/** Router interno de /admin — AdminLayout controla el login/acceso. */
export function AdminApp() {
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
