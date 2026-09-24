export type Specialty =
  | "Braids"
  | "Locs"
  | "Natural Hair"
  | "Silk Press"
  | "Color"
  | "Cuts"
  | "Extensions"
  | "Wigs"
  | "Eyelashes";

export const REGIONS = ["North", "East", "South", "West"] as const;
export type Region = (typeof REGIONS)[number];

export interface Service {
  name: string;
  price: number;
  duration: string;
}

export interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export type DepositType = "percentage" | "fixed" | "none";

export function calculateDepositAmount(
  price: number,
  type: DepositType | null | undefined,
  value: number | null | undefined
): number {
  if (!type || type === "none" || !value || value <= 0) return 0;
  if (type === "percentage") {
    return Math.min(price, Math.round((price * value) / 100));
  }
  return Math.min(price, Math.round(value));
}

export interface BookingPolicy {
  deposit: string;
  cancellation: string;
  lateness: string;
  noShow: string;
  additionalNotes: string | null;
}

export const DEFAULT_BOOKING_POLICY: BookingPolicy = {
  deposit:
    "A non-refundable deposit is required to secure your appointment. The balance is due on the day.",
  cancellation:
    "Please give at least 48 hours' notice to cancel or reschedule. Cancellations within 48 hours may forfeit the deposit.",
  lateness:
    "There is a 15-minute grace period. Arriving later than this may result in your appointment being shortened or rescheduled.",
  noShow:
    "No-shows will be charged 50% of the service price and may be asked to pay in full before future bookings.",
  additionalNotes: null,
};

export interface Stylist {
  id: string;
  name: string;
  tagline: string;
  bio: string;
  avatar: string | null;
  coverImage: string | null;
  region: Region;
  specialties: Specialty[];
  yearsExperience: number;
  priceRange: "£" | "££" | "£££";
  featured: boolean;
  rating: number;
  reviewCount: number;
  services: Service[];
  portfolio: string[];
  reviews?: Review[];
  bookingUrl: string | null;
  instagramUrl?: string | null;
  verified?: boolean;
  bookingPolicy?: BookingPolicy | null;
  depositType?: DepositType | null;
  depositValue?: number | null;
  slotIntervalMinutes?: number | null;
}

export type PriceRange = "£" | "££" | "£££";
export const PRICE_RANGES: PriceRange[] = ["£", "££", "£££"];

export type RatingFilter = "4+" | "4.5+" | "5";
export const RATING_FILTERS: RatingFilter[] = ["4+", "4.5+", "5"];

export type SortOption = "popular" | "price-asc" | "price-desc" | "rating" | "name";
export const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: "Most Popular", value: "popular" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Highest Rated", value: "rating" },
  { label: "Name: A–Z", value: "name" },
];

export type BudgetTier = "under-50" | "50-80" | "80-110" | "110-plus";
export const BUDGET_TIERS: { label: string; value: BudgetTier; description: string }[] = [
  { label: "Under £50", value: "under-50", description: "Budget friendly" },
  { label: "£50–£80", value: "50-80", description: "Standard" },
  { label: "£80–£110", value: "80-110", description: "Premium" },
  { label: "£110+", value: "110-plus", description: "Luxury & Custom" },
];

export interface SubCategoryFilter {
  label: string;
  value: string;
  keywords: string[];
}

export const SPECIALTY_SUB_SERVICES: Record<string, SubCategoryFilter[]> = {
  All: [
    { label: "Wig Installs", value: "wig-installs", keywords: ["wig install", "install", "frontal", "closure"] },
    { label: "Lashes", value: "lashes", keywords: ["lash", "lashes", "eyelash", "extension"] },
    { label: "Dreadlocks", value: "dreadlocks", keywords: ["dread", "dreads", "dreadlocks", "loc", "locs", "retwist", "maintenance"] },
    { label: "Braids", value: "braids", keywords: ["braid", "knotless", "box braids", "cornrow", "plaits"] },
    { label: "Natural", value: "natural", keywords: ["natural hair", "natural", "curl", "afro"] },
    { label: "Silk Press", value: "silk-press", keywords: ["silk press", "press", "blowout"] },
    { label: "Glueless Wigs", value: "glueless-wigs", keywords: ["glueless", "ready to wear"] },
    { label: "Volume Lashes", value: "volume-lashes", keywords: ["volume", "hybrid", "russian"] },
    { label: "Retwist & Style", value: "retwist-style", keywords: ["retwist", "loc style", "starter locs"] },
  ],
  Wigs: [
    { label: "Wig Installs", value: "wig-installs", keywords: ["install", "frontal", "closure"] },
    { label: "Glueless Wigs", value: "glueless-wigs", keywords: ["glueless", "ready to wear"] },
    { label: "Frontals & Closures", value: "frontals-closures", keywords: ["frontal", "closure", "lace melt"] },
    { label: "Custom Units", value: "custom-units", keywords: ["custom", "unit", "construction", "wig making"] },
    { label: "Revamp & Maintenance", value: "wig-revamp", keywords: ["revamp", "maintenance", "wash", "styling"] },
  ],
  Locs: [
    { label: "Dreadlocks", value: "dreadlocks", keywords: ["dread", "dreads", "dreadlocks", "loc", "locs", "maintenance", "wash", "retwist"] },
    { label: "Retwist & Style", value: "retwist-style", keywords: ["retwist", "style", "styling"] },
    { label: "Starter Dreadlocks", value: "starter-locs", keywords: ["starter", "comb coils", "two strand"] },
    { label: "Interlocking", value: "interlocking", keywords: ["interlocking", "interlock", "crochet"] },
    { label: "Repair & Detox", value: "loc-repair", keywords: ["repair", "detox", "re-attachment"] },
  ],
  Dreadlocks: [
    { label: "Dreadlocks", value: "dreadlocks", keywords: ["dread", "dreads", "dreadlocks", "loc", "locs", "maintenance", "wash", "retwist"] },
    { label: "Retwist & Style", value: "retwist-style", keywords: ["retwist", "style", "styling"] },
    { label: "Starter Dreadlocks", value: "starter-locs", keywords: ["starter", "comb coils", "two strand"] },
    { label: "Interlocking", value: "interlocking", keywords: ["interlocking", "interlock", "crochet"] },
    { label: "Repair & Detox", value: "loc-repair", keywords: ["repair", "detox", "re-attachment"] },
  ],
  Eyelashes: [
    { label: "Lashes", value: "lashes", keywords: ["extension", "extensions", "lash", "lashes"] },
    { label: "Classic Sets", value: "classic-lashes", keywords: ["classic", "individual", "1:1"] },
    { label: "Hybrid Sets", value: "hybrid-lashes", keywords: ["hybrid", "wispy"] },
    { label: "Russian / Volume", value: "volume-lashes", keywords: ["volume", "russian", "mega"] },
    { label: "Brow Styling", value: "brow-styling", keywords: ["brow", "brows", "lamination", "tint"] },
  ],
  Lashes: [
    { label: "Lashes", value: "lashes", keywords: ["extension", "extensions", "lash", "lashes"] },
    { label: "Classic Sets", value: "classic-lashes", keywords: ["classic", "individual", "1:1"] },
    { label: "Hybrid Sets", value: "hybrid-lashes", keywords: ["hybrid", "wispy"] },
    { label: "Russian / Volume", value: "volume-lashes", keywords: ["volume", "russian", "mega"] },
    { label: "Brow Styling", value: "brow-styling", keywords: ["brow", "brows", "lamination", "tint"] },
  ],
  Braids: [
    { label: "Knotless Braids", value: "knotless-braids", keywords: ["knotless", "box braids"] },
    { label: "Box Braids", value: "box-braids", keywords: ["box braid", "box braids"] },
    { label: "Cornrows", value: "cornrows", keywords: ["cornrow", "cornrows", "canerows"] },
    { label: "Feed-in / Stitch", value: "stitch-braids", keywords: ["stitch", "feed-in", "feed in"] },
    { label: "Kids Braids", value: "kids-braids", keywords: ["kids", "children", "teen"] },
  ],
  "Natural Hair": [
    { label: "Natural Hair Care", value: "natural-care", keywords: ["natural hair", "natural", "curl", "afro"] },
    { label: "Silk Press", value: "silk-press", keywords: ["silk press", "press", "blowout"] },
    { label: "Wash & Treatment", value: "wash-treatment", keywords: ["wash", "treatment", "deep condition", "detangle"] },
    { label: "Blowout & Style", value: "blowout", keywords: ["blowout", "style", "trim"] },
  ],
  Natural: [
    { label: "Natural Hair Care", value: "natural-care", keywords: ["natural hair", "natural", "curl", "afro"] },
    { label: "Silk Press", value: "silk-press", keywords: ["silk press", "press", "blowout"] },
    { label: "Wash & Treatment", value: "wash-treatment", keywords: ["wash", "treatment", "deep condition", "detangle"] },
    { label: "Blowout & Style", value: "blowout", keywords: ["blowout", "style", "trim"] },
  ],
  "Silk Press": [
    { label: "Silk Press", value: "silk-press", keywords: ["silk press", "press"] },
    { label: "Blowout & Trim", value: "blowout-trim", keywords: ["blowout", "trim", "cut"] },
    { label: "Deep Conditioning", value: "deep-condition", keywords: ["deep condition", "treatment", "hydrate"] },
  ],
  Color: [
    { label: "Full Color", value: "full-color", keywords: ["full colour", "full color", "tint"] },
    { label: "Balayage", value: "balayage", keywords: ["balayage", "highlights", "bleach"] },
    { label: "Tone & Gloss", value: "tone-gloss", keywords: ["tone", "toner", "gloss"] },
  ],
  Cuts: [
    { label: "Skin Fade", value: "skin-fade", keywords: ["fade", "skin fade", "taper"] },
    { label: "Shape Up & Beard", value: "shape-up", keywords: ["shape up", "beard", "line up"] },
    { label: "Scissor Cut", value: "scissor-cut", keywords: ["scissor", "trim", "layers"] },
  ],
  Extensions: [
    { label: "Sew-In Weave", value: "sew-in", keywords: ["sew-in", "sew in", "weave"] },
    { label: "Microlinks", value: "microlinks", keywords: ["microlink", "microlinks", "i-tip"] },
    { label: "Tape-Ins", value: "tape-ins", keywords: ["tape-in", "tape in", "tape ins"] },
  ],
};

export const TOP_LONDON_BOROUGHS: { name: string; region: Region }[] = [
  { name: "Croydon", region: "South" },
  { name: "Clapton", region: "East" },
  { name: "Lewisham", region: "South" },
  { name: "Tottenham", region: "North" },
  { name: "Dagenham", region: "East" },
  { name: "Peckham", region: "South" },
  { name: "Hackney", region: "East" },
  { name: "Abbey Wood", region: "South" },
  { name: "Deptford", region: "South" },
  { name: "Woolwich", region: "South" },
  { name: "Stratford", region: "East" },
  { name: "Enfield", region: "North" },
  { name: "Bromley", region: "South" },
  { name: "Brixton", region: "South" },
  { name: "Greenwich", region: "South" },
  { name: "Edmonton", region: "North" },
  { name: "Plumstead", region: "South" },
  { name: "Thornton Heath", region: "South" },
  { name: "Walthamstow", region: "East" },
  { name: "Romford", region: "East" },
  { name: "Camberwell", region: "South" },
  { name: "Elephant & Castle", region: "South" },
];

export interface StylistFilters {
  query: string;
  specialty: Specialty | null;
  region: Region | null;
  priceRange: PriceRange | null;
  rating: RatingFilter | null;
  serviceType?: string | null;
  borough?: string | null;
  budgetTier?: BudgetTier | null;
  sortBy?: SortOption;
  verifiedOnly?: boolean | null;
}

export function formatRegion(region: Region): string {
  return `${region} London`;
}

export function formatPrice(price: number): string {
  return `£${price}`;
}

export function normaliseBookingUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function isValidBookingUrl(input: string): boolean {
  const url = normaliseBookingUrl(input);
  if (!url) return true;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Accepts a full URL, an @handle, or a bare handle and returns a profile URL.
export function normaliseInstagramUrl(
  input: string | null | undefined
): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const handle = trimmed.replace(/^@/, "").replace(/^instagram\.com\//i, "");
  if (!handle) return null;
  return `https://instagram.com/${handle}`;
}
