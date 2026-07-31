import { BrowserRouter, Routes, Route } from "react-router-dom";

/**
 * App — FASE 0 (auditoría).
 *
 * La estructura de carpetas y el router están preparados, pero las páginas
 * aún son placeholders. La interfaz real se construirá en FASE 1.
 *
 * Mapa de rutas (extraído de la auditoría del proyecto de referencia):
 *  /                         → Home
 *  /planes                   → Listado de experiencias (con ?categoria=)
 *  /planes/:id               → Detalle de plan / experiencia
 *  /cabanas                  → Listado de cabañas
 *  /cabanas/:id              → Detalle de cabaña (con disponibilidad)
 *  /transporte               → Índice de transporte
 *  /transporte/:id           → Detalle de vehículo
 *  /visas                    → Índice de visas
 *  /visas/:country           → Detalle de visa por país
 *  /contacto                 → Contacto / cotización
 *  /equipo                   → Equipo
 *  /favoritos                → Favoritos (localStorage)
 *  /politicas                → Índice de documentos legales
 *  /politicas/:doc           → Documento legal
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PlaceholderHome />} />
        <Route path="/planes" element={<Placeholder title="Experiencias y viajes" />} />
        <Route path="/planes/:id" element={<Placeholder title="Detalle de experiencia" />} />
        <Route path="/cabanas" element={<Placeholder title="Cabañas" />} />
        <Route path="/cabanas/:id" element={<Placeholder title="Detalle de cabaña" />} />
        <Route path="/transporte" element={<Placeholder title="Transporte" />} />
        <Route path="/transporte/:id" element={<Placeholder title="Detalle de transporte" />} />
        <Route path="/visas" element={<Placeholder title="Visas y requisitos" />} />
        <Route path="/visas/:country" element={<Placeholder title="Detalle de visa" />} />
        <Route path="/contacto" element={<Placeholder title="Contacto" />} />
        <Route path="/equipo" element={<Placeholder title="Nuestro equipo" />} />
        <Route path="/favoritos" element={<Placeholder title="Tu colección" />} />
        <Route path="/politicas" element={<Placeholder title="Documentos legales" />} />
        <Route path="/politicas/:doc" element={<Placeholder title="Documento legal" />} />
        <Route path="*" element={<Placeholder title="404 · Página no encontrada" />} />
      </Routes>
    </BrowserRouter>
  );
}

function PlaceholderHome() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center">
      <span className="inline-block rounded-full bg-ocean/10 px-4 py-1 text-sm font-medium text-ocean-dark">
        FASE 0 · Auditoría completa
      </span>
      <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
        Vive Travel <span className="text-ocean">Colombia</span>
      </h1>
      <p className="max-w-xl text-slate-600">
        Entorno base listo (Vite + React + Tailwind). El mapa de migración y los
        datos extraídos están disponibles. La interfaz se construirá en la FASE 1.
      </p>
      <p className="text-xs text-slate-400">
        Consulta <code className="font-mono">MIGRATION_MAP.json</code> y{" "}
        <code className="font-mono">src/data/planes.json</code>.
      </p>
    </main>
  );
}

function Placeholder({ title }: { title: string }) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-2 p-8 text-center">
      <span className="inline-block rounded-full bg-slate-100 px-4 py-1 text-sm font-medium text-slate-600">
        Placeholder
      </span>
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      <p className="text-sm text-slate-400">Se implementará en la FASE 1.</p>
    </main>
  );
}
