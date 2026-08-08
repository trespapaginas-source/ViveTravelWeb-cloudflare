/**
 * Rutas centralizadas del sitio (mapeadas desde MIGRATION_MAP.json).
 * Una fuente única de verdad para enlaces internos.
 */
export const ROUTES = {
  home: "/",
  plans: "/planes",
  planDetail: (id: string) => `/planes/${id}`,
  cabins: "/cabanas",
  cabinDetail: (id: string) => `/cabanas/${id}`,
  transports: "/transporte",
  transportDetail: (id: string) => `/transporte/${id}`,
  visas: "/visas",
  visaDetail: (country: string) => `/visas/${country}`,
  contact: "/contacto",
  team: "/equipo",
  favorites: "/favoritos",
  policies: "/politicas",
  legalDoc: (slug: string) => `/politicas/${slug}`,
  plansByCategory: (categoria: string) => `/planes?categoria=${categoria}`,
  /** Navega al catálogo en una sección y con un destino pre-filtrado. */
  plansByDestination: (categoria: string, destino: string) =>
    `/planes?categoria=${categoria}&destino=${encodeURIComponent(destino)}`,
} as const;

/** Documentos legales referenciados en el footer (slugs del legal-docs.json). */
export const LEGAL_DOC_SLUGS = {
  terminos: "terminos",
  privacidad: "privacidad",
  datos: "datos",
  cookies: "cookies",
  reservas: "reservas",
  pqr: "pqr",
  manualViajero: "manual-viajero",
} as const;
