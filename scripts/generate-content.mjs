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

/** Igual que formatPrice() en src/lib/utils.ts — duplicado aquí porque este script corre en Node, fuera del bundle del sitio. */
function formatCOP(value) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// Rating/reseñas ya no se editan a mano: se calculan a partir de las reseñas
// reales en D1 (misma tabla que usa /api/reviews). Requiere estas 3 env vars
// de build en Cloudflare Pages; si faltan, se omite sin romper el build y
// mapPlan/mapCabin caen de vuelta a las columnas viejas de Supabase.
const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID;
const CF_API_TOKEN = process.env.CF_API_TOKEN;
const CF_D1_DATABASE_ID = process.env.CF_D1_DATABASE_ID;

async function fetchReviewAggregates() {
  if (!CF_ACCOUNT_ID || !CF_API_TOKEN || !CF_D1_DATABASE_ID) {
    console.log(
      "[generate-content] CF_ACCOUNT_ID/CF_API_TOKEN/CF_D1_DATABASE_ID no configuradas — rating/reseñas usan el último valor guardado en Supabase."
    );
    return new Map();
  }
  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/d1/database/${CF_D1_DATABASE_ID}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${CF_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sql: "SELECT service_type, service_id, COUNT(*) as count, AVG(rating) as avg FROM reviews GROUP BY service_type, service_id",
        }),
      }
    );
    const body = await res.json();
    if (!res.ok || !body.success) {
      throw new Error(JSON.stringify(body.errors ?? body));
    }
    const rows = body.result?.[0]?.results ?? [];
    const map = new Map();
    for (const row of rows) {
      map.set(`${row.service_type}:${row.service_id}`, {
        avg: Math.round(Number(row.avg) * 10) / 10,
        count: Number(row.count),
      });
    }
    console.log(`[generate-content] rating/reseñas sincronizados desde D1 (${map.size} servicios con reseñas)`);
    return map;
  } catch (err) {
    console.warn("[generate-content] No se pudo sincronizar rating desde D1:", err.message);
    return new Map();
  }
}

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

function mapPlan(r, reviewAggregates) {
  const agg = reviewAggregates.get(`plan:${r.id}`);
  return {
    id: r.id,
    slug: r.slug ?? undefined,
    name: r.name,
    shortDescription: r.short_description ?? "",
    fullDescription: r.full_description ?? "",
    images: r.images ?? [],
    price: r.price === null ? 0 : Number(r.price),
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
    importantInfo: r.important_info ?? undefined,
    rating: agg ? agg.avg : r.rating === null ? 5 : Number(r.rating),
    reviewCount: agg ? agg.count : r.review_count ?? 0,
    published: r.published,
    order: r.display_order ?? 0,
    itinerary: r.itinerary?.length ? r.itinerary : undefined,
    departureDates: r.departure_dates?.length ? r.departure_dates : undefined,
    fixedDeparture: r.fixed_departure || undefined,
    lugares: r.lugares?.length ? r.lugares : undefined,
    featuredOrder: r.featured_order === null ? undefined : r.featured_order,
    fecha_salida: r.fecha_salida ?? undefined,
    mostrar_limite_personas: r.mostrar_limite_personas || undefined,
    max_personas: r.max_personas === null ? undefined : r.max_personas,
    badge_imagen: r.badge_imagen ?? undefined,
    badge_precio: r.badge_precio ?? undefined,
    servicios_incluidos: r.servicios_incluidos?.length ? r.servicios_incluidos : undefined,
    sectionTitles: r.section_titles ?? {},
  };
}

function mapCabin(r, reviewAggregates) {
  const agg = reviewAggregates.get(`cabin:${r.id}`);
  const priceRange =
    r.price_min != null && r.price_max != null
      ? `${formatCOP(r.price_min)} - ${formatCOP(r.price_max)} COP / noche`
      : "";
  return {
    id: r.id,
    slug: r.slug ?? undefined,
    name: r.name,
    shortDescription: r.short_description ?? "",
    fullDescription: r.full_description ?? "",
    images: r.images ?? [],
    pricePerNight: r.price_per_night === null ? 0 : Number(r.price_per_night),
    priceRange,
    location: r.location ?? "",
    capacity: r.capacity ?? 0,
    bedrooms: r.bedrooms ?? 0,
    bathrooms: r.bathrooms ?? 0,
    amenities: r.amenities ?? [],
    highlights: r.highlights ?? [],
    rules: r.rules ?? [],
    rating: agg ? agg.avg : r.rating === null ? 5 : Number(r.rating),
    reviewCount: agg ? agg.count : r.review_count ?? 0,
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
    sectionTitles: r.section_titles ?? {},
    sectionVisibility: r.section_visibility ?? {},
  };
}

async function main() {
  const [plans, cabins, heroImages, serviceCategories, planRegions, popularDestinations, siteContentRows, reviewAggregates] =
    await Promise.all([
      fetchAll("plans"),
      fetchAll("cabins"),
      fetchAll("hero_images"),
      fetchAll("service_categories"),
      fetchAll("plan_regions"),
      fetchAll("popular_destinations"),
      supabase.from("site_content").select("*").eq("id", "main").limit(1),
      fetchReviewAggregates(),
    ]);

  writeJson("planes.json", plans.map((r) => mapPlan(r, reviewAggregates)));
  writeJson("cabins.json", cabins.map((r) => mapCabin(r, reviewAggregates)));

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
      ticker: sc.ticker,
      scheduledDeparturesBanner: sc.scheduled_departures_banner,
      scheduledDepartures: sc.scheduled_departures,
      seo: sc.seo,
    });
  }

  console.log("[generate-content] listo.");
}

main().catch((err) => {
  console.error("[generate-content] Error:", err.message);
  process.exit(1);
});
