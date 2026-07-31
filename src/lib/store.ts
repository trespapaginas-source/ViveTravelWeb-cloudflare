import { create } from "zustand";

/**
 * Store de navegación/búsqueda (Zustand) — adaptado del proyecto de referencia.
 *
 * Diferencia clave con el original: en Next.js usaba `window.location.assign`
 * (recarga completa) para navegar. En Vite + react-router-dom la navegación
 * la maneja `useNavigate`, por lo que este store retiene SOLO el estado de
 * búsqueda/UX (favoritos pulse, sticky bar) que debe sobrevivir entre rutas
 * sin recarga. Los parámetros de búsqueda se serializan en la URL
 * (useSearchParams) para que /planes los consuma de forma determinista.
 */

export interface SearchPayload {
  destino: string;
  origen?: string;
  fecha: string;
  adultos: number;
  ninos: number;
  fechaFin?: string;
  habitaciones?: number;
  roomsDetail?: string;
  tipoViajero?: string;
  categoria?: string;
  actividad?: string;
}

interface NavigationState {
  // --- Estado de búsqueda (consumido por el StickySummaryBar y /planes) ---
  searchDestination: string | null;
  searchOrigin: string | null;
  searchDate: string | null;
  searchDateEnd: string | null;
  searchAdults: string | null;
  searchChildren: string | null;
  searchRooms: string | null;
  searchRoomsDetail: string | null;
  searchTravelerType: string | null;
  searchCategory: string | null;
  searchActivity: string | null;
  searchIsSticky: boolean;
  searchPriceFrom: number | null;

  // --- UX ---
  favoritesPulseActive: boolean;
  plansViewMode: "1" | "2" | "3" | null;

  // --- Acciones ---
  setSearchPayload: (p: SearchPayload) => void;
  clearSearch: () => void;
  setSearchIsSticky: (v: boolean) => void;
  setSearchPriceFrom: (v: number | null) => void;
  setFavoritesPulseActive: (v: boolean) => void;
  setPlansViewMode: (m: "1" | "2" | "3" | null) => void;
}

export const useNavigation = create<NavigationState>((set) => ({
  searchDestination: null,
  searchOrigin: null,
  searchDate: null,
  searchDateEnd: null,
  searchAdults: null,
  searchChildren: null,
  searchRooms: null,
  searchRoomsDetail: null,
  searchTravelerType: null,
  searchCategory: null,
  searchActivity: null,
  searchIsSticky: false,
  searchPriceFrom: null,
  favoritesPulseActive: false,
  plansViewMode: null,

  setSearchPayload: (p) =>
    set({
      searchDestination: p.destino || null,
      searchOrigin: p.origen || null,
      searchDate: p.fecha || null,
      searchDateEnd: p.fechaFin || null,
      searchAdults: String(p.adultos),
      searchChildren: String(p.ninos),
      searchRooms: p.habitaciones ? String(p.habitaciones) : null,
      searchRoomsDetail: p.roomsDetail || null,
      searchTravelerType: p.tipoViajero || null,
      searchCategory: p.categoria || null,
      searchActivity: p.actividad || null,
      searchIsSticky: Boolean(p.destino),
    }),
  clearSearch: () =>
    set({
      searchDestination: null,
      searchOrigin: null,
      searchDate: null,
      searchDateEnd: null,
      searchAdults: null,
      searchChildren: null,
      searchRooms: null,
      searchRoomsDetail: null,
      searchTravelerType: null,
      searchCategory: null,
      searchActivity: null,
      searchIsSticky: false,
      searchPriceFrom: null,
    }),
  setSearchIsSticky: (v) => set({ searchIsSticky: v }),
  setSearchPriceFrom: (v) => set({ searchPriceFrom: v }),
  setFavoritesPulseActive: (v) => set({ favoritesPulseActive: v }),
  setPlansViewMode: (m) => set({ plansViewMode: m }),
}));
