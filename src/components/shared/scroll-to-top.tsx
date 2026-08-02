import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop — reinicia el scroll al tope de la página cada vez que cambia
 * la ruta (pathname).
 *
 * React Router v6 NO restaura el scroll automáticamente al navegar. Sin este
 * componente, si el usuario hace scroll hacia abajo en una página de detalle
 * larga y luego navega a otra página (ej: clic en "Volver" o en una tarjeta
 * relacionada), la nueva página carga en la misma posición de scroll → el
 * usuario ve contenido "en blanco" hasta hacer scroll manual arriba.
 *
 * Se ignora el hash (los anclajes tipo /politicas/terminos#clausula-3 deben
 * respetar su posición natural, no forzar scroll al tope).
 *
 * Se monta una sola vez dentro del layout público (ver public-layout.tsx).
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Solo forzamos el tope cuando NO hay hash en la URL.
    if (!window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    }
  }, [pathname]);

  return null;
}
