import { useEffect, useState } from "react";

/**
 * useGeoCity — detecta la ciudad del usuario vía IP usando un servicio
 * gratuito de geolocalización (ipapi.co, sin API key). Devuelve:
 *  - `city`: nombre de la ciudad detectada (o null si falla/aún carga).
 *  - `loading`: true mientras la petición está en curso.
 *
 * Es no bloqueante: si la API falla o tarda, el consumidor puede seguir
 * con su valor por defecto. La detección ocurre una sola vez al montar.
 *
 * Nota: ipapi.co permite ~1000 peticiones/día sin registro, suficiente
 * para el tráfico esperado. Si se necesita más volumen, se puede cambiar
 * el endpoint sin tocar el resto del código.
 */
export function useGeoCity() {
  const [city, setCity] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function detect() {
      try {
        // ipapi.co devuelve JSON con `city` en la raíz.
        const res = await fetch("https://ipapi.co/json/", {
          signal: AbortSignal.timeout?.(4000) as never,
        });
        if (!res.ok) throw new Error("geo http " + res.status);
        const data = (await res.json()) as { city?: string; country_name?: string };
        const c = data.city?.trim();
        if (!cancelled && c) {
          setCity(c);
        }
      } catch {
        // Silencioso: si falla, el caller usa su valor por defecto.
        if (!cancelled) setCity(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    detect();
    return () => {
      cancelled = true;
    };
  }, []);

  return { city, loading };
}
