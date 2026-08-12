/** Un campo vacío se considera válido (opcional) — solo se valida el formato si hay texto. */
export function isValidUrl(value: string): boolean {
  const v = value.trim();
  if (!v) return true;
  if (!/^https?:\/\//i.test(v)) return false;
  try {
    new URL(v);
    return true;
  } catch {
    return false;
  }
}

export const URL_ERROR_MESSAGE =
  "Formato inválido. Ingresa un enlace web válido (ej. https://...).";

export const NUMBER_HELPER_TEXT =
  "Ingresa únicamente valores numéricos, sin puntos, comas ni el signo $.";
