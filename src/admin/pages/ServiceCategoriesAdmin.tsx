import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import {
  listServiceCategories,
  updateServiceCategory,
  insertServiceCategory,
  moveItem,
  type ServiceCategoryRow,
} from "../lib/admin-data";
import { ReorderButtons } from "../components/ReorderButtons";
import { Button } from "@/components/ui/button";

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Controla el orden y la visibilidad de las pestañas del buscador del hero
 * y del menú de navegación "Experiencias y viajes" — misma tabla para ambos
 * (show_in_hero / show_in_nav).
 */
export function ServiceCategoriesAdmin() {
  const [rows, setRows] = useState<ServiceCategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const [showNewForm, setShowNewForm] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newId, setNewId] = useState("");
  const [idTouched, setIdTouched] = useState(false);
  const [newSubtitle, setNewSubtitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const reload = () => listServiceCategories().then(setRows);

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, []);

  const patch = async (id: string, p: Partial<ServiceCategoryRow>) => {
    setSavingId(id);
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...p } : r)));
    await updateServiceCategory(id, p);
    setSavingId(null);
  };

  const move = async (id: string, dir: "up" | "down") => {
    await moveItem("service_categories", rows, id, dir);
    reload();
  };

  const resetNewForm = () => {
    setNewLabel("");
    setNewId("");
    setIdTouched(false);
    setNewSubtitle("");
    setCreateError(null);
    setShowNewForm(false);
  };

  const handleCreate = async () => {
    const id = newId.trim();
    const label = newLabel.trim();
    if (!id || !label) {
      setCreateError("Nombre e identificador son obligatorios.");
      return;
    }
    if (rows.some((r) => r.id === id)) {
      setCreateError(`Ya existe una categoría con el identificador "${id}".`);
      return;
    }
    setCreating(true);
    setCreateError(null);
    const err = await insertServiceCategory({
      id,
      label,
      subtitle: newSubtitle.trim() || null,
      active: true,
      show_in_hero: true,
      show_in_nav: true,
    });
    setCreating(false);
    if (err) {
      setCreateError(err);
      return;
    }
    resetNewForm();
    reload();
  };

  if (loading) return <p className="text-sm text-muted-foreground">Cargando…</p>;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Categorías del buscador</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Controla el orden y la visibilidad de las pestañas del buscador del hero (ej. "Planes
            Internacionales", "Cabañas") y del menú "Experiencias y viajes".
          </p>
        </div>
        {!showNewForm && (
          <Button size="sm" onClick={() => setShowNewForm(true)}>
            <Plus className="h-4 w-4" /> Nueva categoría
          </Button>
        )}
      </div>

      {showNewForm && (
        <div className="mt-4 space-y-3 rounded-lg border border-border bg-white p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Nombre (pestaña)</label>
              <input
                autoFocus
                value={newLabel}
                onChange={(e) => {
                  const label = e.target.value;
                  setNewLabel(label);
                  if (!idTouched) setNewId(slugify(label));
                }}
                placeholder='Ej. "Cruceros"'
                className="mt-1 w-full rounded-md border border-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Identificador (id)</label>
              <input
                value={newId}
                onChange={(e) => {
                  setIdTouched(true);
                  setNewId(slugify(e.target.value));
                }}
                placeholder="cruceros"
                className="mt-1 w-full rounded-md border border-input px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Subtítulo (menú de navegación)
            </label>
            <input
              value={newSubtitle}
              onChange={(e) => setNewSubtitle(e.target.value)}
              className="mt-1 w-full rounded-md border border-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          {createError && <p className="text-xs text-red-600">{createError}</p>}
          <div className="flex gap-2">
            <Button size="sm" onClick={handleCreate} disabled={creating}>
              {creating ? "Creando…" : "Crear categoría"}
            </Button>
            <Button size="sm" variant="ghost" onClick={resetNewForm} disabled={creating}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      <div className="mt-5 divide-y divide-border rounded-lg border border-border bg-white">
        {rows.map((r, i) => (
          <div key={r.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-3 py-3 sm:flex-nowrap sm:px-4">
            <ReorderButtons
              onUp={() => move(r.id, "up")}
              onDown={() => move(r.id, "down")}
              disabledUp={i === 0}
              disabledDown={i === rows.length - 1}
            />
            <div className="min-w-[160px] flex-1">
              <input
                value={r.label}
                onChange={(e) => patch(r.id, { label: e.target.value })}
                className="w-full rounded-md border border-transparent px-2 py-1 text-sm font-medium text-foreground hover:border-input focus:border-input focus:outline-none"
              />
              <input
                value={r.subtitle ?? ""}
                onChange={(e) => patch(r.id, { subtitle: e.target.value })}
                placeholder="Subtítulo (menú de navegación)"
                className="mt-0.5 w-full rounded-md border border-transparent px-2 py-1 text-xs text-muted-foreground hover:border-input focus:border-input focus:outline-none"
              />
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={r.show_in_hero}
                  onChange={(e) => patch(r.id, { show_in_hero: e.target.checked })}
                />
                Buscador
              </label>
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={r.show_in_nav}
                  onChange={(e) => patch(r.id, { show_in_nav: e.target.checked })}
                />
                Menú
              </label>
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={r.active}
                  onChange={(e) => patch(r.id, { active: e.target.checked })}
                />
                Activa
              </label>
              {savingId === r.id && <span className="text-xs text-muted-foreground">Guardando…</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
