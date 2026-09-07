import { useEffect, useState } from "react";
import {
  listPlanRegions,
  insertPlanRegion,
  updatePlanRegion,
  moveItem,
  type PlanRegionRow,
} from "../lib/admin-data";
import { ReorderButtons } from "../components/ReorderButtons";
import { Button } from "@/components/ui/button";

const GRUPOS: { id: "colombia" | "internacional"; label: string }[] = [
  { id: "colombia", label: "Colombia" },
  { id: "internacional", label: "Internacional" },
];

/**
 * Regiones/países del filtro "PAÍS / REGIÓN" de la página de planes.
 * Se crean, renombran, ocultan y reordenan — las usa también el selector
 * del editor de planes (con "+ Crear nueva región/país…" desde ahí mismo).
 */
export function PlanRegionsAdmin() {
  const [rows, setRows] = useState<PlanRegionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [nueva, setNueva] = useState<Record<string, string>>({});
  const [editando, setEditando] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = () =>
    listPlanRegions().then(setRows).catch((e) => setError(e.message));

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, []);

  const move = async (id: string, dir: "up" | "down", grupo: string) => {
    const enGrupo = rows.filter((r) => r.group === grupo);
    await moveItem("plan_regions", enGrupo, id, dir);
    reload();
  };

  const agregar = async (grupo: string) => {
    const label = (nueva[grupo] ?? "").trim();
    if (!label) return;
    setError(null);
    const { error: err } = await insertPlanRegion(label, grupo as "colombia" | "internacional");
    if (err) {
      setError(err);
      return;
    }
    setNueva((prev) => ({ ...prev, [grupo]: "" }));
    reload();
  };

  const guardarNombre = async (row: PlanRegionRow, nombre: string) => {
    const label = nombre.trim();
    setEditando(null);
    if (!label || label === row.label) return;
    const err = await updatePlanRegion(row.id, { label });
    if (err) setError(err);
    reload();
  };

  const toggleActiva = async (row: PlanRegionRow) => {
    const err = await updatePlanRegion(row.id, { active: !row.active });
    if (err) setError(err);
    reload();
  };

  if (loading) return <p className="text-sm text-muted-foreground">Cargando…</p>;

  return (
    <div>
      <h1 className="text-xl font-bold text-foreground">Regiones y países</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Las opciones del filtro «País / Región» de la página de planes. También puedes crearlas
        al vuelo desde el editor de cada plan.
      </p>
      {error && (
        <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {GRUPOS.map((g) => {
          const items = rows.filter((r) => r.group === g.id);
          return (
            <div key={g.id} className="rounded-lg border border-border bg-white p-4">
              <h2 className="text-sm font-bold text-foreground">{g.label}</h2>
              <div className="mt-2 divide-y divide-border">
                {items.map((r, i) => (
                  <div key={r.id} className="flex items-center gap-2 py-1.5">
                    <ReorderButtons
                      onUp={() => move(r.id, "up", g.id)}
                      onDown={() => move(r.id, "down", g.id)}
                      disabledUp={i === 0}
                      disabledDown={i === items.length - 1}
                    />
                    {editando === r.id ? (
                      <input
                        autoFocus
                        defaultValue={r.label}
                        onBlur={(e) => guardarNombre(r, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                          if (e.key === "Escape") setEditando(null);
                        }}
                        className="min-w-0 flex-1 rounded-md border border-input px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-ring"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => setEditando(r.id)}
                        title="Renombrar"
                        className={`min-w-0 flex-1 truncate text-left text-sm hover:underline ${
                          r.active ? "text-foreground" : "text-muted-foreground line-through"
                        }`}
                      >
                        {r.label}
                      </button>
                    )}
                    <label className="flex items-center gap-1 text-xs text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={r.active}
                        onChange={() => toggleActiva(r)}
                      />
                      Visible
                    </label>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  value={nueva[g.id] ?? ""}
                  onChange={(e) => setNueva((prev) => ({ ...prev, [g.id]: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && agregar(g.id)}
                  placeholder={`Nueva región en ${g.label}…`}
                  className="min-w-0 flex-1 rounded-md border border-input px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
                <Button variant="outline" size="sm" onClick={() => agregar(g.id)}>
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
