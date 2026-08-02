import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

/**
 * useGoBack — devuelve una función que lleva al usuario a la página anterior
 * de forma inteligente:
 *
 * 1. Si hay historial previo en la sesión (el usuario navegó desde otra
 *    página dentro de la app), usa `navigate(-1)` para volver al lugar
 *    exacto desde donde proviene, preservando scroll, filtros y estado.
 * 2. Si NO hay historial previo (entró directo por URL compartida, recarga
 *    o abrió la página en una pestaña nueva), cae al `fallback` indicado
 *    (por ejemplo el catálogo correspondiente) para no dejarlo atrapado.
 *
 * Esto arregla el bug clásico del botón "Volver" harcodeado que siempre
 * mandaba al catálogo sin importar el origen, rompiendo la pila de
 * navegación.
 *
 * @param fallback Ruta a la que ir si no hay historial previo.
 */
export function useGoBack(fallback: string) {
  const navigate = useNavigate();

  return useCallback(() => {
    // `window.history.state.idx` indica la posición en la pila de historial
    // de la sesión actual. Si es 0 (o no existe), no hay página anterior
    // a la que volver dentro de la app → usamos el fallback.
    const state = window.history.state as { idx?: number } | null;
    const hasHistory = typeof state?.idx === "number" && state.idx > 0;

    if (hasHistory) {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  }, [navigate, fallback]);
}
