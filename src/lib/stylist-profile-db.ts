import { getSupabase } from "./supabase";
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

export async function createStylistProfile(
  data: CreateProfileData
): Promise<{ stylist?: Stylist; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { error: "Database not configured" };
  }

  // Insert stylist
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: stylistResult, error: stylistError } = await (supabase as any)
    .from("stylists")
    .insert({
      name: data.name,
      tagline: data.tagline,
      bio: data.bio,
      region: data.region,
      years_experience: data.yearsExperience,
      price_range: data.priceRange,
      avatar_url: data.avatarUrl || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face",
      cover_image_url: data.coverImageUrl || "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=400&fit=crop",
      featured: false,
      booking_url: null,
    })
    .select()
    .single();

  if (stylistError) {
    console.error("Error creating stylist:", stylistError);
    return { error: "Failed to create profile. Please try again." };
  }

  const stylistId = stylistResult.id;

  // Insert specialties
  if (data.specialties.length > 0) {
    const specialtyRows = data.specialties.map((specialty) => ({
      stylist_id: stylistId,
      specialty,
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("stylist_specialties").insert(specialtyRows);
  }

  // Insert services
  if (data.services.length > 0) {
    const serviceRows = data.services.map((service) => ({
      stylist_id: stylistId,
      name: service.name,
      price: service.price,
      duration: service.duration,
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("services").insert(serviceRows);
  }

  // Insert default availability (Mon-Sat 9am-9pm)
  const availabilityRows = Array.from({ length: 7 }, (_, i) => ({
    stylist_id: stylistId,
    day_of_week: i,
    start_time: "09:00",
    end_time: "21:00",
    is_available: i !== 0, // Sunday off
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from("stylist_availability").insert(availabilityRows);

  return {
    stylist: {
      id: stylistId,
      name: data.name,
      tagline: data.tagline,
      bio: data.bio,
      avatar: stylistResult.avatar_url,
      coverImage: stylistResult.cover_image_url,
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

  // Update main stylist record
  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.tagline !== undefined) updateData.tagline = data.tagline;
  if (data.bio !== undefined) updateData.bio = data.bio;
  if (data.region !== undefined) updateData.region = data.region;
  if (data.yearsExperience !== undefined) updateData.years_experience = data.yearsExperience;
  if (data.priceRange !== undefined) updateData.price_range = data.priceRange;
  if (data.bookingUrl !== undefined) updateData.booking_url = data.bookingUrl;
  if (data.avatarUrl !== undefined) updateData.avatar_url = data.avatarUrl;
  if (data.coverImageUrl !== undefined) updateData.cover_image_url = data.coverImageUrl;

  if (Object.keys(updateData).length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("stylists")
      .update(updateData)
      .eq("id", stylistId);

    if (error) {
      console.error("Error updating stylist:", error);
      return { error: "Failed to update profile" };
    }
  }

  // Update specialties if provided
  if (data.specialties !== undefined) {
    // Delete existing
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("stylist_specialties")
      .delete()
      .eq("stylist_id", stylistId);

    // Insert new
    if (data.specialties.length > 0) {
      const specialtyRows = data.specialties.map((specialty) => ({
        stylist_id: stylistId,
        specialty,
      }));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from("stylist_specialties").insert(specialtyRows);
    }
  }

  // Update services if provided
  if (data.services !== undefined) {
    // Delete existing
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("services")
      .delete()
      .eq("stylist_id", stylistId);

    // Insert new
    if (data.services.length > 0) {
      const serviceRows = data.services.map((service) => ({
        stylist_id: stylistId,
        name: service.name,
        price: service.price,
        duration: service.duration,
      }));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from("services").insert(serviceRows);
    }
  }

  return {};
}
