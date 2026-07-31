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
  category: string;
  includes: string[];
  excludes: string[];
  highlights: string[];
  rating: number;
  reviewCount: number;
  maxGuests: number;
  difficulty: string;
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
