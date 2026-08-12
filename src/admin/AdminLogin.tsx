import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { signInAdmin } from "./lib/use-admin-auth";

export function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const err = await signInAdmin(email, password);
    setLoading(false);
    if (err) setError(err);
    // Si el login es exitoso, useAdminAuth reacciona al cambio de sesión y
    // AdminLayout renderiza el panel — no hace falta navegar manualmente.
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl border border-border bg-white p-6 shadow-sm"
      >
        <h1 className="text-lg font-bold text-foreground">Vive Travel — Admin</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Inicia sesión para editar el contenido del sitio.
        </p>

        <div className="mt-5 space-y-3">
          <div>
            <label className="text-sm font-medium text-foreground">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {error && (
          <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <Button type="submit" disabled={loading} className="mt-5 w-full">
          {loading ? "Ingresando…" : "Ingresar"}
        </Button>
      </form>
    </div>
  );
}
