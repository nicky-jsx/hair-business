import { getSupabase } from "./supabase";
import type {
  Booking,
  StylistAvailability,
  DateAvailability,
  BlockedTime,
  TimeSlot,
  BookingFormData,
} from "@/types/booking";
import {
  generateTimeSlots,
  formatTime,
  DEFAULT_SLOT_INTERVAL_MINUTES,
} from "@/types/booking";
import type {
  StylistAvailabilityRow,
  BlockedTimeRow,
} from "@/types/database";

// Fetch stylist availability for all days
export async function fetchStylistAvailability(
  stylistId: string
): Promise<StylistAvailability[]> {
  const supabase = getSupabase();
  if (!supabase) return getDefaultAvailability(stylistId);

  const { data, error } = await supabase
    .from("stylist_availability")
    .select("*")
    .eq("stylist_id", stylistId)
    .order("day_of_week");

  if (error) {
    console.error("Error fetching availability:", error);
    return getDefaultAvailability(stylistId);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = data as any[] | null;

  return (rows ?? []).map((row) => {
    const slots: string[] = Array.isArray(row.slots) ? row.slots : [];
    return {
      id: row.id,
      stylistId: row.stylist_id,
      dayOfWeek: row.day_of_week,
      startTime: row.start_time,
      endTime: row.end_time,
      isAvailable: row.is_available,
      // Fall back to sensible generated times if the stylist hasn't set any yet
      slots: slots.length
        ? slots
        : generateTimeSlots(row.start_time, row.end_time, DEFAULT_SLOT_INTERVAL_MINUTES),
    };
  });
}

function getDefaultAvailability(stylistId: string): StylistAvailability[] {
  return Array.from({ length: 7 }, (_, i) => ({
    id: `default-${i}`,
    stylistId,
    dayOfWeek: i,
    startTime: "09:00",
    endTime: "21:00",
    isAvailable: i !== 0, // Sunday off
    slots: generateTimeSlots("09:00", "21:00", DEFAULT_SLOT_INTERVAL_MINUTES),
  }));
}

// ---- Date-specific ("released") availability ----

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDateAvailability(row: any): DateAvailability {
  return {
    id: row.id,
    stylistId: row.stylist_id,
    date: row.date,
    slots: Array.isArray(row.slots) ? row.slots : [],
    isOpen: row.is_open,
  };
}

// All future released dates for a stylist (used by the customer date picker)
export async function fetchReleasedDates(
  stylistId: string
): Promise<DateAvailability[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const { data, error } = await supabase
    .from("stylist_date_availability")
    .select("*")
    .eq("stylist_id", stylistId)
    .eq("is_open", true)
    .gte("date", todayStr)
    .order("date");

  if (error) {
    console.error("Error fetching released dates:", error);
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((data as any[]) ?? []).map(mapDateAvailability);
}

// A single date's availability (null if the stylist hasn't released it)
export async function fetchDateAvailability(
  stylistId: string,
  date: string
): Promise<DateAvailability | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("stylist_date_availability")
    .select("*")
    .eq("stylist_id", stylistId)
    .eq("date", date)
    .maybeSingle();

  if (error) {
    console.error("Error fetching date availability:", error);
    return null;
  }

  return data ? mapDateAvailability(data) : null;
}

// Release (open) a date with a set of times, or update an already-released date
export async function releaseDate(
  stylistId: string,
  date: string,
  slots: string[]
): Promise<{ error?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { error: "Database not configured." };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("stylist_date_availability")
    .upsert(
      {
        stylist_id: stylistId,
        date,
        slots,
        is_open: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "stylist_id,date" }
    );

  if (error) {
    console.error("Error releasing date:", error);
    return { error: error.message || "Failed to release date." };
  }

  return {};
}

// Close (un-release) a date so it's no longer bookable
export async function unreleaseDate(
  stylistId: string,
  date: string
): Promise<{ error?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { error: "Database not configured." };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("stylist_date_availability")
    .delete()
    .eq("stylist_id", stylistId)
    .eq("date", date);

  if (error) {
    console.error("Error un-releasing date:", error);
    return { error: error.message || "Failed to close date." };
  }

  return {};
}

// Fetch bookings for a stylist on a specific date
export async function fetchBookingsForDate(
  stylistId: string,
  date: string
): Promise<Booking[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("stylist_id", stylistId)
    .eq("booking_date", date)
    .neq("status", "cancelled");

  if (error) {
    console.error("Error fetching bookings:", error);
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((row: any) => ({
    id: row.id,
    stylistId: row.stylist_id,
    serviceId: row.service_name,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    bookingDate: row.booking_date,
    startTime: row.start_time,
    endTime: row.end_time,
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
    paymentOption: row.payment_option ?? "full",
    depositAmount: row.deposit_amount ?? 0,
    totalPrice: row.total_price ?? row.service_price ?? 0,
    serviceName: row.service_name,
    servicePrice: row.service_price,
  }));
}

// Fetch upcoming bookings for a stylist
export async function fetchUpcomingBookings(
  stylistId: string
): Promise<Booking[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("stylist_id", stylistId)
    .gte("booking_date", today)
    .neq("status", "cancelled")
    .order("booking_date")
    .order("start_time");

  if (error) {
    console.error("Error fetching bookings:", error);
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((row: any) => ({
    id: row.id,
    stylistId: row.stylist_id,
    serviceId: row.service_name,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    bookingDate: row.booking_date,
    startTime: row.start_time,
    endTime: row.end_time,
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
    paymentOption: row.payment_option ?? "full",
    depositAmount: row.deposit_amount ?? 0,
    totalPrice: row.total_price ?? row.service_price ?? 0,
    serviceName: row.service_name,
    servicePrice: row.service_price,
  }));
}

// Fetch blocked times for a date
export async function fetchBlockedTimes(
  stylistId: string,
  date: string
): Promise<BlockedTime[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("blocked_times")
    .select("*")
    .eq("stylist_id", stylistId)
    .eq("blocked_date", date);

  if (error) {
    console.error("Error fetching blocked times:", error);
    return [];
  }

  const rows = data as BlockedTimeRow[] | null;

  return (rows ?? []).map((row) => ({
    id: row.id,
    stylistId: row.stylist_id,
    blockedDate: row.blocked_date,
    startTime: row.start_time,
    endTime: row.end_time,
    reason: row.reason,
  }));
}

// Get available time slots for a date
export async function getAvailableSlots(
  stylistId: string,
  date: string,
  serviceDurationMins: number
): Promise<TimeSlot[]> {
  const supabase = getSupabase();

  let candidateSlots: string[];

  if (supabase) {
    // Only dates the stylist has released are bookable
    const dateAvailability = await fetchDateAvailability(stylistId, date);
    if (!dateAvailability || !dateAvailability.isOpen) {
      return [];
    }
    candidateSlots = dateAvailability.slots;
  } else {
    // Local/sample mode: fall back to the weekly template
    const dayOfWeek = new Date(date).getDay();
    const availability = await fetchStylistAvailability(stylistId);
    const dayAvailability = availability.find((a) => a.dayOfWeek === dayOfWeek);
    if (!dayAvailability || !dayAvailability.isAvailable) {
      return [];
    }
    candidateSlots = dayAvailability.slots;
  }

  const allSlots = [...candidateSlots].sort();

  // Get existing bookings
  const bookings = await fetchBookingsForDate(stylistId, date);
  const blockedTimes = await fetchBlockedTimes(stylistId, date);

  // Check each slot
  return allSlots.map((slotTime) => {
    const slotStart = timeToMinutes(slotTime);
    const slotEnd = slotStart + serviceDurationMins;

    // Check if slot overlaps with any booking
    const hasBookingConflict = bookings.some((booking) => {
      const bookingStart = timeToMinutes(booking.startTime);
      const bookingEnd = timeToMinutes(booking.endTime);
      return slotStart < bookingEnd && slotEnd > bookingStart;
    });

    // Check if slot overlaps with blocked time
    const hasBlockedConflict = blockedTimes.some((blocked) => {
      if (!blocked.startTime || !blocked.endTime) return true; // Whole day blocked
      const blockedStart = timeToMinutes(blocked.startTime);
      const blockedEnd = timeToMinutes(blocked.endTime);
      return slotStart < blockedEnd && slotEnd > blockedStart;
    });

    return {
      time: slotTime,
      label: formatTime(slotTime),
      available: !hasBookingConflict && !hasBlockedConflict,
    };
  });
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(mins: number): string {
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

// Create a booking
export async function createBooking(
  stylistId: string,
  data: BookingFormData,
  serviceDurationMins: number
): Promise<{ booking?: Booking; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { error: "Database not configured" };
  }

  const startTime = data.time;
  const endTime = minutesToTime(timeToMinutes(startTime) + serviceDurationMins);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: result, error } = await (supabase as any)
    .from("bookings")
    .insert({
      stylist_id: stylistId,
      service_name: data.serviceId, // This is actually the service name
      service_price: data.servicePrice,
      customer_name: data.customerName,
      customer_email: data.customerEmail,
      customer_phone: data.customerPhone,
      booking_date: data.date,
      start_time: startTime,
      end_time: endTime,
      notes: data.notes,
      status: "confirmed",
      payment_option: data.paymentOption,
      deposit_amount: data.depositAmount,
      total_price: data.totalPrice,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating booking:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    return {
      error:
        error.message ||
        "Failed to create booking. Please try again.",
    };
  }

  return {
    booking: {
      id: result.id,
      stylistId: result.stylist_id,
      serviceId: result.service_name,
      customerName: result.customer_name,
      customerEmail: result.customer_email,
      customerPhone: result.customer_phone,
      bookingDate: result.booking_date,
      startTime: result.start_time,
      endTime: result.end_time,
      status: result.status,
      notes: result.notes,
      createdAt: result.created_at,
      paymentOption: result.payment_option ?? data.paymentOption,
      depositAmount: result.deposit_amount ?? data.depositAmount,
      totalPrice: result.total_price ?? data.totalPrice,
    },
  };
}

// Update stylist availability
export async function updateAvailability(
  stylistId: string,
  dayOfWeek: number,
  data: {
    startTime?: string;
    endTime?: string;
    isAvailable?: boolean;
    slots?: string[];
  }
): Promise<{ error?: string }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { error: "Database not configured" };
  }

  const updateData: Record<string, unknown> = {};
  if (data.startTime !== undefined) updateData.start_time = data.startTime;
  if (data.endTime !== undefined) updateData.end_time = data.endTime;
  if (data.isAvailable !== undefined) updateData.is_available = data.isAvailable;
  if (data.slots !== undefined) updateData.slots = data.slots;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("stylist_availability")
    .upsert({
      stylist_id: stylistId,
      day_of_week: dayOfWeek,
      ...updateData,
    }, {
      onConflict: "stylist_id,day_of_week",
    });

  if (error) {
    console.error("Error updating availability:", error);
    return { error: "Failed to update availability" };
  }

  return {};
}

// Cancel a booking
export async function cancelBooking(
  bookingId: string
): Promise<{ error?: string }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { error: "Database not configured" };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", bookingId);

  if (error) {
    console.error("Error cancelling booking:", error);
    return { error: "Failed to cancel booking" };
  }

  return {};
}
