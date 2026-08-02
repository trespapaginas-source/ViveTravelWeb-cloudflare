/**
 * Capa de acceso a datos normalizada (arquitectura tipo base de datos).
 *
 * Es el ÚNICO punto de contacto con los archivos JSON crudos de src/data/.
 * Devuelve registros con un esquema consistente:
 *   - `id` único e inmutable (string)
 *   - `is_active` booleano (bandera de estado / publicación)
 *   - `is_featured` booleano (destacado)
 *   - Fechas ISO "YYYY-MM-DD" validadas (sanitiza formatos sueltos)
 *
 * Los componentes y hooks consumen EXCLUSIVAMENTE estas funciones,
 * nunca los JSON directamente.
 */

import plansRaw from "@/data/planes.json";
import cabinsRaw from "@/data/cabins.json";
import transportsRaw from "@/data/transports.json";
import visasRaw from "@/data/visas.json";
import testimonialsRaw from "@/data/testimonials.json";
import type {
  TourPlan,
  Cabin,
  Transport,
  Visa,
  Testimonial,
} from "@/lib/data";

/* ─────────────────────── Helpers de normalización ─────────────────────── */

/** Valida que una fecha sea ISO "YYYY-MM-DD"; si no, devuelve null. */
function normalizeDate(value: unknown): string | null {
  if (typeof value !== "string") return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(value + "T00:00:00");
  return isNaN(d.getTime()) ? null : value;
}

/** Coerce cualquier valor a booleano (default false). */


/* ──────────────────────────── Planes ──────────────────────────────────── */

export interface NormalizedPlan extends TourPlan {
  is_active: boolean;
  is_featured: boolean;
}

export function getAllPlans(): NormalizedPlan[] {
  return (plansRaw as TourPlan[]).map((p) => ({
    ...p,
    // `published` es la bandera de estado del JSON original; default true.
    is_active: p.published !== false,
    // Destacado si featuredOrder es un número (coincide con la lógica del home).
    is_featured: typeof p.featuredOrder === "number",
    // Sanea departureDates a formato ISO estricto, descartando inválidas.
    departureDates: (p.departureDates ?? []).flatMap((d) => {
      const start = normalizeDate(d.start);
      const end = normalizeDate(d.end);
      return start && end ? [{ start, end }] : [];
    }),
  }));
}

/** Solo los planes activos (publicados). */
export function getActivePlans(): NormalizedPlan[] {
  return getAllPlans().filter((p) => p.is_active);
}

/* ──────────────────────────── Cabins ──────────────────────────────────── */

export interface NormalizedCabin extends Cabin {
  is_active: boolean;
  is_featured: boolean;
}

export function getAllCabins(): NormalizedCabin[] {
  return (cabinsRaw as Cabin[]).map((c) => ({
    ...c,
    is_active: c.published !== false,
    // Destacada si tiene rating alto (>= 4.8) o es la primera (order 0).
    is_featured: (c.rating ?? 0) >= 4.8 || c.order === 0,
  }));
}

export function getActiveCabins(): NormalizedCabin[] {
  return getAllCabins().filter((c) => c.is_active);
}

/* ──────────────────────────── Transports ──────────────────────────────── */

export interface NormalizedTransport extends Transport {
  is_active: boolean;
}

export function getAllTransports(): NormalizedTransport[] {
  return (transportsRaw as Transport[]).map((t) => ({
    ...t,
    is_active: true, // toda la flota está activa por defecto
  }));
}

export function getActiveTransports(): NormalizedTransport[] {
  return getAllTransports().filter((t) => t.is_active);
}

/* ────────────────────────────── Visas ─────────────────────────────────── */

export interface NormalizedVisa extends Visa {
  is_active: boolean;
}

export function getAllVisas(): NormalizedVisa[] {
  return (visasRaw as Visa[]).map((v) => ({
    ...v,
    is_active: true, // todos los países del catálogo están activos
  }));
}

export function getActiveVisas(): NormalizedVisa[] {
  return getAllVisas().filter((v) => v.is_active);
}

/** Agrupa visas por categoryId ("free" | "onarrival" | "required"). */
export function getVisasByCategory(): Record<string, NormalizedVisa[]> {
  return getActiveVisas().reduce<Record<string, NormalizedVisa[]>>((acc, v) => {
    (acc[v.categoryId] ??= []).push(v);
    return acc;
  }, {});
}

/* ────────────────────────── Testimonials ──────────────────────────────── */

export function getAllTestimonials(): Testimonial[] {
  return testimonialsRaw as Testimonial[];
}
