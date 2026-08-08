/**
 * Tipos de datos del dominio (extraídos de los JSON estáticos).
 * Equivalente a los tipos TourPlan / Cabin del proyecto de referencia.
 */

export interface ItineraryDay {
  title: string;
  description: string;
}

export interface DepartureDate {
  start: string; // "yyyy-MM-dd"
  end: string; // "yyyy-MM-dd"
}

export interface Lugar {
  name: string;
  image: string;
}

/**
 * Servicio incluido en un plan (paquete "Todo Incluido").
 * Pensado para ser dinámico y administrable desde un CMS: el CMS envía el
 * id del icono y el frontend lo resuelve a un componente Lucide.
 */
export interface PlanService {
  /** Identificador del servicio (ej: 'hotel', 'vuelos', 'comidas', 'traslados'). */
  id: string;
  /** Etiqueta visible (ej: "Hotel", "Vuelos"). */
  label: string;
  /** Identificador del icono a renderizar (resuelto vía SERVICE_ICON_MAP). */
  icon: string;
}

export interface TourPlan {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  images: string[];
  price: number;
  priceRange: string;
  duration: string;
  location: string;
  /**
   * Ubicación estructurada (planes internacionales).
   * - ubicacion_principal: País (obligatorio cuando se usa este modelo).
   * - ubicacion_secundaria: Destino/Ciudad (opcional).
   * Si ambos faltan, el renderizado cae al campo `location` legacy.
   */
  ubicacion_principal?: string;
  ubicacion_secundaria?: string;
  category: string;
  includes: string[];
  excludes: string[];
  highlights: string[];
  rating: number;
  reviewCount: number;
  /**
   * @deprecated Usar `mostrar_limite_personas` + `max_personas` (CMS-ready).
   * Mantenido solo para compatibilidad con datos legacy; se ignora en el
   * render salvo en Viajes Grupales con el flag activo.
   */
  maxGuests?: number;
  schedule: string;
  meeting: string;
  published: boolean;
  order: number;
  // Campos opcionales (planes de varios días)
  itinerary?: ItineraryDay[];
  departureDates?: DepartureDate[];
  fixedDeparture?: boolean;
  lugares?: Lugar[];
  notes?: string[];
  featuredOrder?: number;
  fecha_salida?: string;
  /**
   * Configuración opcional exclusiva para Viajes Grupales (CMS-ready).
   * - mostrar_limite_personas: si true, la tarjeta/detalle muestra el límite.
   * - max_personas: valor numérico del límite (ej: 35).
   * Si el flag es false/undefined, el indicador NO se renderiza.
   */
  mostrar_limite_personas?: boolean;
  max_personas?: number;
  // ── Campos CMS-ready (opcionales) ──
  /** Badge flotante sobre la imagen (ej: "Quedan 5 cupos", "Cupos limitados"). */
  badge_imagen?: string;
  /** Badge promocional sobre el precio (ej: "10% OFF", "2x1", "Oferta especial"). */
  badge_precio?: string;
  /** Arreglo dinámico de servicios incluidos. Si falta/vacío, no se renderiza. */
  servicios_incluidos?: PlanService[];
}

export interface RoomDetail {
  id: string;
  title: string;
  beds: string;
  image: string;
  images?: string[];
  order: number;
  active: boolean;
}

export interface Cabin {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  images: string[];
  pricePerNight: number;
  priceRange: string;
  location: string;
  capacity: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  highlights: string[];
  rules: string[];
  rating: number;
  reviewCount: number;
  coordinates: { lat: number; lng: number };
  checkIn: string;
  checkOut: string;
  cancellationPolicy: string;
  propertyType: string;
  bedroomDetails: RoomDetail[];
  published: boolean;
  order: number;
  icsUrl?: string;
  mapsUrl?: string;
}

export interface Transport {
  id: string;
  name: string;
  description: string;
  capacity: string;
  priceFrom: number;
  priceRange: string;
  image: string;
  features: string[];
  bestFor: string;
}

export interface Visa {
  slug: string;
  country: string;
  countryCode: string;
  flagEmoji: string;
  region: string;
  visaCategory: string;
  categoryId: "free" | "onarrival" | "required";
  summary: string;
  stayDuration: string;
  cost: string;
  processingTime: string;
  whereToApply: string;
  requirements: string[];
  process: string[];
  tips: string[];
  officialLink: string;
  lastUpdated: string;
  embassyInfo?: {
    address: string;
    phone?: string;
    cas?: string;
    website: string;
  };
  documents?: string[];
  specialNotes?: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  avatar: string;
  avatarBg: string;
  avatarUrl: string | null;
  location: string;
  text: string;
  rating: number;
  tripName: string;
}

export interface LegalDocClause {
  number: number;
  heading: string;
  body: string;
}

export interface LegalDoc {
  slug: string;
  number: string;
  title: string;
  shortTitle: string;
  description: string;
  category: string;
  version: string;
  issuedAt: string;
  clauses: LegalDocClause[];
}
