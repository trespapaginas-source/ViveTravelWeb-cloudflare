import { useEffect, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import {
  listPlans,
  upsertPlan,
  deletePlan,
  moveItem,
  listServiceCategories,
  listPlanRegions,
  uploadImage,
  type PlanRow,
  type ServiceCategoryRow,
  type PlanRegionRow,
} from "../lib/admin-data";
import { ReorderButtons } from "../components/ReorderButtons";
import { Button } from "@/components/ui/button";

const SERVICE_OPTIONS = [
  { id: "hotel", label: "Hotel" },
  { id: "vuelos", label: "Vuelos" },
  { id: "comidas", label: "Comidas" },
  { id: "traslados", label: "Traslados" },
];

function emptyPlan(order: number): PlanRow {
  return {
    id: crypto.randomUUID(),
    slug: "",
    name: "",
    short_description: "",
    full_description: "",
    images: [],
    price: 0,
    price_range: "",
    duration: "",
    location: "",
    experience_section: "nacionales",
    region_id: "otro",
    category: "",
    includes: [],
    excludes: [],
    highlights: [],
    rating: 5,
    review_count: 0,
    schedule: "",
    meeting: "",
    published: true,
    display_order: order,
    featured_order: null,
    servicios_incluidos: [],
  };
}

const lines = (arr: string[] | undefined) => (arr ?? []).join("\n");
const toLines = (text: string) => text.split("\n").map((l) => l.trim()).filter(Boolean);

export function PlansAdmin() {
  const [rows, setRows] = useState<PlanRow[]>([]);
  const [categories, setCategories] = useState<ServiceCategoryRow[]>([]);
  const [regions, setRegions] = useState<PlanRegionRow[]>([]);
  const [editing, setEditing] = useState<PlanRow | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const reload = () => listPlans().then(setRows);

  useEffect(() => {
    Promise.all([listPlans(), listServiceCategories(), listPlanRegions()])
      .then(([p, c, r]) => {
        setRows(p);
        setCategories(c);
        setRegions(r);
      })
      .finally(() => setLoading(false));
  }, []);

  const move = async (id: string, dir: "up" | "down") => {
    await moveItem("plans", rows, id, dir);
    reload();
  };

  const togglePublished = async (row: PlanRow) => {
    await upsertPlan({ id: row.id, published: !row.published });
    reload();
  };

  const handleDelete = async (row: PlanRow) => {
    if (!confirm(`¿Eliminar "${row.name}"? Esta acción no se puede deshacer.`)) return;
    await deletePlan(row.id);
    reload();
  };

  const openNew = () => {
    const maxOrder = rows.reduce((m, r) => Math.max(m, r.display_order), -1);
    setEditing(emptyPlan(maxOrder + 1));
    setIsNew(true);
  };

  const openEdit = (row: PlanRow) => {
    setEditing({ ...row });
    setIsNew(false);
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    const err = await upsertPlan(editing);
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
    const { url, error } = await uploadImage(file, "plans");
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
            {isNew ? "Nuevo plan" : `Editar: ${editing.name || "(sin nombre)"}`}
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

          <div className="grid grid-cols-3 gap-3">
            <Field
              label="Precio (COP)"
              type="number"
              value={String(editing.price ?? 0)}
              onChange={(v) => setEditing({ ...editing, price: Number(v) || 0 })}
            />
            <Field
              label="Rango de precio (texto)"
              value={editing.price_range ?? ""}
              onChange={(v) => setEditing({ ...editing, price_range: v })}
            />
            <Field
              label="Duración"
              value={editing.duration ?? ""}
              onChange={(v) => setEditing({ ...editing, duration: v })}
            />
          </div>

          <Field label="Ubicación" value={editing.location ?? ""} onChange={(v) => setEditing({ ...editing, location: v })} />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Categoría (pestaña)</label>
              <select
                value={editing.experience_section ?? ""}
                onChange={(e) => setEditing({ ...editing, experience_section: e.target.value })}
                className="mt-1 w-full rounded-md border border-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                {categories
                  .filter((c) => c.id !== "alojamientos")
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Región/país</label>
              <select
                value={editing.region_id ?? "otro"}
                onChange={(e) => setEditing({ ...editing, region_id: e.target.value })}
                className="mt-1 w-full rounded-md border border-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Field
            label="Etiqueta de categoría (texto libre, ej. 'Playa')"
            value={editing.category ?? ""}
            onChange={(v) => setEditing({ ...editing, category: v })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Rating (0-5)"
              type="number"
              value={String(editing.rating ?? 5)}
              onChange={(v) => setEditing({ ...editing, rating: Number(v) || 0 })}
            />
            <Field
              label="Número de reseñas"
              type="number"
              value={String(editing.review_count ?? 0)}
              onChange={(v) => setEditing({ ...editing, review_count: Number(v) || 0 })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Horario" value={editing.schedule ?? ""} onChange={(v) => setEditing({ ...editing, schedule: v })} />
            <Field
              label="Punto de encuentro"
              value={editing.meeting ?? ""}
              onChange={(v) => setEditing({ ...editing, meeting: v })}
            />
          </div>

          <Field
            label="Incluye (una línea por ítem)"
            value={lines(editing.includes)}
            onChange={(v) => setEditing({ ...editing, includes: toLines(v) })}
            textarea
          />
          <Field
            label="No incluye (una línea por ítem)"
            value={lines(editing.excludes)}
            onChange={(v) => setEditing({ ...editing, excludes: toLines(v) })}
            textarea
          />
          <Field
            label="Puntos destacados (una línea por ítem)"
            value={lines(editing.highlights)}
            onChange={(v) => setEditing({ ...editing, highlights: toLines(v) })}
            textarea
          />

          <div>
            <label className="text-xs font-medium text-muted-foreground">Servicios incluidos (íconos)</label>
            <div className="mt-1 flex flex-wrap gap-3">
              {SERVICE_OPTIONS.map((s) => {
                const checked = editing.servicios_incluidos.some((si) => si.id === s.id);
                return (
                  <label key={s.id} className="flex items-center gap-1.5 text-sm text-foreground">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...editing.servicios_incluidos, { id: s.id, label: s.label, icon: s.id }]
                          : editing.servicios_incluidos.filter((si) => si.id !== s.id);
                        setEditing({ ...editing, servicios_incluidos: next });
                      }}
                    />
                    {s.label}
                  </label>
                );
              })}
            </div>
          </div>

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

          <div className="flex items-center gap-4 border-t border-border pt-3">
            <label className="flex items-center gap-1.5 text-sm text-foreground">
              <input
                type="checkbox"
                checked={editing.published}
                onChange={(e) => setEditing({ ...editing, published: e.target.checked })}
              />
              Publicado (visible en el sitio)
            </label>
            <label className="flex items-center gap-1.5 text-sm text-foreground">
              <input
                type="checkbox"
                checked={editing.featured_order !== null}
                onChange={(e) =>
                  setEditing({ ...editing, featured_order: e.target.checked ? 0 : null })
                }
              />
              Destacado en el home
            </label>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? "Guardando…" : "Guardar plan"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Planes ({rows.length})</h1>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" /> Nuevo plan
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
              <p className="text-xs text-muted-foreground">
                {r.experience_section} · {r.location}
              </p>
            </div>
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <input type="checkbox" checked={r.published} onChange={() => togglePublished(r)} />
              Publicado
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
