/**
 * Utilidades de favoritos (localStorage).
 * Persiste IDs de planes y cabañas marcados por el usuario.
 */

const STORAGE_KEY = "vive-travel-favorites";

export interface FavoriteItem {
  id: string;
  type: "plan" | "cabin";
  addedAt: number;
}

function read(): FavoriteItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as FavoriteItem[]) : [];
  } catch {
    return [];
  }
}

function write(items: FavoriteItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    // Dispara un evento para que los componentes suscritos se actualicen.
    window.dispatchEvent(new Event("favorites-changed"));
  } catch {
    /* storage lleno o no disponible */
  }
}

export function getFavorites(): FavoriteItem[] {
  return read();
}

export function isFavorite(id: string): boolean {
  return read().some((f) => f.id === id);
}

export function toggleFavorite(id: string, type: "plan" | "cabin"): boolean {
  const items = read();
  const idx = items.findIndex((f) => f.id === id);
  if (idx >= 0) {
    items.splice(idx, 1);
    write(items);
    return false;
  }
  items.push({ id, type, addedAt: Date.now() });
  write(items);
  return true;
}

export function clearFavorites(): void {
  write([]);
}
