import { getSupabase } from "./supabase";
import { getSessionToken } from "./session";
import type { Stylist, Specialty, Region } from "@/types/stylist";

interface CreateProfileData {
  name: string;
  tagline: string;
  bio: string;
  region: Region;
  specialties: Specialty[];
  yearsExperience: number;
  priceRange: "£" | "££" | "£££";
  services: { name: string; price: number; duration: string }[];
  avatarUrl?: string;
  coverImageUrl?: string;
}

interface UpdateProfileData extends Partial<CreateProfileData> {
  bookingUrl?: string | null;
}

function friendlyProfileError(message?: string): string {
  if (!message) return "Failed to save profile. Please try again.";
  if (message.includes("unauthorized"))
    return "Your session has expired. Please sign in again.";
  if (message.includes("forbidden"))
    return "You don't have permission to edit this profile.";
  if (message.includes("already_linked"))
    return "This account already has a profile.";
  return "Failed to save profile. Please try again.";
}

export async function createStylistProfile(
  data: CreateProfileData
): Promise<{ stylist?: Stylist; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { error: "Database not configured" };
  }

  const token = getSessionToken();
  if (!token) return { error: "Your session has expired. Please sign in again." };

  // The DB creates the stylist, its specialties/services/availability and
  // links it to the calling account — all in one authorised transaction.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: stylistId, error } = await (supabase as any).rpc(
    "create_stylist_profile",
    {
      p_token: token,
      p_payload: {
        name: data.name,
        tagline: data.tagline,
        bio: data.bio,
        region: data.region,
        yearsExperience: data.yearsExperience,
        priceRange: data.priceRange,
        specialties: data.specialties,
        services: data.services,
        avatarUrl: data.avatarUrl ?? "",
        coverImageUrl: data.coverImageUrl ?? "",
      },
    }
  );

  if (error || !stylistId) {
    console.error("Error creating stylist:", error?.message);
    return { error: friendlyProfileError(error?.message) };
  }

  return {
    stylist: {
      id: stylistId as string,
      name: data.name,
      tagline: data.tagline,
      bio: data.bio,
      avatar:
        data.avatarUrl ||
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face",
      coverImage:
        data.coverImageUrl ||
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=400&fit=crop",
      region: data.region,
      specialties: data.specialties,
      yearsExperience: data.yearsExperience,
      priceRange: data.priceRange,
      featured: false,
      rating: 0,
      reviewCount: 0,
      services: data.services,
      portfolio: [],
      bookingUrl: null,
    },
  };
}

export async function updateStylistProfile(
  stylistId: string,
  data: UpdateProfileData
): Promise<{ error?: string }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { error: "Database not configured" };
  }

  const token = getSessionToken();
  if (!token) return { error: "Your session has expired. Please sign in again." };

  // Only send keys that were actually provided; the DB verifies the token
  // owns this stylist before applying anything.
  const payload: Record<string, unknown> = {};
  if (data.name !== undefined) payload.name = data.name;
  if (data.tagline !== undefined) payload.tagline = data.tagline;
  if (data.bio !== undefined) payload.bio = data.bio;
  if (data.region !== undefined) payload.region = data.region;
  if (data.yearsExperience !== undefined)
    payload.yearsExperience = data.yearsExperience;
  if (data.priceRange !== undefined) payload.priceRange = data.priceRange;
  if (data.bookingUrl !== undefined) payload.bookingUrl = data.bookingUrl;
  if (data.avatarUrl !== undefined) payload.avatarUrl = data.avatarUrl;
  if (data.coverImageUrl !== undefined)
    payload.coverImageUrl = data.coverImageUrl;
  if (data.specialties !== undefined) payload.specialties = data.specialties;
  if (data.services !== undefined) payload.services = data.services;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).rpc("update_stylist_profile", {
    p_token: token,
    p_stylist_id: stylistId,
    p_payload: payload,
  });

  if (error) {
    console.error("Error updating stylist:", error.message);
    return { error: friendlyProfileError(error.message) };
  }

  return {};
}
