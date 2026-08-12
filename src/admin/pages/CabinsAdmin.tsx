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
import { SectionHeading } from "../components/SectionTitlesEditor";
import { ImageReorderList } from "../components/ImageReorderList";
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
    section_titles: {},
    section_visibility: {},
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
    const cabin = editing;
    const setTitle = (key: string, v: string) =>
      setEditing({ ...cabin, section_titles: { ...cabin.section_titles, [key]: v } });
    const setVisible = (key: string, v: boolean) =>
      setEditing({ ...cabin, section_visibility: { ...cabin.section_visibility, [key]: v } });

    return (
      <div className="max-w-2xl">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="min-w-0 break-words text-xl font-bold text-foreground">
            {isNew ? "Nueva cabaña" : `Editar: ${cabin.name || "(sin nombre)"}`}
          </h1>
          <Button variant="ghost" onClick={() => setEditing(null)} className="shrink-0">
            Cancelar
          </Button>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Cada título en negrita es el nombre real de esa sección en la página de la cabaña —
          cámbialo aquí mismo. Los campos debajo son lo que se muestra en ella.
        </p>

        <div className="mt-4 space-y-4 rounded-lg border border-border bg-white p-4">
          <SectionHeading
            first
            defaultLabel="Acerca de esta cabaña"
            value={cabin.section_titles?.about ?? ""}
            onChange={(v) => setTitle("about", v)}
            visible={cabin.section_visibility?.about ?? true}
            onVisibleChange={(v) => setVisible("about", v)}
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Nombre" value={cabin.name} onChange={(v) => setEditing({ ...cabin, name: v })} />
            <Field label="Slug (url)" value={cabin.slug ?? ""} onChange={(v) => setEditing({ ...cabin, slug: v })} />
          </div>

          <Field
            label="Descripción corta"
            value={cabin.short_description ?? ""}
            onChange={(v) => setEditing({ ...cabin, short_description: v })}
            textarea
          />
          <Field
            label="Descripción completa (texto de esta sección)"
            value={cabin.full_description ?? ""}
            onChange={(v) => setEditing({ ...cabin, full_description: v })}
            textarea
            rows={5}
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field
              label="Precio por noche (COP)"
              type="number"
              value={String(cabin.price_per_night ?? 0)}
              onChange={(v) => setEditing({ ...cabin, price_per_night: Number(v) || 0 })}
            />
            <Field
              label="Rango de precio (texto)"
              value={cabin.price_range ?? ""}
              onChange={(v) => setEditing({ ...cabin, price_range: v })}
            />
          </div>

          <Field label="Ubicación" value={cabin.location ?? ""} onChange={(v) => setEditing({ ...cabin, location: v })} />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field
              label="Huéspedes (capacidad)"
              type="number"
              value={String(cabin.capacity ?? 0)}
              onChange={(v) => setEditing({ ...cabin, capacity: Number(v) || 0 })}
            />
            <Field
              label="Habitaciones"
              type="number"
              value={String(cabin.bedrooms ?? 0)}
              onChange={(v) => setEditing({ ...cabin, bedrooms: Number(v) || 0 })}
            />
            <Field
              label="Baños"
              type="number"
              value={String(cabin.bathrooms ?? 0)}
              onChange={(v) => setEditing({ ...cabin, bathrooms: Number(v) || 0 })}
            />
          </div>

          <Field
            label="Link ICS de Google Calendar (disponibilidad en tiempo real)"
            value={cabin.ics_url ?? ""}
            onChange={(v) => setEditing({ ...cabin, ics_url: v })}
          />
          <Field
            label="Link de Google Maps (opcional)"
            value={cabin.maps_url ?? ""}
            onChange={(v) => setEditing({ ...cabin, maps_url: v })}
          />

          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Imágenes (arrástralas para cambiar el orden en que aparecen)
            </label>
            <ImageReorderList
              images={cabin.images}
              onChange={(v) => setEditing({ ...cabin, images: v })}
            />
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

          <label className="flex items-center gap-1.5 text-sm text-foreground">
            <input
              type="checkbox"
              checked={cabin.published}
              onChange={(e) => setEditing({ ...cabin, published: e.target.checked })}
            />
            Publicada (visible en el sitio)
          </label>

          <SectionHeading
            defaultLabel="Puntos destacados"
            value={cabin.section_titles?.highlights ?? ""}
            onChange={(v) => setTitle("highlights", v)}
            visible={cabin.section_visibility?.highlights ?? true}
            onVisibleChange={(v) => setVisible("highlights", v)}
          />
          <Field
            label="Puntos destacados (una línea por ítem)"
            value={lines(cabin.highlights)}
            onChange={(v) => setEditing({ ...cabin, highlights: toLines(v) })}
            textarea
          />

          <SectionHeading
            defaultLabel="Comodidades"
            value={cabin.section_titles?.amenities ?? ""}
            onChange={(v) => setTitle("amenities", v)}
            visible={cabin.section_visibility?.amenities ?? true}
            onVisibleChange={(v) => setVisible("amenities", v)}
          />
          <Field
            label="Comodidades (una línea por ítem)"
            value={lines(cabin.amenities)}
            onChange={(v) => setEditing({ ...cabin, amenities: toLines(v) })}
            textarea
          />

          <SectionHeading
            defaultLabel="Reglas de la cabaña"
            value={cabin.section_titles?.rules ?? ""}
            onChange={(v) => setTitle("rules", v)}
            visible={cabin.section_visibility?.rules ?? true}
            onVisibleChange={(v) => setVisible("rules", v)}
          />
          <Field
            label="Reglas (una línea por ítem)"
            value={lines(cabin.rules)}
            onChange={(v) => setEditing({ ...cabin, rules: toLines(v) })}
            textarea
          />

          <SectionHeading
            defaultLabel="A dónde irás"
            hint='Usa el campo "Ubicación" de la sección "Acerca de esta cabaña" de arriba.'
            value={cabin.section_titles?.location ?? ""}
            onChange={(v) => setTitle("location", v)}
            visible={cabin.section_visibility?.location ?? true}
            onVisibleChange={(v) => setVisible("location", v)}
          />

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? "Guardando…" : "Guardar cabaña"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold text-foreground">Cabañas ({rows.length})</h1>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" /> Nueva cabaña
        </Button>
      </div>

      <div className="mt-4 divide-y divide-border rounded-lg border border-border bg-white">
        {rows.map((r, i) => (
          <div key={r.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 px-3 py-3 sm:flex-nowrap sm:px-4">
            <ReorderButtons
              onUp={() => move(r.id, "up")}
              onDown={() => move(r.id, "down")}
              disabledUp={i === 0}
              disabledDown={i === rows.length - 1}
            />
            {r.images[0] && <img src={r.images[0]} alt="" className="h-10 w-14 shrink-0 rounded object-cover" />}
            <div className="min-w-[96px] flex-1">
              <p className="truncate text-sm font-medium text-foreground">{r.name || "(sin nombre)"}</p>
              <p className="truncate text-xs text-muted-foreground">{r.location}</p>
            </div>
            <div className="flex w-full basis-full items-center justify-end gap-3 sm:w-auto sm:basis-auto sm:justify-start">
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
                className="-m-2 shrink-0 rounded-md p-2 text-muted-foreground hover:text-red-600"
                aria-label="Eliminar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
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
