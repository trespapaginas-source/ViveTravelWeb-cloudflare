import { useEffect, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import {
  listCabins,
  upsertCabin,
  deleteCabin,
  moveItem,
  uploadImage,
  type CabinRow,
} from "../lib/admin-data";
import { ReorderButtons } from "../components/ReorderButtons";
import { Button } from "@/components/ui/button";

function emptyCabin(order: number): CabinRow {
  return {
    id: crypto.randomUUID(),
    slug: "",
    name: "",
    short_description: "",
    full_description: "",
    images: [],
    price_per_night: 0,
    price_range: "",
    location: "",
    capacity: 2,
    bedrooms: 1,
    bathrooms: 1,
    amenities: [],
    highlights: [],
    rules: [],
    published: true,
    display_order: order,
    ics_url: "",
    maps_url: "",
  };
}

const lines = (arr: string[] | undefined) => (arr ?? []).join("\n");
const toLines = (text: string) => text.split("\n").map((l) => l.trim()).filter(Boolean);

export function CabinsAdmin() {
  const [rows, setRows] = useState<CabinRow[]>([]);
  const [editing, setEditing] = useState<CabinRow | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const reload = () => listCabins().then(setRows);

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, []);

  const move = async (id: string, dir: "up" | "down") => {
    await moveItem("cabins", rows, id, dir);
    reload();
  };

  const togglePublished = async (row: CabinRow) => {
    await upsertCabin({ id: row.id, published: !row.published });
    reload();
  };

  const handleDelete = async (row: CabinRow) => {
    if (!confirm(`¿Eliminar "${row.name}"? Esta acción no se puede deshacer.`)) return;
    await deleteCabin(row.id);
    reload();
  };

  const openNew = () => {
    const maxOrder = rows.reduce((m, r) => Math.max(m, r.display_order), -1);
    setEditing(emptyCabin(maxOrder + 1));
    setIsNew(true);
  };

  const openEdit = (row: CabinRow) => {
    setEditing({ ...row });
    setIsNew(false);
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    const err = await upsertCabin(editing);
    setSaving(false);
    if (err) {
      alert(`Error al guardar: ${err}`);
      return;
    }
    setEditing(null);
    reload();
  };

  const handleUploadImage = async (file: File) => {
    if (!editing) return;
    setUploading(true);
    const { url, error } = await uploadImage(file, "cabins");
    if (url) {
      setEditing({ ...editing, images: [...editing.images, url] });
    } else if (error) {
      alert(`Error al subir imagen: ${error}`);
    }
    setUploading(false);
  };

  if (loading) return <p className="text-sm text-muted-foreground">Cargando…</p>;

  if (editing) {
    return (
      <div className="max-w-2xl">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">
            {isNew ? "Nueva cabaña" : `Editar: ${editing.name || "(sin nombre)"}`}
          </h1>
          <Button variant="ghost" onClick={() => setEditing(null)}>
            Cancelar
          </Button>
        </div>

        <div className="mt-4 space-y-4 rounded-lg border border-border bg-white p-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nombre" value={editing.name} onChange={(v) => setEditing({ ...editing, name: v })} />
            <Field label="Slug (url)" value={editing.slug ?? ""} onChange={(v) => setEditing({ ...editing, slug: v })} />
          </div>

          <Field
            label="Descripción corta"
            value={editing.short_description ?? ""}
            onChange={(v) => setEditing({ ...editing, short_description: v })}
            textarea
          />
          <Field
            label="Descripción completa"
            value={editing.full_description ?? ""}
            onChange={(v) => setEditing({ ...editing, full_description: v })}
            textarea
            rows={5}
          />

          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Precio por noche (COP)"
              type="number"
              value={String(editing.price_per_night ?? 0)}
              onChange={(v) => setEditing({ ...editing, price_per_night: Number(v) || 0 })}
            />
            <Field
              label="Rango de precio (texto)"
              value={editing.price_range ?? ""}
              onChange={(v) => setEditing({ ...editing, price_range: v })}
            />
          </div>

          <Field label="Ubicación" value={editing.location ?? ""} onChange={(v) => setEditing({ ...editing, location: v })} />

          <div className="grid grid-cols-3 gap-3">
            <Field
              label="Huéspedes (capacidad)"
              type="number"
              value={String(editing.capacity ?? 0)}
              onChange={(v) => setEditing({ ...editing, capacity: Number(v) || 0 })}
            />
            <Field
              label="Habitaciones"
              type="number"
              value={String(editing.bedrooms ?? 0)}
              onChange={(v) => setEditing({ ...editing, bedrooms: Number(v) || 0 })}
            />
            <Field
              label="Baños"
              type="number"
              value={String(editing.bathrooms ?? 0)}
              onChange={(v) => setEditing({ ...editing, bathrooms: Number(v) || 0 })}
            />
          </div>

          <Field
            label="Comodidades (una línea por ítem)"
            value={lines(editing.amenities)}
            onChange={(v) => setEditing({ ...editing, amenities: toLines(v) })}
            textarea
          />
          <Field
            label="Puntos destacados (una línea por ítem)"
            value={lines(editing.highlights)}
            onChange={(v) => setEditing({ ...editing, highlights: toLines(v) })}
            textarea
          />
          <Field
            label="Reglas (una línea por ítem)"
            value={lines(editing.rules)}
            onChange={(v) => setEditing({ ...editing, rules: toLines(v) })}
            textarea
          />

          <Field
            label="Link ICS de Google Calendar (disponibilidad en tiempo real)"
            value={editing.ics_url ?? ""}
            onChange={(v) => setEditing({ ...editing, ics_url: v })}
          />
          <Field
            label="Link de Google Maps (opcional)"
            value={editing.maps_url ?? ""}
            onChange={(v) => setEditing({ ...editing, maps_url: v })}
          />

          <div>
            <label className="text-xs font-medium text-muted-foreground">Imágenes</label>
            <div className="mt-1 flex flex-wrap gap-2">
              {editing.images.map((url, i) => (
                <div key={i} className="relative">
                  <img src={url} alt="" className="h-16 w-24 rounded object-cover" />
                  <button
                    type="button"
                    onClick={() =>
                      setEditing({ ...editing, images: editing.images.filter((_, idx) => idx !== i) })
                    }
                    className="absolute -right-1 -top-1 rounded-full bg-white p-0.5 text-red-600 shadow"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleUploadImage(e.target.files[0])}
            />
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
            >
              {uploading ? "Subiendo…" : "Subir imagen"}
            </Button>
          </div>

          <label className="flex items-center gap-1.5 border-t border-border pt-3 text-sm text-foreground">
            <input
              type="checkbox"
              checked={editing.published}
              onChange={(e) => setEditing({ ...editing, published: e.target.checked })}
            />
            Publicada (visible en el sitio)
          </label>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? "Guardando…" : "Guardar cabaña"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Cabañas ({rows.length})</h1>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" /> Nueva cabaña
        </Button>
      </div>

      <div className="mt-4 divide-y divide-border rounded-lg border border-border bg-white">
        {rows.map((r, i) => (
          <div key={r.id} className="flex items-center gap-3 px-4 py-3">
            <ReorderButtons
              onUp={() => move(r.id, "up")}
              onDown={() => move(r.id, "down")}
              disabledUp={i === 0}
              disabledDown={i === rows.length - 1}
            />
            {r.images[0] && <img src={r.images[0]} alt="" className="h-10 w-14 rounded object-cover" />}
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{r.name || "(sin nombre)"}</p>
              <p className="text-xs text-muted-foreground">{r.location}</p>
            </div>
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <input type="checkbox" checked={r.published} onChange={() => togglePublished(r)} />
              Publicada
            </label>
            <Button variant="outline" size="sm" onClick={() => openEdit(r)}>
              Editar
            </Button>
            <button
              type="button"
              onClick={() => handleDelete(r)}
              className="text-muted-foreground hover:text-red-600"
              aria-label="Eliminar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  textarea,
  rows = 2,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  rows?: number;
  type?: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className="mt-1 w-full rounded-md border border-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 w-full rounded-md border border-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      )}
    </div>
  );
}
