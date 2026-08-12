import { useEffect, useRef, useState } from "react";
import { Plus, X, ChevronLeft, ChevronRight } from "lucide-react";
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
import { SectionHeading } from "../components/SectionTitlesEditor";
import { ImageReorderList } from "../components/ImageReorderList";
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
    section_titles: {},
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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
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

  // Recibe el array ya filtrado por categoría para que subir/bajar reordene
  // solo dentro de esa categoría, no contra el listado global de planes.
  const move = async (items: PlanRow[], id: string, dir: "up" | "down") => {
    await moveItem("plans", items, id, dir);
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
    const plan = emptyPlan(maxOrder + 1);
    if (selectedCategory) plan.experience_section = selectedCategory;
    setEditing(plan);
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
    const plan = editing;
    const setTitle = (key: string, v: string) =>
      setEditing({ ...plan, section_titles: { ...plan.section_titles, [key]: v } });

    return (
      <div className="max-w-2xl">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="min-w-0 break-words text-xl font-bold text-foreground">
            {isNew ? "Nuevo plan" : `Editar: ${plan.name || "(sin nombre)"}`}
          </h1>
          <Button variant="ghost" onClick={() => setEditing(null)} className="shrink-0">
            Cancelar
          </Button>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Cada título en negrita es el nombre real de esa sección en la página del plan —
          cámbialo aquí mismo. Los campos debajo son lo que se muestra en ella.
        </p>

        <div className="mt-4 space-y-4 rounded-lg border border-border bg-white p-4">
          <SectionHeading
            first
            defaultLabel="Acerca de este plan"
            value={plan.section_titles?.about ?? ""}
            onChange={(v) => setTitle("about", v)}
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Nombre" value={plan.name} onChange={(v) => setEditing({ ...plan, name: v })} />
            <Field label="Slug (url)" value={plan.slug ?? ""} onChange={(v) => setEditing({ ...plan, slug: v })} />
          </div>

          <Field
            label="Descripción corta"
            value={plan.short_description ?? ""}
            onChange={(v) => setEditing({ ...plan, short_description: v })}
            textarea
          />
          <Field
            label="Descripción completa (texto de esta sección)"
            value={plan.full_description ?? ""}
            onChange={(v) => setEditing({ ...plan, full_description: v })}
            textarea
            rows={5}
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field
              label="Precio (COP)"
              type="number"
              value={String(plan.price ?? 0)}
              onChange={(v) => setEditing({ ...plan, price: Number(v) || 0 })}
            />
            <Field
              label="Rango de precio (texto)"
              value={plan.price_range ?? ""}
              onChange={(v) => setEditing({ ...plan, price_range: v })}
            />
            <Field
              label="Duración"
              value={plan.duration ?? ""}
              onChange={(v) => setEditing({ ...plan, duration: v })}
            />
          </div>

          <Field label="Ubicación" value={plan.location ?? ""} onChange={(v) => setEditing({ ...plan, location: v })} />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Categoría (pestaña)</label>
              <select
                value={plan.experience_section ?? ""}
                onChange={(e) => setEditing({ ...plan, experience_section: e.target.value })}
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
                value={plan.region_id ?? "otro"}
                onChange={(e) => setEditing({ ...plan, region_id: e.target.value })}
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
            value={plan.category ?? ""}
            onChange={(v) => setEditing({ ...plan, category: v })}
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field
              label="Rating (0-5)"
              type="number"
              value={String(plan.rating ?? 5)}
              onChange={(v) => setEditing({ ...plan, rating: Number(v) || 0 })}
            />
            <Field
              label="Número de reseñas"
              type="number"
              value={String(plan.review_count ?? 0)}
              onChange={(v) => setEditing({ ...plan, review_count: Number(v) || 0 })}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Servicios incluidos (íconos)</label>
            <div className="mt-1 flex flex-wrap gap-3">
              {SERVICE_OPTIONS.map((s) => {
                const checked = plan.servicios_incluidos.some((si) => si.id === s.id);
                return (
                  <label key={s.id} className="flex items-center gap-1.5 text-sm text-foreground">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...plan.servicios_incluidos, { id: s.id, label: s.label, icon: s.id }]
                          : plan.servicios_incluidos.filter((si) => si.id !== s.id);
                        setEditing({ ...plan, servicios_incluidos: next });
                      }}
                    />
                    {s.label}
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Imágenes (arrástralas para cambiar el orden en que aparecen)
            </label>
            <ImageReorderList
              images={plan.images}
              onChange={(v) => setEditing({ ...plan, images: v })}
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

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 text-sm text-foreground">
              <input
                type="checkbox"
                checked={plan.published}
                onChange={(e) => setEditing({ ...plan, published: e.target.checked })}
              />
              Publicado (visible en el sitio)
            </label>
            <label className="flex items-center gap-1.5 text-sm text-foreground">
              <input
                type="checkbox"
                checked={plan.featured_order !== null}
                onChange={(e) =>
                  setEditing({ ...plan, featured_order: e.target.checked ? 0 : null })
                }
              />
              Destacado en el home
            </label>
          </div>

          <SectionHeading
            defaultLabel="Lugares a conocer"
            hint="Solo aparece si el plan tiene lugares cargados (se administran en Supabase, todavía no hay campo aquí)."
            value={plan.section_titles?.places ?? ""}
            onChange={(v) => setTitle("places", v)}
          />

          <SectionHeading
            defaultLabel="Qué incluye este plan"
            value={plan.section_titles?.includes ?? ""}
            onChange={(v) => setTitle("includes", v)}
          />
          <Field
            label="Incluye (una línea por ítem)"
            value={lines(plan.includes)}
            onChange={(v) => setEditing({ ...plan, includes: toLines(v) })}
            textarea
          />
          <Field
            label="No incluye (una línea por ítem)"
            value={lines(plan.excludes)}
            onChange={(v) => setEditing({ ...plan, excludes: toLines(v) })}
            textarea
          />

          <SectionHeading
            defaultLabel="Actividades incluidas"
            value={plan.section_titles?.highlights ?? ""}
            onChange={(v) => setTitle("highlights", v)}
          />
          <Field
            label="Puntos destacados (una línea por ítem)"
            value={lines(plan.highlights)}
            onChange={(v) => setEditing({ ...plan, highlights: toLines(v) })}
            textarea
          />

          <SectionHeading
            defaultLabel="Itinerario día a día"
            hint="Solo aparece si el plan tiene itinerario cargado (se administra en Supabase, todavía no hay campo aquí)."
            value={plan.section_titles?.itinerary ?? ""}
            onChange={(v) => setTitle("itinerary", v)}
          />

          <SectionHeading
            defaultLabel="Información importante"
            hint="Horario, punto de encuentro y notas."
            value={plan.section_titles?.info ?? ""}
            onChange={(v) => setTitle("info", v)}
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Horario" value={plan.schedule ?? ""} onChange={(v) => setEditing({ ...plan, schedule: v })} />
            <Field
              label="Punto de encuentro"
              value={plan.meeting ?? ""}
              onChange={(v) => setEditing({ ...plan, meeting: v })}
            />
          </div>

          <SectionHeading
            defaultLabel="Reseñas de viajeros"
            hint="Reseñas reales de quienes ya viajaron — no se editan aquí."
            value={plan.section_titles?.reviews ?? ""}
            onChange={(v) => setTitle("reviews", v)}
          />

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? "Guardando…" : "Guardar plan"}
          </Button>
        </div>
      </div>
    );
  }

  // Vista 1: elegir categoría (evita mostrar los ~27 planes de golpe).
  if (!selectedCategory) {
    const pickerCategories = categories.filter((c) => c.id !== "alojamientos");
    return (
      <div>
        <h1 className="text-xl font-bold text-foreground">Planes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Elige una categoría para ver, reordenar o crear planes dentro de ella.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pickerCategories.map((c) => {
            const count = rows.filter((r) => r.experience_section === c.id).length;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCategory(c.id)}
                className="flex items-center justify-between rounded-lg border border-border bg-white px-4 py-4 text-left transition hover:border-foreground/30 hover:shadow-sm"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">{c.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {count} {count === 1 ? "plan" : "planes"}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Vista 2: listado de planes de la categoría elegida.
  const categoryLabel =
    categories.find((c) => c.id === selectedCategory)?.label ?? selectedCategory;
  const categoryRows = rows.filter((r) => r.experience_section === selectedCategory);

  return (
    <div>
      <button
        type="button"
        onClick={() => setSelectedCategory(null)}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Categorías
      </button>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold text-foreground">
          {categoryLabel} ({categoryRows.length})
        </h1>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" /> Nuevo plan
        </Button>
      </div>

      {categoryRows.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Todavía no hay planes en esta categoría.
        </p>
      ) : (
        <div className="mt-4 divide-y divide-border rounded-lg border border-border bg-white">
          {categoryRows.map((r, i) => (
            <div key={r.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 px-3 py-3 sm:flex-nowrap sm:px-4">
              <ReorderButtons
                onUp={() => move(categoryRows, r.id, "up")}
                onDown={() => move(categoryRows, r.id, "down")}
                disabledUp={i === 0}
                disabledDown={i === categoryRows.length - 1}
              />
              {r.images[0] && <img src={r.images[0]} alt="" className="h-10 w-14 shrink-0 rounded object-cover" />}
              <div className="min-w-[96px] flex-1">
                <p className="truncate text-sm font-medium text-foreground">{r.name || "(sin nombre)"}</p>
                <p className="truncate text-xs text-muted-foreground">{r.location}</p>
              </div>
              <div className="flex w-full basis-full items-center justify-end gap-3 sm:w-auto sm:basis-auto sm:justify-start">
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
                  className="-m-2 shrink-0 rounded-md p-2 text-muted-foreground hover:text-red-600"
                  aria-label="Eliminar"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
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
