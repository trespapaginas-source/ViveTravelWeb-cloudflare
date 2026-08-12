import { cn } from "@/lib/utils";
import { isValidUrl, URL_ERROR_MESSAGE, NUMBER_HELPER_TEXT } from "../lib/validation";

/**
 * Campo de formulario compartido por CabinsAdmin/PlansAdmin. `type="url"`
 * valida el formato en línea; `type="number"` fuerza entrada numérica y
 * muestra un helper text fijo. El error, si existe, se puede leer con
 * `getFieldError` para bloquear el guardado desde el formulario padre.
 */
export function Field({
  label,
  value,
  onChange,
  textarea,
  rows = 2,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  rows?: number;
  type?: "text" | "number" | "url";
  placeholder?: string;
}) {
  const error = type === "url" && !isValidUrl(value) ? URL_ERROR_MESSAGE : null;

  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          className="mt-1 w-full rounded-md border border-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      ) : (
        <input
          type={type === "url" ? "text" : type}
          inputMode={type === "number" ? "numeric" : undefined}
          min={type === "number" ? 0 : undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "mt-1 w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring",
            error ? "border-red-400 focus:ring-red-300" : "border-input"
          )}
        />
      )}
      {type === "number" && <p className="mt-1 text-[11px] text-muted-foreground">{NUMBER_HELPER_TEXT}</p>}
      {error && <p className="mt-1 text-[11px] text-red-600">{error}</p>}
    </div>
  );
}

/** Usado por el formulario padre para saber si debe bloquear "Guardar". */
export function getFieldError(type: "text" | "number" | "url" | undefined, value: string): boolean {
  if (type === "url") return !isValidUrl(value);
  return false;
}
