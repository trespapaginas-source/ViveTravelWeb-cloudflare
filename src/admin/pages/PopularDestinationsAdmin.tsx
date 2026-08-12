import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  listPopularDestinations,
  listServiceCategories,
  addPopularDestination,
  deletePopularDestination,
  moveItem,
  type PopularDestinationRow,
  type ServiceCategoryRow,
} from "../lib/admin-data";
import { ReorderButtons } from "../components/ReorderButtons";
import { Button } from "@/components/ui/button";

/** Destinos sugeridos que aparecen al escribir en el campo "Destino" del hero, por pestaña. */
export function PopularDestinationsAdmin() {
  const [rows, setRows] = useState<PopularDestinationRow[]>([]);
  const [categories, setCategories] = useState<ServiceCategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState<Record<string, string>>({});

  const reload = () =>
    Promise.all([listPopularDestinations(), listServiceCategories()]).then(([d, c]) => {
      setRows(d);
      setCategories(c.filter((cat) => cat.id !== "grupales"));
    });

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, []);

  const move = async (id: string, dir: "up" | "down", categoryId: string) => {
    const inCategory = rows.filter((r) => r.category_id === categoryId);
    await moveItem("popular_destinations", inCategory, id, dir);
    reload();
  };

  const handleAdd = async (categoryId: string) => {
    const name = (newName[categoryId] ?? "").trim();
    if (!name) return;
    const inCategory = rows.filter((r) => r.category_id === categoryId);
    const maxOrder = inCategory.reduce((m, r) => Math.max(m, r.display_order), -1);
    await addPopularDestination(categoryId, name, maxOrder + 1);
    setNewName((prev) => ({ ...prev, [categoryId]: "" }));
    reload();
  };

  const handleDelete = async (id: string) => {
    await deletePopularDestination(id);
    reload();
  };

  if (loading) return <p className="text-sm text-muted-foreground">Cargando…</p>;

  return (
    <div>
      <h1 className="text-xl font-bold text-foreground">Destinos sugeridos</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Los destinos que aparecen sugeridos al escribir en el campo "Destino" del buscador, por
        pestaña.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {categories.map((cat) => {
          const items = rows.filter((r) => r.category_id === cat.id);
          return (
            <div key={cat.id} className="rounded-lg border border-border bg-white p-4">
              <h2 className="text-sm font-bold text-foreground">{cat.label}</h2>
              <div className="mt-2 divide-y divide-border">
                {items.map((r, i) => (
                  <div key={r.id} className="flex items-center gap-2 py-1.5">
                    <ReorderButtons
                      onUp={() => move(r.id, "up", cat.id)}
                      onDown={() => move(r.id, "down", cat.id)}
                      disabledUp={i === 0}
                      disabledDown={i === items.length - 1}
                    />
                    <span className="flex-1 text-sm text-foreground">{r.name}</span>
                    <button
                      type="button"
                      onClick={() => handleDelete(r.id)}
                      className="text-muted-foreground hover:text-red-600"
                      aria-label="Eliminar"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <input
                  value={newName[cat.id] ?? ""}
                  onChange={(e) => setNewName((prev) => ({ ...prev, [cat.id]: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd(cat.id)}
                  placeholder="Agregar destino…"
                  className="w-full rounded-md border border-input px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
                <Button size="sm" variant="outline" onClick={() => handleAdd(cat.id)}>
                  Agregar
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
