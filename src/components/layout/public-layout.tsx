import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

/**
 * PublicLayout — envoltura global compartida por todas las rutas.
 * Incluye Navbar fijo y Footer (este último se auto-oculta en detalles).
 * El padding-top del main compensa el header fijo.
 */
export function PublicLayout() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main
        className={
          isHome
            ? "flex-1"
            : "flex-1 pt-16 sm:pt-20"
        }
      >
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
