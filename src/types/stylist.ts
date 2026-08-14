export type Specialty =
  | "Braids"
  | "Locs"
  | "Natural Hair"
  | "Silk Press"
  | "Color"
  | "Cuts"
  | "Extensions"
  | "Wigs";

export const REGIONS = ["North", "East", "South", "West"] as const;
export type Region = (typeof REGIONS)[number];

export interface Service {
  name: string;
  price: number;
  duration: string;
}

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
}

export interface StylistFilters {
  query: string;
  specialty: Specialty | null;
  region: Region | null;
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
