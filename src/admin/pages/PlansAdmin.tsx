import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, X, ChevronLeft, ChevronRight, GripVertical } from "lucide-react";
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
import { Field } from "../components/Field";
import { RatingIndicator } from "../components/RatingIndicator";
import { slugify } from "../lib/slugify";
import { useDragReorder } from "../lib/useDragReorder";
import { useUnsavedChangesWarning } from "../lib/useUnsavedChangesWarning";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
    duration: "",
    location: "",
    experience_section: "nacionales",
    region_id: "otro",
    category: "",
    includes: [],
    excludes: [],
    highlights: [],
    important_info: "",
    published: true,
    display_order: order,
    featured_order: null,
    servicios_incluidos: [],
    section_titles: {},
    lugares: [],
    fixed_departure: false,
    departure_dates: [],
  };
}

const lines = (arr: string[] | undefined) => (arr ?? []).join("\n");
const toLines = (text: string) => text.split("\n").map((l) => l.trim()).filter(Boolean);

export function PlansAdmin() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get("categoria");
  const editParam = searchParams.get("edit");
  const isNew = editParam === "new";

  const [rows, setRows] = useState<PlanRow[]>([]);
  const [categories, setCategories] = useState<ServiceCategoryRow[]>([]);
  const [regions, setRegions] = useState<PlanRegionRow[]>([]);
  const [editing, setEditing] = useState<PlanRow | null>(null);
  const [originalEditing, setOriginalEditing] = useState<PlanRow | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingLugarIndex, setUploadingLugarIndex] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const lugarFileRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const initializedForRef = useRef<string | null>(null);

  const hasUnsavedChanges =
    editing !== null && JSON.stringify(editing) !== JSON.stringify(originalEditing);
  useUnsavedChangesWarning(hasUnsavedChanges);

  // Se llama en cada render (nunca condicionalmente — Rules of Hooks) aunque
  // no haya nada en edición todavía; con `editing` null simplemente opera
  // sobre un array vacío sin efecto.
  const lugaresDrag = useDragReorder(editing?.lugares ?? [], (next) => {
    if (editing) setEditing({ ...editing, lugares: next });
  });

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

  // El borrador de edición se deriva del parámetro `edit` de la URL — así
  // recargar la página, compartir el link o que el navegador restaure la
  // pestaña en frío reabre exactamente el mismo formulario. Un ref evita que
  // un `rows` refrescado en segundo plano pise un borrador ya en curso.
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
      const plan = emptyPlan(maxOrder + 1);
      if (selectedCategory) plan.experience_section = selectedCategory;
      setEditing(plan);
      setOriginalEditing(plan);
      setSlugTouched(false);
      return;
    }

    const found = rows.find((r) => r.id === editParam);
    if (found) {
      setEditing({ ...found });
      setOriginalEditing({ ...found });
      // Ya tiene un slug deliberado — no lo pisamos solo porque cambie el nombre.
      setSlugTouched(true);
    } else {
      // Link roto o el plan ya no existe — vuelve al listado de la categoría.
      setSearchParams(selectedCategory ? { categoria: selectedCategory } : {}, { replace: true });
    }
  }, [editParam, loading, rows, selectedCategory, setSearchParams]);

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
    setSearchParams(selectedCategory ? { categoria: selectedCategory, edit: "new" } : { edit: "new" });
  };

  const openEdit = (row: PlanRow) => {
    setSearchParams(selectedCategory ? { categoria: selectedCategory, edit: row.id } : { edit: row.id });
  };

  const closeEditing = () => {
    setSearchParams(selectedCategory ? { categoria: selectedCategory } : {});
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
    closeEditing();
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

    const addLugar = () =>
      setEditing({ ...plan, lugares: [...(plan.lugares ?? []), { name: "", image: "" }] });
    const removeLugar = (i: number) =>
      setEditing({ ...plan, lugares: (plan.lugares ?? []).filter((_, idx) => idx !== i) });
    const patchLugar = (i: number, patch: Partial<{ name: string; image: string }>) => {
      const next = [...(plan.lugares ?? [])];
      next[i] = { ...next[i], ...patch };
      setEditing({ ...plan, lugares: next });
    };
    const handleUploadLugarImage = async (i: number, file: File) => {
      setUploadingLugarIndex(i);
      const { url, error } = await uploadImage(file, "lugares");
      if (url) patchLugar(i, { image: url });
      else if (error) alert(`Error al subir imagen: ${error}`);
      setUploadingLugarIndex(null);
    };

    const addDepartureDate = () =>
      setEditing({ ...plan, departure_dates: [...(plan.departure_dates ?? []), { start: "", end: "" }] });
    const removeDepartureDate = (i: number) =>
      setEditing({ ...plan, departure_dates: (plan.departure_dates ?? []).filter((_, idx) => idx !== i) });
    const patchDepartureDate = (i: number, patch: Partial<{ start: string; end: string }>) => {
      const next = [...(plan.departure_dates ?? [])];
      next[i] = { ...next[i], ...patch };
      setEditing({ ...plan, departure_dates: next });
    };

    return (
      <div className="max-w-2xl">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="min-w-0 break-words text-xl font-bold text-foreground">
            {isNew ? "Nuevo plan" : `Editar: ${plan.name || "(sin nombre)"}`}
          </h1>
          <Button variant="ghost" onClick={closeEditing} className="shrink-0">
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

          <RatingIndicator serviceType="plan" serviceId={plan.id} />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field
              label="Nombre"
              value={plan.name}
              onChange={(v) =>
                setEditing({
                  ...plan,
                  name: v,
                  slug: slugTouched ? plan.slug : slugify(v),
                })
              }
            />
            <Field
              label="Slug (url)"
              value={plan.slug ?? ""}
              onChange={(v) => {
                setSlugTouched(v.trim().length > 0);
                setEditing({ ...plan, slug: v });
              }}
            />
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

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field
              label="Precio desde (COP)"
              type="number"
              value={String(plan.price ?? 0)}
              onChange={(v) => setEditing({ ...plan, price: Number(v) || 0 })}
            />
            <Field
              label="Duración"
              value={plan.duration ?? ""}
              onChange={(v) => setEditing({ ...plan, duration: v })}
            />
          </div>

          <div className="space-y-3 rounded-lg border border-border p-3">
            <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <input
                type="checkbox"
                checked={plan.fixed_departure ?? false}
                onChange={(e) => setEditing({ ...plan, fixed_departure: e.target.checked })}
              />
              ¿Tiene salida programada?
            </label>
            {plan.fixed_departure && (
              <div className="space-y-2">
                {(plan.departure_dates ?? []).map((d, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="date"
                      value={d.start}
                      onChange={(e) => patchDepartureDate(i, { start: e.target.value })}
                      className="min-w-0 flex-1 rounded-md border border-input px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                    <span className="shrink-0 text-xs text-muted-foreground">al</span>
                    <input
                      type="date"
                      value={d.end}
                      onChange={(e) => patchDepartureDate(i, { end: e.target.value })}
                      className="min-w-0 flex-1 rounded-md border border-input px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                    <button
                      type="button"
                      onClick={() => removeDepartureDate(i)}
                      className="-m-2 shrink-0 rounded-md p-2 text-muted-foreground hover:text-red-600"
                      aria-label="Eliminar fecha"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addDepartureDate}>
                  <Plus className="h-4 w-4" /> Agregar fecha
                </Button>
              </div>
            )}
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
            hint="Arrástralos para cambiar el orden en que aparecen en el carrusel."
            value={plan.section_titles?.places ?? ""}
            onChange={(v) => setTitle("places", v)}
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {(plan.lugares ?? []).map((lugar, i) => (
              <div
                key={i}
                {...lugaresDrag.dropTargetProps(i)}
                className={cn(
                  "relative overflow-hidden rounded-lg border border-border bg-white transition-opacity",
                  lugaresDrag.isDragging(i) && "opacity-40",
                  lugaresDrag.isOver(i) && "ring-2 ring-teal-500"
                )}
              >
                {lugar.image ? (
                  <img src={lugar.image} alt="" className="aspect-video w-full object-cover" />
                ) : (
                  <div className="flex aspect-video w-full items-center justify-center bg-neutral-100 text-xs text-muted-foreground">
                    Sin imagen
                  </div>
                )}
                <span
                  {...lugaresDrag.handleProps(i)}
                  className="absolute left-1.5 top-1.5 flex h-7 w-7 cursor-grab items-center justify-center rounded-md bg-black/50 text-white active:cursor-grabbing"
                >
                  <GripVertical className="h-4 w-4" />
                </span>
                <button
                  type="button"
                  onClick={() => removeLugar(i)}
                  className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-md bg-black/50 text-white hover:bg-red-600"
                  aria-label="Eliminar lugar"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="space-y-1.5 p-2">
                  <input
                    value={lugar.name}
                    onChange={(e) => patchLugar(i, { name: e.target.value })}
                    placeholder="Nombre (ej. Villa de Leyva)"
                    className="w-full rounded-md border border-input px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-ring"
                  />
                  <input
                    ref={(el) => {
                      lugarFileRefs.current[i] = el;
                    }}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleUploadLugarImage(i, e.target.files[0])}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    disabled={uploadingLugarIndex === i}
                    onClick={() => lugarFileRefs.current[i]?.click()}
                  >
                    {uploadingLugarIndex === i ? "Subiendo…" : lugar.image ? "Cambiar foto" : "Subir foto"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addLugar}>
            <Plus className="h-4 w-4" /> Agregar lugar
          </Button>

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
            hint="Horario, punto de encuentro y cualquier otra nota, todo en un solo texto."
            value={plan.section_titles?.info ?? ""}
            onChange={(v) => setTitle("info", v)}
          />
          <Field
            label="Información importante"
            value={plan.important_info ?? ""}
            onChange={(v) => setEditing({ ...plan, important_info: v })}
            textarea
            rows={4}
          />

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
                onClick={() => setSearchParams({ categoria: c.id })}
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
        onClick={() => setSearchParams({})}
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
