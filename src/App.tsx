import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PublicLayout } from "@/components/layout/public-layout";
import { HomePage } from "@/pages/home";
import { PlansPage } from "@/pages/plans";
import { CabinsPage } from "@/pages/cabins";
import { VisasPage } from "@/pages/visas";
import { TransportsPage } from "@/pages/transports";

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

/** Loader mostrado mientras carga una página bajo demanda. */
function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-ocean border-t-transparent" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          {/* Rutas críticas (eager) */}
          <Route path="/" element={<HomePage />} />
          <Route path="/planes" element={<PlansPage />} />
          <Route path="/cabanas" element={<CabinsPage />} />
          <Route path="/visas" element={<VisasPage />} />
          <Route path="/transporte" element={<TransportsPage />} />

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
