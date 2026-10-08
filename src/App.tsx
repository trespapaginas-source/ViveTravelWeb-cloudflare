import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PublicLayout } from "@/components/layout/public-layout";
import { HomePage } from "@/pages/home";

// Code-splitting: todo salvo el Home se carga bajo demanda. Los catálogos
// (planes/cabañas/visas/transporte) también son lazy — así sus datos JSON y
// sus filtros no pesan en la primera visita.
const PlansPage = lazy(() =>
  import("@/pages/plans").then((m) => ({ default: m.PlansPage }))
);
const CabinsPage = lazy(() =>
  import("@/pages/cabins").then((m) => ({ default: m.CabinsPage }))
);
const VisasPage = lazy(() =>
  import("@/pages/visas").then((m) => ({ default: m.VisasPage }))
);
const TransportsPage = lazy(() =>
  import("@/pages/transports").then((m) => ({ default: m.TransportsPage }))
);

// Code-splitting: las páginas secundarias se cargan bajo demanda.
// Esto reduce el bundle inicial (solo Home + catálogos críticos cargan de entrada).
const PlanDetailPage = lazy(() =>
  import("@/pages/plan-detail").then((m) => ({ default: m.PlanDetailPage }))
);
const CabinDetailPage = lazy(() =>
  import("@/pages/cabin-detail").then((m) => ({ default: m.CabinDetailPage }))
);
const LegalDocPage = lazy(() =>
  import("@/pages/legal-doc").then((m) => ({ default: m.LegalDocPage }))
);
const PoliciesPage = lazy(() =>
  import("@/pages/policies").then((m) => ({ default: m.PoliciesPage }))
);
const TransportDetailPage = lazy(() =>
  import("@/pages/transport-detail").then((m) => ({
    default: m.TransportDetailPage,
  }))
);
const VisaDetailPage = lazy(() =>
  import("@/pages/visa-detail").then((m) => ({ default: m.VisaDetailPage }))
);
const ContactPage = lazy(() =>
  import("@/pages/contact").then((m) => ({ default: m.ContactPage }))
);
const TeamPage = lazy(() =>
  import("@/pages/team").then((m) => ({ default: m.TeamPage }))
);
const FavoritesPage = lazy(() =>
  import("@/pages/favorites").then((m) => ({ default: m.FavoritesPage }))
);
const NotFoundPage = lazy(() =>
  import("@/pages/index").then((m) => ({ default: m.NotFoundPage }))
);
const AdminApp = lazy(() =>
  import("@/admin/AdminApp").then((m) => ({ default: m.AdminApp }))
);

/** Loader mostrado mientras carga una página bajo demanda. */
function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Panel de administración — layout propio (sin navbar/footer públicos) */}
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<PageLoader />}>
              <AdminApp />
            </Suspense>
          }
        />

        <Route element={<PublicLayout />}>
          {/* Ruta crítica (eager) */}
          <Route path="/" element={<HomePage />} />

          {/* Catálogos y rutas secundarias (lazy) */}
          <Route
            path="/planes"
            element={
              <Suspense fallback={<PageLoader />}>
                <PlansPage />
              </Suspense>
            }
          />
          <Route
            path="/cabanas"
            element={
              <Suspense fallback={<PageLoader />}>
                <CabinsPage />
              </Suspense>
            }
          />
          <Route
            path="/visas"
            element={
              <Suspense fallback={<PageLoader />}>
                <VisasPage />
              </Suspense>
            }
          />
          <Route
            path="/transporte"
            element={
              <Suspense fallback={<PageLoader />}>
                <TransportsPage />
              </Suspense>
            }
          />

          {/* Rutas secundarias (lazy) */}
          <Route
            path="/planes/:id"
            element={
              <Suspense fallback={<PageLoader />}>
                <PlanDetailPage />
              </Suspense>
            }
          />
          <Route
            path="/cabanas/:id"
            element={
              <Suspense fallback={<PageLoader />}>
                <CabinDetailPage />
              </Suspense>
            }
          />
          <Route
            path="/transporte/:id"
            element={
              <Suspense fallback={<PageLoader />}>
                <TransportDetailPage />
              </Suspense>
            }
          />
          <Route
            path="/visas/:country"
            element={
              <Suspense fallback={<PageLoader />}>
                <VisaDetailPage />
              </Suspense>
            }
          />
          <Route
            path="/contacto"
            element={
              <Suspense fallback={<PageLoader />}>
                <ContactPage />
              </Suspense>
            }
          />
          <Route
            path="/equipo"
            element={
              <Suspense fallback={<PageLoader />}>
                <TeamPage />
              </Suspense>
            }
          />
          <Route
            path="/favoritos"
            element={
              <Suspense fallback={<PageLoader />}>
                <FavoritesPage />
              </Suspense>
            }
          />
          <Route
            path="/politicas"
            element={
              <Suspense fallback={<PageLoader />}>
                <PoliciesPage />
              </Suspense>
            }
          />
          <Route
            path="/politicas/:doc"
            element={
              <Suspense fallback={<PageLoader />}>
                <LegalDocPage />
              </Suspense>
            }
          />
          <Route
            path="*"
            element={
              <Suspense fallback={<PageLoader />}>
                <NotFoundPage />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
