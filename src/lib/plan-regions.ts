/**
 * Mapeo de país / región para planes turísticos.
 *
 * El JSON de planes NO tiene un campo `country` explícito: el país/región está
 * embebido en `location` como texto libre (ej: "Cancún, México",
 * "Punta Cana, Rep. Dominicana", "Boyacá").
 *
 * Este módulo deriva el país/región en tiempo de ejecución buscando keywords
 * en `location` + `name`. Las regiones de Colombia se separan (Boyacá,
 * Santander, Atlántico, etc.) en lugar de agruparse como un solo "Colombia".
 *
 * El orden de `PLAN_REGIONS` importa: las reglas más específicas van primero
 * para evitar falsos positivos (ej: "Cali" debe ganar antes que un fallback
 * genérico de Colombia).
 */

export interface PlanRegion {
  id: string;
  label: string;
  /** Grupo para el dropdown: regiones de Colombia o Internacional. */
  group: "colombia" | "internacional";
  /** Keywords (lowercase) que activan esta región. */
  keywords: string[];
}

/**
 * Tabla de regiones/países detectables. Ordenada por especificidad descendente.
 * Las keywords se comparan contra `${plan.location} ${plan.name}` en lowercase.
 */
export const PLAN_REGIONS: PlanRegion[] = [
  // ── Colombia: regiones / departamentos (específicas primero) ──
  {
    id: "boyaca",
    label: "Boyacá",
    group: "colombia",
    keywords: ["boyacá", "boyaca", "villa de leyva", "tunja", "ráquira", "raquira", "monguí", "mongui", "zipaquirá"],
  },
  {
    id: "santander",
    label: "Santander",
    group: "colombia",
    keywords: ["santander", "san gil", "barichara", "bucaramanga"],
  },
  {
    id: "huila",
    label: "Huila",
    group: "colombia",
    keywords: ["huila", "tatacoa", "neiva", "desierto de la tatacoa"],
  },
  {
    id: "eje-cafetero",
    label: "Eje Cafetero",
    group: "colombia",
    keywords: ["eje cafetero", "pereira", "manizales", "armenia", "salento", "valle de cocora"],
  },
  {
    id: "san-andres",
    label: "San Andrés",
    group: "colombia",
    keywords: ["san andrés", "san andres", "islas san andrés"],
  },
  {
    id: "bolivar",
    label: "Bolívar (Cartagena)",
    group: "colombia",
    keywords: ["cartagena", "rosario", "playa blanca", "barú", "baru"],
  },
  {
    id: "magdalena",
    label: "Magdalena (Santa Marta)",
    group: "colombia",
    keywords: ["santa marta", "sierra limón", "sierra limon", "tayrona", "minca", "palomino"],
  },
  {
    id: "atlantico",
    label: "Atlántico",
    group: "colombia",
    keywords: [
      "puerto colombia",
      "juan de acosta",
      "metroparque",
      "mallorquín",
      "mallorquin",
      "sabanilla",
      "santa verónica",
      "santa veronica",
    ],
  },
  {
    id: "valle-cauca",
    label: "Valle / Cauca / Nariño",
    group: "colombia",
    keywords: ["cali", "pasto", "popayán", "popayan", "luruaco", "coveñas", "covenas"],
  },
  {
    id: "guajira",
    label: "La Guajira",
    group: "colombia",
    keywords: ["cab0 de la vela", "cabo de la vela", "riohacha", "guajira", "maicao"],
  },
  {
    id: "amazonas",
    label: "Amazonas",
    group: "colombia",
    keywords: ["amazonas", "caño cristales", "cano cristales", "leticia", "nuquí", "nuqui"],
  },

  // ── Internacional ──
  {
    id: "mexico",
    label: "México",
    group: "internacional",
    keywords: ["cancún", "cancun", "méxico", "mexico", "ciudad de méxico"],
  },
  {
    id: "rep-dominicana",
    label: "Rep. Dominicana",
    group: "internacional",
    keywords: ["punta cana", "rep. dominicana", "república dominicana", "republica dominicana", "dominicana"],
  },
  {
    id: "panama",
    label: "Panamá",
    group: "internacional",
    keywords: ["panamá", "panama", "ciudad de panamá"],
  },
  {
    id: "caribe-norte",
    label: "Caribe (Aruba/Curazao)",
    group: "internacional",
    keywords: ["aruba", "curazao", "curacao"],
  },
  {
    id: "eeuu",
    label: "Estados Unidos",
    group: "internacional",
    keywords: ["miami", "orlando", "estados unidos", "ee.uu", "nueva york", "los ángeles"],
  },
  {
    id: "brasil",
    label: "Brasil",
    group: "internacional",
    keywords: ["río de janeiro", "rio de janeiro", "brasil", "são paulo", "sao paulo"],
  },
  {
    id: "ecuador",
    label: "Ecuador",
    group: "internacional",
    keywords: ["ecuador", "tulcán", "tulcan", "quito"],
  },
  {
    id: "peru",
    label: "Perú",
    group: "internacional",
    keywords: ["perú", "peru", "lima", "cusco", "cuzco", "machu picchu"],
  },
  {
    id: "japon",
    label: "Japón",
    group: "internacional",
    keywords: ["tokio", "kioto", "osaka", "japón", "japon"],
  },
  {
    id: "europa",
    label: "Europa",
    group: "internacional",
    keywords: [
      "madrid",
      "parís",
      "roma",
      "eurotrip",
      "españa",
      "francia",
      "italia",
      "portugal",
      "grecia",
      "reino unido",
      "irlanda",
      "escandinavia",
      "londres",
    ],
  },
  {
    id: "turquia-emiratos",
    label: "Turquía y Emiratos",
    group: "internacional",
    keywords: ["estambul", "capadocia", "dubái", "dubai", "turquía", "turquia", "emiratos"],
  },
  {
    id: "asia-sudeste",
    label: "Sudeste Asiático",
    group: "internacional",
    keywords: ["sudeste asiático", "tailandia", "tailandia", "bali", "vietnam", "singapur"],
  },
  {
    id: "africa",
    label: "África",
    group: "internacional",
    keywords: ["egipto", "el cairo", "marruecos", "sudáfrica", "sudafrica", "kenia"],
  },

  // ── Fallback: Colombia genérico (planes colombianos sin región específica) ──
  {
    id: "colombia-generico",
    label: "Colombia (otras zonas)",
    group: "colombia",
    keywords: ["colombia", "aeródromo", "aerodromo"],
  },
];

/**
 * Devuelve la región/país de un plan buscando keywords en su location + name.
 * Si ninguna keyword coincide, devuelve "otro" (no clasificado).
 */
export function getPlanRegion(plan: { location?: string; name?: string }): PlanRegion & { matched: boolean } {
  const haystack = `${plan.location ?? ""} ${plan.name ?? ""}`.toLowerCase();
  for (const region of PLAN_REGIONS) {
    if (region.keywords.some((kw) => haystack.includes(kw))) {
      return { ...region, matched: true };
    }
  }
  // No clasificado: los tours/actividades sueltas sin ubicación clara.
  return { id: "otro", label: "Sin región definida", group: "internacional", keywords: [], matched: false };
}
