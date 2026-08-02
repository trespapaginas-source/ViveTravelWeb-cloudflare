import { useMemo } from "react";
import {
  getAllPlans,
  getAllCabins,
  getAllVisas,
} from "@/lib/data-access";
import legalDocsRawJson from "@/data/legal-docs.json";
import type { LegalDoc } from "@/lib/data";

export const legalDocsRaw = legalDocsRawJson as LegalDoc[];

/* ──────────────────────── Plan por ID ───────────────────────── */

export function usePlanDetail(id: string | undefined) {
  const data = useMemo(() => {
    if (!id) return null;
    return getAllPlans().find((p) => p.id === id) ?? null;
  }, [id]);
  return { data, isLoading: false, notFound: !data };
}

/* ─────────────────────── Cabin por ID ───────────────────────── */

export function useCabinDetail(id: string | undefined) {
  const data = useMemo(() => {
    if (!id) return null;
    return getAllCabins().find((c) => c.id === id) ?? null;
  }, [id]);
  return { data, isLoading: false, notFound: !data };
}

/* ─────────────────────── Visa por slug ──────────────────────── */

export function useVisaDetail(slug: string | undefined) {
  const data = useMemo(() => {
    if (!slug) return null;
    return getAllVisas().find((v) => v.slug === slug) ?? null;
  }, [slug]);
  return { data, isLoading: false, notFound: !data };
}

/* ──────────────────── Documentos legales ────────────────────── */

const legalDocs = legalDocsRaw as LegalDoc[];

export function useLegalDocs(slug: string | undefined) {
  const sorted = useMemo(
    () => [...legalDocs].sort((a, b) => a.number.localeCompare(b.number)),
    []
  );
  const data = useMemo(
    () => (slug ? sorted.find((d) => d.slug === slug) ?? null : null),
    [slug, sorted]
  );

  // Documentos adyacentes (prev/next) para la navegación.
  const adjacent = useMemo(() => {
    if (!data) return { prev: null, next: null };
    const idx = sorted.findIndex((d) => d.slug === data.slug);
    return {
      prev: idx > 0 ? sorted[idx - 1] : null,
      next: idx >= 0 && idx < sorted.length - 1 ? sorted[idx + 1] : null,
    };
  }, [data, sorted]);

  return {
    data,
    all: sorted,
    prev: adjacent.prev,
    next: adjacent.next,
    isLoading: false,
    notFound: slug ? !data : false,
  };
}
