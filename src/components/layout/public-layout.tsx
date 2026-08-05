import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { WhatsAppFab } from "@/components/shared/whatsapp-fab";
import { ScrollToTop } from "@/components/shared/scroll-to-top";
import { cn } from "@/lib/utils";

/**
 * PublicLayout — envoltura global compartida por todas las rutas.
 * Incluye Navbar fijo, Footer (auto-oculto en detalles) y el botón flotante
 * de WhatsApp. El padding-top del main compensa el header fijo.
 */
export function PublicLayout() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <ScrollToTop />
      <Navbar />
      <main className={cn("flex-1", isHome ? "" : "pt-16 sm:pt-20")}>
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFab />
    </div>
  );
}
