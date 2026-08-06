import { useCallback, useEffect, useState } from "react";
import {
  fetchReviews,
  submitReview,
  type ReviewRow,
  type ServiceType,
  type SubmitReviewPayload,
} from "@/lib/reviews-api";

interface UseReviewsState {
  reviews: ReviewRow[];
  avg: number;
  count: number;
  loading: boolean;
  error: string | null;
}

/**
 * useReviews — carga las reseñas reales de un servicio (plan o cabaña)
 * desde D1 vía la Pages Function. Tras un submit exitoso, refresca
 * automáticamente.
 */
export function useReviews(
  serviceType: ServiceType | null,
  serviceId: string | undefined
) {
  const [state, setState] = useState<UseReviewsState>({
    reviews: [],
    avg: 0,
    count: 0,
    loading: true,
    error: null,
  });

  const load = useCallback(async () => {
    if (!serviceType || !serviceId) {
      setState({ reviews: [], avg: 0, count: 0, loading: false, error: null });
      return;
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await fetchReviews(serviceType, serviceId);
      setState({
        reviews: data.reviews,
        avg: data.avg,
        count: data.count,
        loading: false,
        error: null,
      });
    } catch (e) {
      setState((s) => ({
        ...s,
        loading: false,
        error: e instanceof Error ? e.message : "Error desconocido",
      }));
    }
  }, [serviceType, serviceId]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = useCallback(
    async (payload: Omit<SubmitReviewPayload, "serviceType" | "serviceId">) => {
      if (!serviceType || !serviceId) {
        throw new Error("Servicio no definido");
      }
      const review = await submitReview({
        ...payload,
        serviceType,
        serviceId,
      });
      // Refrescar tras éxito para actualizar avg/count.
      await load();
      return review;
    },
    [serviceType, serviceId, load]
  );

  return { ...state, refresh: load, submit };
}
