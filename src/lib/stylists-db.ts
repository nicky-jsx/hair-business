import { getSupabase, isSupabaseConfigured } from "./supabase";
import { stylists as sampleStylists } from "@/data/stylists";
import type { Stylist, Specialty, StylistFilters } from "@/types/stylist";
import type {
  StylistRow,
  ServiceRow,
  PortfolioPhotoRow,
  StylistRatingRow,
  SpecialtyType,
} from "@/types/database";

interface StylistSpecialtyRow {
  id: string;
  stylist_id: string;
  specialty: SpecialtyType;
}

export async function fetchAllStylists(): Promise<Stylist[]> {
  const supabase = getSupabase();
  if (!supabase) {
    console.log("Supabase not configured, using sample data");
    return sampleStylists;
  }

  const { data, error: stylistsError } = await supabase
    .from("stylists")
    .select("*")
    .order("featured", { ascending: false })
    .order("name");

  if (stylistsError) {
    console.error("Error fetching stylists:", stylistsError);
    return [];
  }

  const stylists = data as StylistRow[] | null;

  if (!stylists || stylists.length === 0) {
    return [];
  }

  const stylistIds = stylists.map((s) => s.id);

  const [specialtiesRes, servicesRes, portfolioRes, ratingsRes] =
    await Promise.all([
      supabase
        .from("stylist_specialties")
        .select("*")
        .in("stylist_id", stylistIds),
      supabase.from("services").select("*").in("stylist_id", stylistIds),
      supabase
        .from("portfolio_photos")
        .select("*")
        .in("stylist_id", stylistIds)
        .order("sort_order"),
      supabase.from("stylist_ratings").select("*").in("stylist_id", stylistIds),
    ]);

  const specialtiesData = (specialtiesRes.data ?? []) as StylistSpecialtyRow[];
  const servicesData = (servicesRes.data ?? []) as ServiceRow[];
  const portfolioData = (portfolioRes.data ?? []) as PortfolioPhotoRow[];
  const ratingsData = (ratingsRes.data ?? []) as StylistRatingRow[];

  const specialtiesMap = new Map<string, Specialty[]>();
  specialtiesData.forEach((s) => {
    const list = specialtiesMap.get(s.stylist_id) ?? [];
    list.push(s.specialty as Specialty);
    specialtiesMap.set(s.stylist_id, list);
  });

  const servicesMap = new Map<
    string,
    { name: string; price: number; duration: string }[]
  >();
  servicesData.forEach((s) => {
    const list = servicesMap.get(s.stylist_id) ?? [];
    list.push({ name: s.name, price: s.price, duration: s.duration });
    servicesMap.set(s.stylist_id, list);
  });

  const portfolioMap = new Map<string, string[]>();
  portfolioData.forEach((p) => {
    const list = portfolioMap.get(p.stylist_id) ?? [];
    list.push(p.photo_url);
    portfolioMap.set(p.stylist_id, list);
  });

  const ratingsMap = new Map<string, { rating: number; reviewCount: number }>();
  ratingsData.forEach((r) => {
    ratingsMap.set(r.stylist_id, {
      rating: Number(r.rating),
      reviewCount: Number(r.review_count),
    });
  });

  return stylists.map((s) => ({
    id: s.id,
    name: s.name,
    tagline: s.tagline,
    bio: s.bio,
    avatar: s.avatar_url,
    coverImage: s.cover_image_url,
    region: s.region,
    specialties: specialtiesMap.get(s.id) ?? [],
    yearsExperience: s.years_experience,
    priceRange: s.price_range,
    featured: s.featured,
    rating: ratingsMap.get(s.id)?.rating ?? 0,
    reviewCount: ratingsMap.get(s.id)?.reviewCount ?? 0,
    services: servicesMap.get(s.id) ?? [],
    portfolio: portfolioMap.get(s.id) ?? [],
    bookingUrl: s.booking_url,
  }));
}

export async function fetchStylistById(id: string): Promise<Stylist | null> {
  const supabase = getSupabase();
  if (!supabase) {
    return sampleStylists.find((s) => s.id === id) ?? null;
  }

  const { data, error } = await supabase
    .from("stylists")
    .select("*")
    .eq("id", id)
    .single();

  const stylist = data as StylistRow | null;

  if (error || !stylist) {
    console.error("Error fetching stylist:", error);
    return null;
  }

  const [specialtiesRes, servicesRes, portfolioRes, ratingsRes] =
    await Promise.all([
      supabase
        .from("stylist_specialties")
        .select("*")
        .eq("stylist_id", id),
      supabase.from("services").select("*").eq("stylist_id", id),
      supabase
        .from("portfolio_photos")
        .select("*")
        .eq("stylist_id", id)
        .order("sort_order"),
      supabase.from("stylist_ratings").select("*").eq("stylist_id", id),
    ]);

  const specialtiesData = (specialtiesRes.data ?? []) as StylistSpecialtyRow[];
  const servicesData = (servicesRes.data ?? []) as ServiceRow[];
  const portfolioData = (portfolioRes.data ?? []) as PortfolioPhotoRow[];
  const ratingsData = (ratingsRes.data ?? []) as StylistRatingRow[];

  const specialties = specialtiesData.map((s) => s.specialty as Specialty);
  const services = servicesData.map((s) => ({
    name: s.name,
    price: s.price,
    duration: s.duration,
  }));
  const portfolio = portfolioData.map((p) => p.photo_url);
  const ratingData = ratingsData[0];

  return {
    id: stylist.id,
    name: stylist.name,
    tagline: stylist.tagline,
    bio: stylist.bio,
    avatar: stylist.avatar_url,
    coverImage: stylist.cover_image_url,
    region: stylist.region,
    specialties,
    yearsExperience: stylist.years_experience,
    priceRange: stylist.price_range,
    featured: stylist.featured,
    rating: ratingData ? Number(ratingData.rating) : 0,
    reviewCount: ratingData ? Number(ratingData.review_count) : 0,
    services,
    portfolio,
    bookingUrl: stylist.booking_url,
  };
}

export async function fetchFeaturedStylists(): Promise<Stylist[]> {
  const supabase = getSupabase();
  if (!supabase) {
    return sampleStylists.filter((s) => s.featured);
  }

  const allStylists = await fetchAllStylists();
  return allStylists.filter((s) => s.featured);
}

function getRatingThreshold(filter: string): number {
  if (filter === "5") return 5;
  if (filter === "4.5+") return 4.5;
  if (filter === "4+") return 4;
  return 0;
}

export function filterStylistsLocal(
  stylists: Stylist[],
  filters: StylistFilters
): Stylist[] {
  const query = filters.query.trim().toLowerCase();

  return stylists.filter((stylist) => {
    const matchesSpecialty =
      !filters.specialty || stylist.specialties.includes(filters.specialty);

    const matchesRegion =
      !filters.region || stylist.region === filters.region;

    const matchesPrice =
      !filters.priceRange || stylist.priceRange === filters.priceRange;

    const matchesRating =
      !filters.rating || stylist.rating >= getRatingThreshold(filters.rating);

    const baseMatch =
      matchesSpecialty && matchesRegion && matchesPrice && matchesRating;

    if (!query) return baseMatch;

    const searchable = [
      stylist.name,
      stylist.tagline,
      stylist.region,
      `${stylist.region} London`,
      ...stylist.specialties,
    ]
      .join(" ")
      .toLowerCase();

    return baseMatch && searchable.includes(query);
  });
}
