export type Region = "North" | "East" | "South" | "West";
export type PriceRange = "£" | "££" | "£££";
export type SpecialtyType =
  | "Braids"
  | "Locs"
  | "Natural Hair"
  | "Silk Press"
  | "Color"
  | "Cuts"
  | "Extensions"
  | "Wigs"
  | "Eyelashes";

export interface Database {
  public: {
    Tables: {
      stylists: {
        Row: {
          id: string;
          name: string;
          tagline: string;
          bio: string;
          avatar_url: string;
          cover_image_url: string;
          region: Region;
          years_experience: number;
          price_range: PriceRange;
          featured: boolean;
          booking_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["stylists"]["Row"],
          "id" | "created_at" | "updated_at"
        > & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["stylists"]["Insert"]>;
      };
      stylist_specialties: {
        Row: {
          id: string;
          stylist_id: string;
          specialty: SpecialtyType;
        };
        Insert: Omit<
          Database["public"]["Tables"]["stylist_specialties"]["Row"],
          "id"
        > & {
          id?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["stylist_specialties"]["Insert"]
        >;
      };
      services: {
        Row: {
          id: string;
          stylist_id: string;
          name: string;
          price: number;
          duration: string;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["services"]["Row"],
          "id" | "created_at"
        > & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["services"]["Insert"]>;
      };
      portfolio_photos: {
        Row: {
          id: string;
          stylist_id: string;
          photo_url: string;
          sort_order: number;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["portfolio_photos"]["Row"],
          "id" | "created_at"
        > & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["portfolio_photos"]["Insert"]
        >;
      };
      reviews: {
        Row: {
          id: string;
          stylist_id: string;
          reviewer_name: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["reviews"]["Row"],
          "id" | "created_at"
        > & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["reviews"]["Insert"]>;
      };
      stylist_availability: {
        Row: {
          id: string;
          stylist_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_available: boolean;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["stylist_availability"]["Row"],
          "id" | "created_at"
        > & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["stylist_availability"]["Insert"]
        >;
      };
      bookings: {
        Row: {
          id: string;
          stylist_id: string;
          service_id: string;
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          booking_date: string;
          start_time: string;
          end_time: string;
          status: "confirmed" | "cancelled" | "completed";
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["bookings"]["Row"],
          "id" | "created_at" | "updated_at"
        > & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["bookings"]["Insert"]>;
      };
      blocked_times: {
        Row: {
          id: string;
          stylist_id: string;
          blocked_date: string;
          start_time: string | null;
          end_time: string | null;
          reason: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["blocked_times"]["Row"],
          "id" | "created_at"
        > & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["blocked_times"]["Insert"]
        >;
      };
    };
    Views: {
      stylist_ratings: {
        Row: {
          stylist_id: string;
          rating: number;
          review_count: number;
        };
      };
    };
  };
}

export type StylistRow = Database["public"]["Tables"]["stylists"]["Row"];
export type ServiceRow = Database["public"]["Tables"]["services"]["Row"];
export type PortfolioPhotoRow =
  Database["public"]["Tables"]["portfolio_photos"]["Row"];
export type ReviewRow = Database["public"]["Tables"]["reviews"]["Row"];
export type StylistRatingRow =
  Database["public"]["Views"]["stylist_ratings"]["Row"];
export type StylistAvailabilityRow =
  Database["public"]["Tables"]["stylist_availability"]["Row"];
export type BookingRow = Database["public"]["Tables"]["bookings"]["Row"];
export type BlockedTimeRow =
  Database["public"]["Tables"]["blocked_times"]["Row"];
