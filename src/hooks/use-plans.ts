import { useMemo } from "react";
import {
  getActivePlans,
  getActiveCabins,
  getActiveTransports,
  getActiveVisas,
  getVisasByCategory,
  getAllTestimonials,
  type NormalizedPlan,
  type NormalizedCabin,
  type NormalizedTransport,
  type NormalizedVisa,
} from "@/lib/data-access";
import type { Testimonial } from "@/lib/data";

/**
 * Contrato uniforme de los hooks de catálogo.
 * - `data`: lista de registros normalizados.
 * - `isLoading`: true durante la carga (futuro: async/fetch).
 * - `isEmpty`: true cuando no hay datos (tras filtros o catálogo vacío).
 */
export interface CatalogResult<T> {
  data: T[];
  isLoading: boolean;
  isEmpty: boolean;
}

/* ───────────────────────────── usePlanes ──────────────────────────────── */

export function usePlanes(): CatalogResult<NormalizedPlan> {
  const data = useMemo(() => getActivePlans(), []);
  return { data, isLoading: false, isEmpty: data.length === 0 };
}

/* ───────────────────────────── useCabanas ─────────────────────────────── */

export function useCabanas(): CatalogResult<NormalizedCabin> {
  const data = useMemo(() => getActiveCabins(), []);
  return { data, isLoading: false, isEmpty: data.length === 0 };
}

/* ──────────────────────────── useTransports ───────────────────────────── */

export function useTransports(): CatalogResult<NormalizedTransport> {
  const data = useMemo(() => getActiveTransports(), []);
  return { data, isLoading: false, isEmpty: data.length === 0 };
}

/* ───────────────────────────── useVisas ───────────────────────────────── */

export function useVisas(): CatalogResult<NormalizedVisa> & {
  byCategory: Record<string, NormalizedVisa[]>;
} {
  const data = useMemo(() => getActiveVisas(), []);
  const byCategory = useMemo(() => getVisasByCategory(), []);
  return { data, byCategory, isLoading: false, isEmpty: data.length === 0 };
}

/* ────────────────────────── useTestimonials ───────────────────────────── */

export function useTestimonials(): CatalogResult<Testimonial> {
  const data = useMemo(() => getAllTestimonials(), []);
  return { data, isLoading: false, isEmpty: data.length === 0 };
}
