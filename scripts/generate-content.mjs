// Genera src/data/*.json a partir de Supabase (fuente de verdad del CMS).
//
// Se ejecuta automáticamente antes del build (npm run prebuild) en Cloudflare
// Pages, usando SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY como variables de
// entorno de build (nunca expuestas al cliente). Si no están presentes (ej.
// build local sin credenciales), el script no hace nada y deja los JSON
// committeados tal cual — nunca debe romper un build sin credenciales.
//
// Produce la MISMA forma exacta que los JSON hand-authored originales, así
// que data-access.ts y todos los hooks/componentes que ya funcionan no
// necesitan ningún cambio.

import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.log(
    "[generate-content] SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY no configuradas — se usan los JSON ya committeados en src/data/."
  );
  process.exit(0);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const DATA_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../src/data"
);

function writeJson(filename, data) {
  writeFileSync(
    path.join(DATA_DIR, filename),
    JSON.stringify(data, null, 2) + "\n",
    "utf-8"
  );
  console.log(`[generate-content] ${filename} (${Array.isArray(data) ? data.length : 1} registro(s))`);
}

async function fetchAll(table, orderCol = "display_order") {
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .order(orderCol, { ascending: true });
  if (error) throw new Error(`[${table}] ${error.message}`);
  return data ?? [];
}

function mapPlan(r) {
  return {
    id: r.id,
    slug: r.slug ?? undefined,
    name: r.name,
    shortDescription: r.short_description ?? "",
    fullDescription: r.full_description ?? "",
    images: r.images ?? [],
    price: r.price === null ? 0 : Number(r.price),
    priceRange: r.price_range ?? "",
    duration: r.duration ?? "",
    location: r.location ?? "",
    ubicacion_principal: r.ubicacion_principal ?? undefined,
    ubicacion_secundaria: r.ubicacion_secundaria ?? undefined,
    experienceSection: r.experience_section,
    regionId: r.region_id,
    category: r.category ?? "",
    includes: r.includes ?? [],
    excludes: r.excludes ?? [],
    highlights: r.highlights ?? [],
    rating: r.rating === null ? 5 : Number(r.rating),
    reviewCount: r.review_count ?? 0,
    schedule: r.schedule ?? "",
    meeting: r.meeting ?? "",
    published: r.published,
    order: r.display_order ?? 0,
    itinerary: r.itinerary?.length ? r.itinerary : undefined,
    departureDates: r.departure_dates?.length ? r.departure_dates : undefined,
    fixedDeparture: r.fixed_departure || undefined,
    lugares: r.lugares?.length ? r.lugares : undefined,
    notes: r.notes?.length ? r.notes : undefined,
    featuredOrder: r.featured_order === null ? undefined : r.featured_order,
    fecha_salida: r.fecha_salida ?? undefined,
    mostrar_limite_personas: r.mostrar_limite_personas || undefined,
    max_personas: r.max_personas === null ? undefined : r.max_personas,
    badge_imagen: r.badge_imagen ?? undefined,
    badge_precio: r.badge_precio ?? undefined,
    servicios_incluidos: r.servicios_incluidos?.length ? r.servicios_incluidos : undefined,
  };
}

function mapCabin(r) {
  return {
    id: r.id,
    slug: r.slug ?? undefined,
    name: r.name,
    shortDescription: r.short_description ?? "",
    fullDescription: r.full_description ?? "",
    images: r.images ?? [],
    pricePerNight: r.price_per_night === null ? 0 : Number(r.price_per_night),
    priceRange: r.price_range ?? "",
    location: r.location ?? "",
    capacity: r.capacity ?? 0,
    bedrooms: r.bedrooms ?? 0,
    bathrooms: r.bathrooms ?? 0,
    amenities: r.amenities ?? [],
    highlights: r.highlights ?? [],
    rules: r.rules ?? [],
    rating: r.rating === null ? 5 : Number(r.rating),
    reviewCount: r.review_count ?? 0,
    coordinates: { lat: Number(r.lat ?? 0), lng: Number(r.lng ?? 0) },
    checkIn: r.check_in ?? "",
    checkOut: r.check_out ?? "",
    cancellationPolicy: r.cancellation_policy ?? "",
    propertyType: r.property_type ?? "",
    bedroomDetails: r.bedroom_details ?? [],
    published: r.published,
    order: r.display_order ?? 0,
    icsUrl: r.ics_url ?? undefined,
    mapsUrl: r.maps_url ?? undefined,
  };
}

async function main() {
  const [plans, cabins, heroImages, serviceCategories, planRegions, popularDestinations, siteContentRows] =
    await Promise.all([
      fetchAll("plans"),
      fetchAll("cabins"),
      fetchAll("hero_images"),
      fetchAll("service_categories"),
      fetchAll("plan_regions"),
      fetchAll("popular_destinations"),
      supabase.from("site_content").select("*").eq("id", "main").limit(1),
    ]);

  writeJson("planes.json", plans.map(mapPlan));
  writeJson("cabins.json", cabins.map(mapCabin));

  writeJson(
    "hero-images.json",
    heroImages
      .filter((h) => h.active)
      .map((h) => ({
        id: h.id,
        url: h.url,
        mobileUrl: h.mobile_url ?? h.url,
        caption: h.caption ?? "",
      }))
  );

  writeJson(
    "service-categories.json",
    serviceCategories
      .filter((c) => c.active)
      .map((c) => ({
        id: c.id,
        label: c.label,
        subtitle: c.subtitle ?? "",
        showInHero: c.show_in_hero,
        showInNav: c.show_in_nav,
      }))
  );

  writeJson(
    "plan-regions.json",
    planRegions
      .filter((r) => r.active)
      .map((r) => ({ id: r.id, label: r.label, group: r.group }))
  );

  writeJson(
    "popular-destinations.json",
    popularDestinations
      .filter((d) => d.active)
      .map((d) => ({ categoryId: d.category_id, name: d.name }))
  );

  const sc = siteContentRows.data?.[0];
  if (sc) {
    writeJson("site-content.json", {
      hero: sc.hero,
      featuredPlans: sc.featured_plans,
      carousel: sc.carousel,
      testimonials: sc.testimonials,
      groupTrips: sc.group_trips,
      customTrips: sc.custom_trips,
      contact: sc.contact,
      policies: sc.policies,
      footer: sc.footer,
      navbar: sc.navbar,
      plansList: sc.plans_list,
      cabinsList: sc.cabins_list,
      promotions: sc.promotions,
      influencer: sc.influencer,
      team: sc.team,
      gallery: sc.gallery,
      international: sc.international,
      homeConfig: sc.home_config,
      campaign: sc.campaign,
      seo: sc.seo,
    });
  }

  console.log("[generate-content] listo.");
}

main().catch((err) => {
  console.error("[generate-content] Error:", err.message);
  process.exit(1);
});
