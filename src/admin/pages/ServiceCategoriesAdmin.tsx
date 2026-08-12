import { useEffect, useState } from "react";
import {
  listServiceCategories,
  updateServiceCategory,
  moveItem,
  type ServiceCategoryRow,
} from "../lib/admin-data";
import { ReorderButtons } from "../components/ReorderButtons";

/**
 * Controla el orden y la visibilidad de las pestañas del buscador del hero
 * y del menú de navegación "Experiencias y viajes" — misma tabla para ambos
 * (show_in_hero / show_in_nav).
 */
export function ServiceCategoriesAdmin() {
  const [rows, setRows] = useState<ServiceCategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

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

  if (loading) return <p className="text-sm text-muted-foreground">Cargando…</p>;

  return (
    <div>
      <h1 className="text-xl font-bold text-foreground">Categorías del buscador</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Controla el orden y la visibilidad de las pestañas del buscador del hero (ej. "Planes
        Internacionales", "Cabañas") y del menú "Experiencias y viajes".
      </p>

      <div className="mt-5 divide-y divide-border rounded-lg border border-border bg-white">
        {rows.map((r, i) => (
          <div key={r.id} className="flex items-center gap-4 px-4 py-3">
            <ReorderButtons
              onUp={() => move(r.id, "up")}
              onDown={() => move(r.id, "down")}
              disabledUp={i === 0}
              disabledDown={i === rows.length - 1}
            />
            <div className="flex-1">
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
        ))}
      </div>
    </div>
  );
}
