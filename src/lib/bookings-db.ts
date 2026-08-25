import { getSupabase } from "./supabase";
import { getSessionToken } from "./session";
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapBookingRow(row: any): Booking {
  return {
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
    amountPaid: row.amount_paid ?? undefined,
    paidInFull: row.paid_in_full ?? undefined,
    reference: row.reference ?? undefined,
    serviceName: row.service_name,
    servicePrice: row.service_price,
  };
}

// Turn raw Postgres exceptions from the authorised RPCs into friendly copy.
function friendlyOwnerError(message: string | undefined, fallback: string): string {
  if (!message) return fallback;
  if (message.includes("unauthorized"))
    return "Your session has expired. Please sign in again.";
  if (message.includes("forbidden"))
    return "You don't have permission to change this.";
  return fallback;
}

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
    console.error("Error fetching released dates:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
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

  const token = getSessionToken();
  if (!token) return { error: "Your session has expired. Please sign in again." };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).rpc("release_date", {
    p_token: token,
    p_stylist_id: stylistId,
    p_date: date,
    p_slots: slots,
  });

  if (error) {
    console.error("Error releasing date:", error.message);
    return { error: friendlyOwnerError(error.message, "Failed to release date.") };
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

  const token = getSessionToken();
  if (!token) return { error: "Your session has expired. Please sign in again." };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).rpc("unrelease_date", {
    p_token: token,
    p_stylist_id: stylistId,
    p_date: date,
  });

  if (error) {
    console.error("Error un-releasing date:", error.message);
    return { error: friendlyOwnerError(error.message, "Failed to close date.") };
  }

  return {};
}

// Fetch only the booked start/end times for a date. This uses a
// SECURITY DEFINER RPC that returns NO customer PII, so the public
// booking page can grey out taken slots without exposing who booked.
export async function fetchTakenSlots(
  stylistId: string,
  date: string
): Promise<{ startTime: string; endTime: string }[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc("get_taken_slots", {
    p_stylist_id: stylistId,
    p_date: date,
  });

  if (error) {
    console.error("Error fetching taken slots:", error.message);
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((data as any[]) ?? []).map((row) => ({
    startTime: row.start_time,
    endTime: row.end_time,
  }));
}

// Fetch upcoming bookings for a stylist's own dashboard.
// Uses a per-stylist RPC instead of a blanket public read of the whole
// bookings table.
export async function fetchUpcomingBookings(
  _stylistId?: string
): Promise<Booking[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const token = getSessionToken();
  if (!token) return [];

  // The stylist is derived from the session token server-side, so a caller
  // cannot read another stylist's bookings by passing a different id.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc("get_stylist_bookings", {
    p_token: token,
  });

  if (error) {
    console.error("Error fetching bookings:", error.message);
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map(mapBookingRow);
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

  // Get existing bookings (times only — no customer PII)
  const bookings = await fetchTakenSlots(stylistId, date);
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

// Create a booking
export async function createBooking(
  stylistId: string,
  data: BookingFormData,
  serviceDurationMins: number
): Promise<{ booking?: Booking; manageToken?: string; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { error: "Database not configured" };
  }

  const startTime = data.time;

  // The DB looks up the real service price, computes the deposit from the
  // stylist's own settings, and verifies the slot is released and free.
  // Client-supplied prices/deposits are ignored.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rows, error } = await (supabase as any).rpc("create_booking", {
    p_stylist_id: stylistId,
    p_service_name: data.serviceId, // this is actually the service name
    p_customer_name: data.customerName,
    p_customer_email: data.customerEmail,
    p_customer_phone: data.customerPhone,
    p_date: data.date,
    p_start: startTime,
    p_duration_mins: serviceDurationMins,
    p_payment_option: data.paymentOption,
    p_notes: data.notes ?? null,
  });

  if (error) {
    console.error("Error creating booking:", error.message);
    const msg = error.message || "";
    if (msg.includes("slot_taken"))
      return { error: "Sorry, that time was just booked. Please pick another." };
    if (msg.includes("slot_unavailable"))
      return { error: "That time isn't available. Please pick another." };
    if (msg.includes("invalid_service"))
      return { error: "That service is no longer available." };
    if (msg.includes("invalid_email"))
      return { error: "Please enter a valid email address." };
    if (msg.includes("invalid_customer"))
      return { error: "Please enter your name." };
    return { error: "Failed to create booking. Please try again." };
  }

  const result = Array.isArray(rows) ? rows[0] : rows;
  if (!result) return { error: "Failed to create booking. Please try again." };

  const booking = mapBookingRow(result);
  // The caller saves the manage link (id + token) in the browser.
  return { booking, manageToken: result.manage_token as string | undefined };
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

  const token = getSessionToken();
  if (!token) return { error: "Your session has expired. Please sign in again." };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).rpc("update_availability", {
    p_token: token,
    p_stylist_id: stylistId,
    p_day: dayOfWeek,
    p_is_available: data.isAvailable ?? null,
    p_slots: data.slots ?? null,
  });

  if (error) {
    console.error("Error updating availability:", error.message);
    return { error: friendlyOwnerError(error.message, "Failed to update availability") };
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

  const token = getSessionToken();
  if (!token) return { error: "Your session has expired. Please sign in again." };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).rpc("cancel_booking", {
    p_token: token,
    p_booking_id: bookingId,
  });

  if (error) {
    console.error("Error cancelling booking:", error.message);
    return { error: friendlyOwnerError(error.message, "Failed to cancel booking") };
  }

  return {};
}

// Stylist marks an appointment completed / no-show (owner-checked in the DB)
export async function setBookingStatus(
  bookingId: string,
  status: "completed" | "no_show" | "confirmed"
): Promise<{ error?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { error: "Database not configured" };

  const token = getSessionToken();
  if (!token) return { error: "Your session has expired. Please sign in again." };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).rpc("set_booking_status", {
    p_token: token,
    p_booking_id: bookingId,
    p_status: status,
  });

  if (error) {
    console.error("Error updating booking status:", error.message);
    return { error: friendlyOwnerError(error.message, "Failed to update booking") };
  }

  return {};
}
