import { getSupabase, isSupabaseConfigured } from "./supabase";
import { getSessionToken } from "./session";
import {
  SPECIALTY_SUB_SERVICES,
  type Stylist,
  type Specialty,
  type StylistFilters,
} from "@/types/stylist";
import type {
  StylistRow,
  ServiceRow,
  PortfolioPhotoRow,
  StylistRatingRow,
  ReviewRow,
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
    console.log("Supabase not configured");
    return [];
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
      supabase.from("stylist_specialties").select("*"),
      supabase.from("services").select("*"),
      supabase
        .from("portfolio_photos")
        .select("*")
        .order("sort_order"),
      supabase.from("stylist_ratings").select("*"),
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
    avatar: s.avatar_url ?? null,
    coverImage: s.cover_image_url ?? null,
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    instagramUrl: (s as any).instagram_url ?? null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    verified: (s as any).verified ?? false,
    bookingPolicy: parseBookingPolicy(s),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    depositType: ((s as any).deposit_type ?? null) as Stylist["depositType"],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    depositValue: (s as any).deposit_value ?? null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    slotIntervalMinutes: (s as any).slot_interval_minutes ?? null,
  }));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseBookingPolicy(row: any): Stylist["bookingPolicy"] {
  const policy = row?.booking_policy;
  if (policy && typeof policy === "object") {
    return {
      deposit: policy.deposit ?? "",
      cancellation: policy.cancellation ?? "",
      lateness: policy.lateness ?? "",
      noShow: policy.noShow ?? "",
      additionalNotes: policy.additionalNotes ?? null,
    };
  }
  return null;
}

export async function fetchStylistById(id: string): Promise<Stylist | null> {
  const supabase = getSupabase();
  if (!supabase) {
    return null;
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

  const [specialtiesRes, servicesRes, portfolioRes, ratingsRes, reviewsRes] =
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
      supabase
        .from("reviews")
        .select("*")
        .eq("stylist_id", id)
        .order("created_at", { ascending: false }),
    ]);

  const specialtiesData = (specialtiesRes.data ?? []) as StylistSpecialtyRow[];
  const servicesData = (servicesRes.data ?? []) as ServiceRow[];
  const portfolioData = (portfolioRes.data ?? []) as PortfolioPhotoRow[];
  const ratingsData = (ratingsRes.data ?? []) as StylistRatingRow[];
  const reviewsData = (reviewsRes.data ?? []) as ReviewRow[];

  const specialties = specialtiesData.map((s) => s.specialty as Specialty);
  const services = servicesData.map((s) => ({
    name: s.name,
    price: s.price,
    duration: s.duration,
  }));
  const portfolio = portfolioData.map((p) => p.photo_url);
  const reviews = reviewsData.map((r) => ({
    id: r.id,
    reviewerName: r.reviewer_name,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.created_at,
  }));
  const ratingData = ratingsData[0];

  return {
    id: stylist.id,
    name: stylist.name,
    tagline: stylist.tagline,
    bio: stylist.bio,
    avatar: stylist.avatar_url ?? null,
    coverImage: stylist.cover_image_url ?? null,
    region: stylist.region,
    specialties,
    yearsExperience: stylist.years_experience,
    priceRange: stylist.price_range,
    featured: stylist.featured,
    rating: ratingData ? Number(ratingData.rating) : 0,
    reviewCount: ratingData ? Number(ratingData.review_count) : 0,
    services,
    portfolio,
    reviews,
    bookingUrl: stylist.booking_url,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    instagramUrl: (stylist as any).instagram_url ?? null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    verified: (stylist as any).verified ?? false,
    bookingPolicy: parseBookingPolicy(stylist),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    depositType: ((stylist as any).deposit_type ?? null) as Stylist["depositType"],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    depositValue: (stylist as any).deposit_value ?? null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    slotIntervalMinutes: (stylist as any).slot_interval_minutes ?? null,
  };
}

export async function updateStylistDeposit(
  stylistId: string,
  depositType: NonNullable<Stylist["depositType"]>,
  depositValue: number
): Promise<{ error?: string }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { error: "Database not configured." };
  }

  const token = getSessionToken();
  if (!token) return { error: "Your session has expired. Please sign in again." };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).rpc("update_stylist_deposit", {
    p_token: token,
    p_stylist_id: stylistId,
    p_type: depositType,
    p_value: depositType === "none" ? 0 : depositValue,
  });

  if (error) {
    console.error("Error updating deposit:", error.message);
    if (error.message?.includes("unauthorized"))
      return { error: "Your session has expired. Please sign in again." };
    if (error.message?.includes("forbidden"))
      return { error: "You don't have permission to change this." };
    return { error: "Failed to save deposit settings." };
  }

  return {};
}

export async function updateSlotInterval(
  stylistId: string,
  slotIntervalMinutes: number
): Promise<{ error?: string }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { error: "Database not configured." };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("stylists")
    .update({ slot_interval_minutes: slotIntervalMinutes })
    .eq("id", stylistId);

  if (error) {
    console.error("Error updating slot interval:", error);
    return { error: "Failed to save slot spacing." };
  }

  return {};
}

export async function fetchFeaturedStylists(): Promise<Stylist[]> {
  const allStylists = await fetchAllStylists();

  // Strictly hair specialists (exclude lash technicians)
  const hairStylists = allStylists.filter(
    (s) => !s.specialties.includes("Eyelashes") && s.specialties.length > 0
  );

  if (hairStylists.length === 0) return [];

  // Find aleshalocdit and 38styles specifically to ensure they are featured
  const alesha = hairStylists.find(
    (s) => s.id === "fc60e331-845f-49bc-9dc7-a50ed040906a" || s.name.toLowerCase() === "aleshalocdit"
  );
  const thirtyEightStyles = hairStylists.find(
    (s) => s.id === "3d6b9ed5-643d-430f-9684-7f2e50b1acc4" || s.name.toLowerCase() === "38styles"
  );

  // 1. Prioritize any explicitly marked featured in the database
  const explicitFeatured = hairStylists.filter((s) => s.featured);

  // 2. Select authentic, prominent London hair specialists from the database
  const pool = hairStylists.filter(
    (s) =>
      !explicitFeatured.some((ef) => ef.id === s.id) &&
      s.id !== alesha?.id &&
      s.id !== thirtyEightStyles?.id &&
      s.name.toLowerCase() !== "nicky" &&
      Boolean(s.bio && s.bio.length > 10)
  );

  // Group by hair specialties to showcase a well-rounded mix of Wigs and Locs
  const wigs = pool.filter((s) => s.specialties.includes("Wigs"));
  const locs = pool.filter((s) => s.specialties.includes("Locs"));

  const curated: Stylist[] = [];

  // Always feature aleshalocdit and 38styles with their thumbnails ONLY in the featured section
  if (alesha) {
    curated.push({
      ...alesha,
      coverImage: "/images/featured/aleshalocdit.jpg",
    });
  }
  if (thirtyEightStyles) {
    curated.push({
      ...thirtyEightStyles,
      coverImage: "/images/featured/38styles.jpg",
    });
  }

  // Select top wig specialists across London
  for (const w of wigs) {
    if (curated.length < 4) curated.push(w);
  }
  // Select top dreadlock / loc specialists across London
  for (const l of locs) {
    if (curated.length < 6) curated.push(l);
  }
  // Fill any remaining from the pool
  for (const p of pool) {
    if (curated.length < 6 && !curated.some((c) => c.id === p.id)) {
      curated.push(p);
    }
  }

  const result = [...explicitFeatured, ...curated].slice(0, 6);

  // Ensure aleshalocdit and 38styles have their custom thumbnails specifically in the featured section
  return result.map((s) => {
    if (s.id === "fc60e331-845f-49bc-9dc7-a50ed040906a" || s.name.toLowerCase() === "aleshalocdit") {
      return { ...s, coverImage: "/images/featured/aleshalocdit.jpg" };
    }
    if (s.id === "3d6b9ed5-643d-430f-9684-7f2e50b1acc4" || s.name.toLowerCase() === "38styles") {
      return { ...s, coverImage: "/images/featured/38styles.jpg" };
    }
    return s;
  });
}

function getRatingThreshold(filter: string): number {
  if (filter === "5") return 5;
  if (filter === "4.5+") return 4.5;
  if (filter === "4+") return 4;
  return 0;
}

const STOPWORDS = new Set(["in", "at", "near", "for", "the", "and", "of", "london", "hair", "uk", "to"]);

function getSpecialtySynonyms(specialties: Specialty[]): string[] {
  const synonyms: string[] = [];
  for (const s of specialties) {
    if (s === "Wigs") synonyms.push("wig", "lace", "frontal", "closure", "glueless", "unit", "melt");
    if (s === "Braids") synonyms.push("braid", "knotless", "cornrow", "cornrows", "box braids", "plaits");
    if (s === "Locs") synonyms.push("loc", "locs", "dread", "dreads", "dreadlocks", "retwist", "starter locs");
    if (s === "Eyelashes") synonyms.push("lash", "lashes", "eyelash", "brow", "brows", "lamination");
    if (s === "Silk Press") synonyms.push("press", "blowout", "straight");
    if (s === "Cuts") synonyms.push("cut", "fade", "barber", "shape up", "trim");
    if (s === "Color") synonyms.push("colour", "balayage", "bleach", "highlights");
  }
  return synonyms;
}

export function getStylistBasePrice(stylist: Stylist): number {
  const bioMatch = stylist.bio?.match(/£(\d+)/);
  if (bioMatch) {
    const num = parseInt(bioMatch[1], 10);
    if (!isNaN(num) && num > 0) return num;
  }
  if (stylist.services && stylist.services.length > 0) {
    const prices = stylist.services.map((s) => s.price).filter((p) => p > 0);
    if (prices.length > 0) return Math.min(...prices);
  }
  if (stylist.priceRange === "£") return 40;
  if (stylist.priceRange === "££") return 75;
  if (stylist.priceRange === "£££") return 120;
  return 70;
}

export function filterStylistsLocal(
  stylists: Stylist[],
  filters: StylistFilters
): Stylist[] {
  const rawQuery = filters.query.trim().toLowerCase();

  const filtered = stylists.filter((stylist) => {
    const matchesSpecialty =
      !filters.specialty || stylist.specialties.includes(filters.specialty);

    const matchesRegion =
      !filters.region || stylist.region === filters.region;

    const matchesPrice =
      !filters.priceRange || stylist.priceRange === filters.priceRange;

    const matchesRating =
      !filters.rating || stylist.rating >= getRatingThreshold(filters.rating);

    // Sub-category / Service type filter
    let matchesServiceType = true;
    if (filters.serviceType) {
      const activeSpecialty = filters.specialty || "All";
      const subCategoryList = [
        ...(SPECIALTY_SUB_SERVICES[activeSpecialty] || []),
        ...(SPECIALTY_SUB_SERVICES["All"] || []),
      ];
      const matchedFilter = subCategoryList.find((f) => f.value === filters.serviceType);
      const keywords = matchedFilter
        ? matchedFilter.keywords
        : [filters.serviceType.toLowerCase().replace(/-/g, " ")];

      const stylistText = [
        stylist.tagline.toLowerCase(),
        stylist.bio.toLowerCase(),
        ...stylist.services.map((s) => s.name.toLowerCase()),
        ...stylist.specialties.map((s) => s.toLowerCase()),
      ].join(" ");

      matchesServiceType = keywords.some((kw) => stylistText.includes(kw.toLowerCase()));
    }

    // Borough / Neighborhood filter
    let matchesBorough = true;
    if (filters.borough) {
      const bLower = filters.borough.toLowerCase();
      matchesBorough =
        stylist.bio.toLowerCase().includes(bLower) ||
        stylist.name.toLowerCase().includes(bLower);
    }

    // Budget Tier filter
    let matchesBudget = true;
    if (filters.budgetTier) {
      const basePrice = getStylistBasePrice(stylist);
      if (filters.budgetTier === "under-50") {
        matchesBudget = basePrice <= 50;
      } else if (filters.budgetTier === "50-80") {
        matchesBudget = basePrice >= 50 && basePrice <= 80;
      } else if (filters.budgetTier === "80-110") {
        matchesBudget = basePrice >= 80 && basePrice <= 110;
      } else if (filters.budgetTier === "110-plus") {
        matchesBudget = basePrice >= 110;
      }
    }

    // Verified Only filter
    const matchesVerified = !filters.verifiedOnly || Boolean(stylist.verified);

    const baseMatch =
      matchesSpecialty &&
      matchesRegion &&
      matchesPrice &&
      matchesRating &&
      matchesServiceType &&
      matchesBorough &&
      matchesBudget &&
      matchesVerified;

    if (!baseMatch) return false;
    if (!rawQuery) return true;

    // Tokenize query and remove non-essential conversational stopwords
    const rawTokens = rawQuery
      .replace(/[^\w\s-]/g, " ")
      .split(/\s+/)
      .filter(Boolean);

    const meaningfulTokens = rawTokens.filter((t) => !STOPWORDS.has(t));
    const tokens = meaningfulTokens.length > 0 ? meaningfulTokens : rawTokens;

    // Build comprehensive search corpus for the stylist
    const serviceNames = stylist.services.map((s) => s.name.toLowerCase());
    const specialtySynonyms = getSpecialtySynonyms(stylist.specialties);

    const searchCorpus = [
      stylist.name.toLowerCase(),
      stylist.tagline.toLowerCase(),
      stylist.bio.toLowerCase(),
      stylist.region.toLowerCase(),
      `${stylist.region.toLowerCase()} london`,
      stylist.instagramUrl ? stylist.instagramUrl.toLowerCase() : "",
      ...stylist.specialties.map((s) => s.toLowerCase()),
      ...serviceNames,
      ...specialtySynonyms,
    ].join(" ");

    // Every token must match somewhere in the stylist's corpus
    return tokens.every((token) => searchCorpus.includes(token));
  });

  // Apply sorting
  const sortBy = filters.sortBy || "popular";
  if (sortBy === "price-asc") {
    filtered.sort((a, b) => getStylistBasePrice(a) - getStylistBasePrice(b));
  } else if (sortBy === "price-desc") {
    filtered.sort((a, b) => getStylistBasePrice(b) - getStylistBasePrice(a));
  } else if (sortBy === "rating") {
    filtered.sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      return b.reviewCount - a.reviewCount;
    });
  } else if (sortBy === "name") {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    // Default: 'popular' -> featured first, then rating/reviews, then name
    filtered.sort((a, b) => {
      if (a.featured !== b.featured) return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      const scoreA = a.rating * (a.reviewCount || 1);
      const scoreB = b.rating * (b.reviewCount || 1);
      if (scoreA !== scoreB) return scoreB - scoreA;
      return a.name.localeCompare(b.name);
    });
  }

  return filtered;
}
