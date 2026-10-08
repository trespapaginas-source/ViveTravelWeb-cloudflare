/**
 * Optimización automática de imágenes del CMS antes de subir a Supabase.
 *
 * Convierte JPG/PNG/TIFF/BMP a WebP con el Canvas del navegador (sin
 * librerías ni costo de servidor) y redimensiona a un ancho máximo.
 * Reglas de seguridad: nunca rompe la subida — ante cualquier fallo,
 * formato no convertible o resultado más pesado que el original,
 * devuelve el archivo original intacto.
 */

export interface OptimizeResult {
  /** Archivo listo para subir (convertido, o el original si no conviene). */
  file: File;
  /** Tipo MIME del archivo original (ej. "image/jpeg"). */
  formatoOriginal: string;
  /** Resumen legible del ahorro (ej. "3.2 MB → 280 KB (WebP, -91%)"). */
  ahorro: string;
}

export interface OptimizeOptions {
  /** Ancho máximo en px; el alto se ajusta manteniendo la proporción. */
  maxAncho?: number;
  /** Calidad WebP 0-1. */
  calidad?: number;
}

/** Formatos que el Canvas puede decodificar y vale la pena convertir. */
const CONVERTIBLES = new Set([
  "image/jpeg",
  "image/png",
  "image/tiff",
  "image/bmp",
]);

/** Por debajo de este peso la conversión no aporta nada. */
const UMBRAL_PESO = 150 * 1024;

function fmtSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export async function optimizeImage(
  file: File,
  { maxAncho = 1920, calidad = 0.85 }: OptimizeOptions = {}
): Promise<OptimizeResult> {
  const sinCambios: OptimizeResult = {
    file,
    formatoOriginal: file.type || "desconocido",
    ahorro: "sin cambios",
  };

  if (!CONVERTIBLES.has(file.type) || file.size < UMBRAL_PESO) return sinCambios;

  try {
    // "from-image" aplica la rotación EXIF para que el canvas quede derecho.
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });

    // Redimensiona solo si excede el máximo; nunca amplía.
    const ancho = Math.min(bitmap.width, maxAncho);
    const alto = Math.round(bitmap.height * (ancho / bitmap.width));

    const canvas = document.createElement("canvas");
    canvas.width = ancho;
    canvas.height = alto;
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, ancho, alto);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", calidad)
    );

    // Safari antiguo codifica silenciosamente a PNG: verificar el tipo real.
    if (!blob || blob.type !== "image/webp") return sinCambios;
    if (blob.size >= file.size) return sinCambios;

    const optimizada = new File([blob], file.name.replace(/\.[^.]+$/, "") + ".webp", {
      type: "image/webp",
      lastModified: Date.now(),
    });

    const pct = Math.round((1 - blob.size / file.size) * 100);
    return {
      file: optimizada,
      formatoOriginal: file.type,
      ahorro: `${fmtSize(file.size)} → ${fmtSize(blob.size)} (WebP, -${pct}%)`,
    };
  } catch {
    return sinCambios;
  }
}
