import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PublicLayout } from "@/components/layout/public-layout";
import { HomePage } from "@/pages/home";
import { PlansPage } from "@/pages/plans";
import { CabinsPage } from "@/pages/cabins";
import { VisasPage } from "@/pages/visas";
import { TransportsPage } from "@/pages/transports";
import {
  PlanDetailPage,
  CabinDetailPage,
  TransportDetailPage,
  VisaDetailPage,
  ContactPage,
  TeamPage,
  FavoritesPage,
  PoliciesPage,
  LegalDocPage,
  NotFoundPage,
} from "@/pages";

/**
 * App — FASE 1: navegación 100% funcional.
 *
 * Las 14 rutas mapeadas en MIGRATION_MAP.json están conectadas a componentes
 * base/placeholder envueltos por el PublicLayout (Navbar + Footer globales).
 * Cada placeholder confirma parámetros de ruta/query para verificar la
 * navegación. Las implementaciones reales se añaden en fases posteriores.
 *
 * Mapa de rutas:
 *  /                         → Home (hero mínimo + accesos a categorías)
 *  /planes                   → Listado de experiencias (con ?categoria=)
 *  /planes/:id               → Detalle de plan
 *  /cabanas                  → Listado de cabañas
 *  /cabanas/:id              → Detalle de cabaña
 *  /transporte               → Índice de transporte
 *  /transporte/:id           → Detalle de vehículo
 *  /visas                    → Índice de visas
 *  /visas/:country           → Detalle de visa
 *  /contacto                 → Contacto
 *  /equipo                   → Equipo
 *  /favoritos                → Favoritos
 *  /politicas                → Índice de documentos legales
 *  /politicas/:doc           → Documento legal
 *  *                         → 404
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/planes" element={<PlansPage />} />
          <Route path="/planes/:id" element={<PlanDetailPage />} />
          <Route path="/cabanas" element={<CabinsPage />} />
          <Route path="/cabanas/:id" element={<CabinDetailPage />} />
          <Route path="/transporte" element={<TransportsPage />} />
          <Route path="/transporte/:id" element={<TransportDetailPage />} />
          <Route path="/visas" element={<VisasPage />} />
          <Route path="/visas/:country" element={<VisaDetailPage />} />
          <Route path="/contacto" element={<ContactPage />} />
          <Route path="/equipo" element={<TeamPage />} />
          <Route path="/favoritos" element={<FavoritesPage />} />
          <Route path="/politicas" element={<PoliciesPage />} />
          <Route path="/politicas/:doc" element={<LegalDocPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
