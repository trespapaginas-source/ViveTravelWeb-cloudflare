import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, X, GripVertical } from "lucide-react";
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
import { Field } from "../components/Field";
import { RatingIndicator } from "../components/RatingIndicator";
import { slugify } from "../lib/slugify";
import { isValidUrl } from "../lib/validation";
import { useDragReorder } from "../lib/useDragReorder";
import { useUnsavedChangesWarning } from "../lib/useUnsavedChangesWarning";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function emptyCabin(order: number): CabinRow {
  return {
    id: crypto.randomUUID(),
    slug: "",
    name: "",
    short_description: "",
    full_description: "",
    images: [],
    price_per_night: 0,
    price_min: 0,
    price_max: 0,
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
    bedroom_details: [],
  };
}

const lines = (arr: string[] | undefined) => (arr ?? []).join("\n");
const toLines = (text: string) => text.split("\n").map((l) => l.trim()).filter(Boolean);

export function CabinsAdmin() {
  const [searchParams, setSearchParams] = useSearchParams();
  const editParam = searchParams.get("edit");
  const isNew = editParam === "new";

  const [rows, setRows] = useState<CabinRow[]>([]);
  const [editing, setEditing] = useState<CabinRow | null>(null);
  const [originalEditing, setOriginalEditing] = useState<CabinRow | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingRoomIndex, setUploadingRoomIndex] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const roomFileRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const initializedForRef = useRef<string | null>(null);

  const hasUnsavedChanges =
    editing !== null && JSON.stringify(editing) !== JSON.stringify(originalEditing);
  useUnsavedChangesWarning(hasUnsavedChanges);

  // Se llama en cada render (nunca condicionalmente — Rules of Hooks) aunque
  // no haya nada en edición todavía; con `editing` null simplemente opera
  // sobre un array vacío sin efecto.
  const roomsDrag = useDragReorder(editing?.bedroom_details ?? [], (next) => {
    if (editing) setEditing({ ...editing, bedroom_details: next.map((r, i) => ({ ...r, order: i })) });
  });

  const reload = () => listCabins().then(setRows);

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, []);

  // El borrador de edición se deriva del parámetro `edit` de la URL — ver la
  // misma lógica y motivo en PlansAdmin.tsx.
  useEffect(() => {
    if (loading) return;
    if (!editParam) {
      initializedForRef.current = null;
      setEditing(null);
      setOriginalEditing(null);
      return;
    }
    if (initializedForRef.current === editParam) return;
    initializedForRef.current = editParam;

    if (editParam === "new") {
      const maxOrder = rows.reduce((m, r) => Math.max(m, r.display_order), -1);
      const fresh = emptyCabin(maxOrder + 1);
      setEditing(fresh);
      setOriginalEditing(fresh);
      setSlugTouched(false);
      return;
    }

    const found = rows.find((r) => r.id === editParam);
    if (found) {
      setEditing({ ...found });
      setOriginalEditing({ ...found });
      setSlugTouched(true);
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [editParam, loading, rows, setSearchParams]);

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

  const openNew = () => setSearchParams({ edit: "new" });

  const openEdit = (row: CabinRow) => setSearchParams({ edit: row.id });

  const closeEditing = () => setSearchParams({});

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    const err = await upsertCabin(editing);
    setSaving(false);
    if (err) {
      alert(`Error al guardar: ${err}`);
      return;
    }
    closeEditing();
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
    const hasFieldErrors =
      !isValidUrl(cabin.ics_url ?? "") || !isValidUrl(cabin.maps_url ?? "");
    const addRoom = () => {
      const rooms = cabin.bedroom_details ?? [];
      setEditing({
        ...cabin,
        bedroom_details: [
          ...rooms,
          { id: crypto.randomUUID(), title: `Habitación ${rooms.length + 1}`, beds: "", images: [], order: rooms.length, active: true },
        ],
      });
    };
    const removeRoom = (i: number) =>
      setEditing({ ...cabin, bedroom_details: (cabin.bedroom_details ?? []).filter((_, idx) => idx !== i) });
    const patchRoom = (i: number, patch: Partial<CabinRow["bedroom_details"][number]>) => {
      const next = [...(cabin.bedroom_details ?? [])];
      next[i] = { ...next[i], ...patch };
      setEditing({ ...cabin, bedroom_details: next });
    };
    const handleUploadRoomImage = async (i: number, file: File) => {
      setUploadingRoomIndex(i);
      const { url, error } = await uploadImage(file, "habitaciones");
      if (url) {
        const room = (cabin.bedroom_details ?? [])[i];
        patchRoom(i, { images: [...(room?.images ?? []), url] });
      } else if (error) {
        alert(`Error al subir imagen: ${error}`);
      }
      setUploadingRoomIndex(null);
    };

    return (
      <div className="max-w-2xl">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="min-w-0 break-words text-xl font-bold text-foreground">
            {isNew ? "Nueva cabaña" : `Editar: ${cabin.name || "(sin nombre)"}`}
          </h1>
          <Button variant="ghost" onClick={closeEditing} className="shrink-0">
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

          <RatingIndicator serviceType="cabin" serviceId={cabin.id} />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field
              label="Nombre"
              value={cabin.name}
              onChange={(v) =>
                setEditing({
                  ...cabin,
                  name: v,
                  slug: slugTouched ? cabin.slug : slugify(v),
                })
              }
            />
            <Field
              label="Slug (url)"
              value={cabin.slug ?? ""}
              onChange={(v) => {
                setSlugTouched(v.trim().length > 0);
                setEditing({ ...cabin, slug: v });
              }}
            />
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

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field
              label="Precio por noche (COP)"
              type="number"
              value={String(cabin.price_per_night ?? 0)}
              onChange={(v) => setEditing({ ...cabin, price_per_night: Number(v) || 0 })}
            />
            <Field
              label="Precio mínimo (COP)"
              type="number"
              value={String(cabin.price_min ?? 0)}
              onChange={(v) => setEditing({ ...cabin, price_min: Number(v) || 0 })}
            />
            <Field
              label="Precio máximo (COP)"
              type="number"
              value={String(cabin.price_max ?? 0)}
              onChange={(v) => setEditing({ ...cabin, price_max: Number(v) || 0 })}
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
            type="url"
            value={cabin.ics_url ?? ""}
            onChange={(v) => setEditing({ ...cabin, ics_url: v })}
          />
          <Field
            label="Link de Google Maps (opcional)"
            type="url"
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

          <div className="border-t border-border pt-4">
            <p className="text-lg font-bold text-foreground">¿Dónde vas a dormir?</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Una tarjeta por habitación — arrástralas para cambiar el orden.
            </p>
            <div className="mt-3 space-y-3">
              {(cabin.bedroom_details ?? []).map((room, i) => (
                <div
                  key={room.id}
                  {...roomsDrag.dropTargetProps(i)}
                  className={cn(
                    "rounded-lg border border-border p-3 transition-opacity",
                    roomsDrag.isDragging(i) && "opacity-40",
                    roomsDrag.isOver(i) && "ring-2 ring-teal-500"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span
                      {...roomsDrag.handleProps(i)}
                      className="flex h-8 w-8 shrink-0 cursor-grab items-center justify-center text-muted-foreground active:cursor-grabbing"
                    >
                      <GripVertical className="h-4 w-4" />
                    </span>
                    <input
                      value={room.title}
                      onChange={(e) => patchRoom(i, { title: e.target.value })}
                      placeholder="Título (ej. Habitación 01)"
                      className="min-w-0 flex-1 rounded-md border border-input px-2 py-1.5 text-sm font-medium outline-none focus:ring-2 focus:ring-ring"
                    />
                    <label className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={room.active}
                        onChange={(e) => patchRoom(i, { active: e.target.checked })}
                      />
                      Activa
                    </label>
                    <button
                      type="button"
                      onClick={() => removeRoom(i)}
                      className="-m-2 shrink-0 rounded-md p-2 text-muted-foreground hover:text-red-600"
                      aria-label="Eliminar habitación"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <input
                    value={room.beds}
                    onChange={(e) => patchRoom(i, { beds: e.target.value })}
                    placeholder="Distribución de camas (ej. 1 cama doble)"
                    className="mt-2 w-full rounded-md border border-input px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />

                  <div className="mt-3">
                    <ImageReorderList
                      images={room.images ?? []}
                      onChange={(v) => patchRoom(i, { images: v })}
                    />
                    <input
                      ref={(el) => {
                        roomFileRefs.current[i] = el;
                      }}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleUploadRoomImage(i, e.target.files[0])}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      disabled={uploadingRoomIndex === i}
                      onClick={() => roomFileRefs.current[i]?.click()}
                    >
                      {uploadingRoomIndex === i ? "Subiendo…" : "Subir foto"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button type="button" variant="outline" size="sm" className="mt-3" onClick={addRoom}>
              <Plus className="h-4 w-4" /> Agregar habitación
            </Button>
          </div>

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

          {hasFieldErrors && (
            <p className="text-xs text-red-600">
              Corrige los campos marcados en rojo antes de guardar.
            </p>
          )}
          <Button onClick={handleSave} disabled={saving || hasFieldErrors} className="w-full">
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
