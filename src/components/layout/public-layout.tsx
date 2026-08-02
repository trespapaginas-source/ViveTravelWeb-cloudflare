import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { WhatsAppFab } from "@/components/shared/whatsapp-fab";
import { ScrollToTop } from "@/components/shared/scroll-to-top";

/**
 * PublicLayout — envoltura global compartida por todas las rutas.
 * Incluye Navbar fijo, Footer (auto-oculto en detalles) y el botón flotante
 * de WhatsApp. El padding-top del main compensa el header fijo.
 */
export function PublicLayout() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Navbar />
      <main className={isHome ? "flex-1" : "flex-1 pt-16 sm:pt-20"}>
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFab />
    </div>
  );
}
