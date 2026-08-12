import { useEffect } from "react";

/**
 * Advierte con el diálogo nativo del navegador si el usuario intenta cerrar
 * la pestaña o navegar fuera del sitio teniendo cambios sin guardar.
 */
export function useUnsavedChangesWarning(hasUnsavedChanges: boolean) {
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasUnsavedChanges]);
}
