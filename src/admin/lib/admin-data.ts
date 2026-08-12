import { supabase } from "./supabase-client";

/* ─────────────────────────── Reorder genérico ──────────────────────────── */
// Todas las tablas ordenables tienen una columna `display_order` (int).
// Mover "arriba"/"abajo" intercambia el display_order con el vecino.

export async function moveItem(
  table: string,
  items: { id: string; display_order: number }[],
  id: string,
  direction: "up" | "down"
): Promise<string | null> {
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return "Elemento no encontrado";
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= items.length) return null; // ya está en el extremo

  const a = items[idx];
  const b = items[swapIdx];

  const { error: e1 } = await supabase
    .from(table)
    .update({ display_order: b.display_order })
    .eq("id", a.id);
  if (e1) return e1.message;

  const { error: e2 } = await supabase
    .from(table)
    .update({ display_order: a.display_order })
    .eq("id", b.id);
  if (e2) return e2.message;

  return null;
}

/* ────────────────────────────── Storage ─────────────────────────────────── */

export async function uploadImage(file: File, folder: string): Promise<{ url: string | null; error: string | null }> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("site-images").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) return { url: null, error: error.message };
  const { data } = supabase.storage.from("site-images").getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}

/* ─────────────────────────────── Plans ──────────────────────────────────── */

export interface PlanRow {
  id: string;
  slug: string | null;
  name: string;
  short_description: string | null;
  full_description: string | null;
  images: string[];
  price: number | null;
  price_range: string | null;
  duration: string | null;
  location: string | null;
  experience_section: string | null;
  region_id: string | null;
  category: string | null;
  includes: string[];
  excludes: string[];
  highlights: string[];
  rating: number | null;
  review_count: number | null;
  schedule: string | null;
  meeting: string | null;
  published: boolean;
  display_order: number;
  featured_order: number | null;
  servicios_incluidos: { id: string; label: string; icon: string }[];
  section_titles: Record<string, string>;
}

export async function listPlans(): Promise<PlanRow[]> {
  const { data, error } = await supabase.from("plans").select("*").order("display_order");
  if (error) throw new Error(error.message);
  return data as PlanRow[];
}

export async function upsertPlan(row: Partial<PlanRow> & { id: string }): Promise<string | null> {
  const { error } = await supabase.from("plans").upsert(row);
  return error?.message ?? null;
}

export async function deletePlan(id: string): Promise<string | null> {
  const { error } = await supabase.from("plans").delete().eq("id", id);
  return error?.message ?? null;
}

/* ─────────────────────────────── Cabins ─────────────────────────────────── */

export interface CabinRow {
  id: string;
  slug: string | null;
  name: string;
  short_description: string | null;
  full_description: string | null;
  images: string[];
  price_per_night: number | null;
  price_range: string | null;
  location: string | null;
  capacity: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  amenities: string[];
  highlights: string[];
  rules: string[];
  published: boolean;
  display_order: number;
  ics_url: string | null;
  maps_url: string | null;
  section_titles: Record<string, string>;
  section_visibility: Record<string, boolean>;
}

export async function listCabins(): Promise<CabinRow[]> {
  const { data, error } = await supabase.from("cabins").select("*").order("display_order");
  if (error) throw new Error(error.message);
  return data as CabinRow[];
}

export async function upsertCabin(row: Partial<CabinRow> & { id: string }): Promise<string | null> {
  const { error } = await supabase.from("cabins").upsert(row);
  return error?.message ?? null;
}

export async function deleteCabin(id: string): Promise<string | null> {
  const { error } = await supabase.from("cabins").delete().eq("id", id);
  return error?.message ?? null;
}

/* ───────────────────────── Service categories ───────────────────────────── */

export interface ServiceCategoryRow {
  id: string;
  label: string;
  subtitle: string | null;
  display_order: number;
  active: boolean;
  show_in_hero: boolean;
  show_in_nav: boolean;
}

export async function listServiceCategories(): Promise<ServiceCategoryRow[]> {
  const { data, error } = await supabase
    .from("service_categories")
    .select("*")
    .order("display_order");
  if (error) throw new Error(error.message);
  return data as ServiceCategoryRow[];
}

export async function updateServiceCategory(
  id: string,
  patch: Partial<ServiceCategoryRow>
): Promise<string | null> {
  const { error } = await supabase.from("service_categories").update(patch).eq("id", id);
  return error?.message ?? null;
}

export async function insertServiceCategory(
  row: Omit<ServiceCategoryRow, "display_order"> & { display_order?: number }
): Promise<string | null> {
  const { data: existing, error: readError } = await supabase
    .from("service_categories")
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1);
  if (readError) return readError.message;
  const nextOrder = row.display_order ?? ((existing?.[0]?.display_order ?? -1) + 1);

  const { error } = await supabase
    .from("service_categories")
    .insert({ ...row, display_order: nextOrder });
  return error?.message ?? null;
}

/* ─────────────────────────── Plan regions ────────────────────────────────── */

export interface PlanRegionRow {
  id: string;
  label: string;
  group: "colombia" | "internacional";
  display_order: number;
  active: boolean;
}

export async function listPlanRegions(): Promise<PlanRegionRow[]> {
  const { data, error } = await supabase.from("plan_regions").select("*").order("display_order");
  if (error) throw new Error(error.message);
  return data as PlanRegionRow[];
}

/* ───────────────────────── Popular destinations ─────────────────────────── */

export interface PopularDestinationRow {
  id: string;
  category_id: string;
  name: string;
  display_order: number;
  active: boolean;
}

export async function listPopularDestinations(): Promise<PopularDestinationRow[]> {
  const { data, error } = await supabase
    .from("popular_destinations")
    .select("*")
    .order("category_id")
    .order("display_order");
  if (error) throw new Error(error.message);
  return data as PopularDestinationRow[];
}

export async function addPopularDestination(categoryId: string, name: string, order: number): Promise<string | null> {
  const { error } = await supabase
    .from("popular_destinations")
    .insert({ category_id: categoryId, name, display_order: order });
  return error?.message ?? null;
}

export async function deletePopularDestination(id: string): Promise<string | null> {
  const { error } = await supabase.from("popular_destinations").delete().eq("id", id);
  return error?.message ?? null;
}

/* ────────────────────────────── Hero images ──────────────────────────────── */

export interface HeroImageRow {
  id: string;
  url: string;
  mobile_url: string | null;
  caption: string | null;
  display_order: number;
  active: boolean;
}

export async function listHeroImages(): Promise<HeroImageRow[]> {
  const { data, error } = await supabase.from("hero_images").select("*").order("display_order");
  if (error) throw new Error(error.message);
  return data as HeroImageRow[];
}

export async function addHeroImage(row: Omit<HeroImageRow, "id">): Promise<string | null> {
  const { error } = await supabase.from("hero_images").insert(row);
  return error?.message ?? null;
}

export async function updateHeroImage(id: string, patch: Partial<HeroImageRow>): Promise<string | null> {
  const { error } = await supabase.from("hero_images").update(patch).eq("id", id);
  return error?.message ?? null;
}

export async function deleteHeroImage(id: string): Promise<string | null> {
  const { error } = await supabase.from("hero_images").delete().eq("id", id);
  return error?.message ?? null;
}

/* ────────────────────────────── Site content ─────────────────────────────── */

export interface SiteContentRow {
  id: string;
  hero: Record<string, unknown>;
  home_config: { order: string[]; active: Record<string, boolean> };
  [key: string]: unknown;
}

export async function getSiteContent(): Promise<SiteContentRow> {
  const { data, error } = await supabase.from("site_content").select("*").eq("id", "main").single();
  if (error) throw new Error(error.message);
  return data as SiteContentRow;
}

export async function updateSiteContent(patch: Record<string, unknown>): Promise<string | null> {
  const { error } = await supabase.from("site_content").update(patch).eq("id", "main");
  return error?.message ?? null;
}
