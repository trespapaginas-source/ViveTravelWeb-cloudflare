import { useState, useEffect, useCallback } from "react";
import {
  getFavorites,
  isFavorite,
  toggleFavorite,
  type FavoriteItem,
} from "@/lib/favorites";

/**
 * Hook de favoritos — suscrito a cambios en localStorage.
 * Devuelve la lista actual y helpers de toggle/estado.
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  const refresh = useCallback(() => {
    setFavorites(getFavorites());
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener("favorites-changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("favorites-changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);

  const toggle = useCallback((id: string, type: "plan" | "cabin") => {
    toggleFavorite(id, type);
    refresh();
  }, [refresh]);

  const check = useCallback((id: string) => isFavorite(id), [favorites]);

  return {
    favorites,
    toggle,
    isFavorite: check,
    isEmpty: favorites.length === 0,
  };
}
