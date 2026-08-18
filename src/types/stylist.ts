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
  avatar: string;
  coverImage: string;
  region: Region;
  specialties: Specialty[];
  yearsExperience: number;
  priceRange: "£" | "££" | "£££";
  featured: boolean;
  rating: number;
  reviewCount: number;
  services: Service[];
  portfolio: string[];
  bookingUrl: string | null;
  bookingPolicy?: BookingPolicy | null;
  depositType?: DepositType | null;
  depositValue?: number | null;
}

export type PriceRange = "£" | "££" | "£££";
export const PRICE_RANGES: PriceRange[] = ["£", "££", "£££"];

export type RatingFilter = "4+" | "4.5+" | "5";
export const RATING_FILTERS: RatingFilter[] = ["4+", "4.5+", "5"];

export interface StylistFilters {
  query: string;
  specialty: Specialty | null;
  region: Region | null;
  priceRange: PriceRange | null;
  rating: RatingFilter | null;
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
