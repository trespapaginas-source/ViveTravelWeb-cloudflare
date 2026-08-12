import { cn } from "@/lib/utils";

/**
 * SectionHeading — encabezado editable de un bloque del formulario, en el
 * mismo lugar donde van los campos de esa sección (no un panel aparte).
 * El texto que se escriba aquí es literalmente el título que se ve en la
 * ficha pública; los campos de abajo son los que alimentan esa sección.
 */
export function SectionHeading({
  defaultLabel,
  value,
  onChange,
  hint,
  visible,
  onVisibleChange,
  first,
}: {
  defaultLabel: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  visible?: boolean;
  onVisibleChange?: (v: boolean) => void;
  first?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3 border-t border-border pt-5",
        first && "border-t-0 pt-0"
      )}
    >
      <div className="min-w-0 flex-1">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={defaultLabel}
          className="w-full border-none bg-transparent p-0 text-lg font-bold text-foreground outline-none placeholder:text-foreground focus:ring-0"
        />
        {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      </div>
      {onVisibleChange && (
        <label className="mt-1.5 flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={visible ?? true}
            onChange={(e) => onVisibleChange(e.target.checked)}
          />
          Visible
        </label>
      )}
    </div>
  );
}
