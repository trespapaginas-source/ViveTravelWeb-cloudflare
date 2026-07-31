# Vive Travel Web — CloudFlare

Web pública de **Vive Travel** (agencia de viajes, Caribe colombiano) migrada desde
Next.js a **Vite + React + Tailwind CSS**.

> **Estado: FASE 0 — Auditoría y registro de arquitectura.**
> La estructura de carpetas y el router están listos, pero la interfaz aún no se ha
> construido. Ver `MIGRATION_MAP.json` para el detalle del plan de migración.

## Stack

- **Vite 5** + **React 18** + **TypeScript**
- **Tailwind CSS 3**
- **react-router-dom 6** (rutas con App Router → BrowserRouter)

## Estructura

```
src/
├── components/   # Layout, home, planes, cabañas, transporte, visas, shared, ui
├── pages/        # Una página por ruta del App Router original
├── data/         # Datos estáticos extraídos (planes.json creado en FASE 0)
├── routes/       # Configuración de rutas / guards / code-splitting (FASE 1)
├── App.tsx       # Router con todas las rutas (placeholders)
├── main.tsx
└── index.css     # Tailwind + fuente Inter
```

## Scripts

```bash
npm install      # instalar dependencias
npm run dev      # servidor de desarrollo (http://localhost:5173)
npm run build    # build de producción
npm run preview  # previsualizar el build
```

## Origen

Migración del proyecto de referencia (Next.js App Router) ubicado en
`D:/Proyectos/ViveTravel`. El mapa completo de rutas, componentes, pestañas,
modales y servicios está documentado en `MIGRATION_MAP.json`.
