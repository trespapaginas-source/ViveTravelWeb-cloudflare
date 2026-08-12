import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Tarjeta colapsable con guardado propio — patrón compartido por todos los
 * editores de contenido de secciones del home (cada uno escribe una sola
 * columna de site_content vía onSave).
 */
export function SectionEditor({
  title,
  description,
  onSave,
  children,
}: {
  title: string;
  description?: string;
  onSave: () => Promise<void>;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    await onSave();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="rounded-lg border border-border bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
        </div>
        {open ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </button>
      {open && (
        <div className="space-y-4 border-t border-border px-4 py-4">
          {children}
          <div className="flex items-center gap-3 pt-1">
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? "Guardando…" : "Guardar sección"}
            </Button>
            {saved && <span className="text-xs text-green-600">Guardado ✓</span>}
          </div>
        </div>
      )}
    </div>
  );
}

export function TextField({
  label,
  value,
  onChange,
  textarea,
  rows = 2,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  rows?: number;
  placeholder?: string;
}) {
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
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="mt-1 w-full rounded-md border border-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      )}
    </div>
  );
}
