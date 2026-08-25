// Customer-side booking management. Customers have no accounts, so after
// booking we save a "manage" link (booking id + strong token) in this
// browser. All privileged actions are still verified server-side by the
// manage token — this is only a convenience store.

import { getSupabase } from "./supabase";
import { mapBookingRow } from "./bookings-db";
import type { Booking } from "@/types/booking";

const KEY = "hk_my_bookings";

export interface SavedBooking {
  id: string;
  token: string;
  reference: string;
}

export function saveManagedBooking(entry: SavedBooking): void {
  if (typeof window === "undefined") return;
  try {
    const list = getSavedBookings().filter((b) => b.id !== entry.id);
    list.unshift(entry);
    window.localStorage.setItem(KEY, JSON.stringify(list.slice(0, 20)));
  } catch {
    // ignore
  }
}

export function getSavedBookings(): SavedBooking[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SavedBooking[]) : [];
  } catch {
    return [];
  }
}

export function getSavedToken(bookingId: string): string | null {
  return getSavedBookings().find((b) => b.id === bookingId)?.token ?? null;
}

export function manageBookingUrl(id: string, token: string): string {
  return `/booking/manage?id=${encodeURIComponent(id)}&t=${encodeURIComponent(token)}`;
}

function friendly(message: string | undefined, fallback: string): string {
  const msg = message || "";
  if (msg.includes("unauthorized")) return "This link is no longer valid.";
  if (msg.includes("not_found")) return "We couldn't find that booking.";
  if (msg.includes("slot_taken"))
    return "That time was just taken. Please pick another.";
  if (msg.includes("slot_unavailable"))
    return "That time isn't available. Please pick another.";
  if (msg.includes("already_reviewed"))
    return "You've already reviewed this appointment.";
  if (msg.includes("not_eligible"))
    return "You can leave a review once your appointment has taken place.";
  if (msg.includes("invalid_rating")) return "Please choose a star rating.";
  return fallback;
}

export async function getManagedBooking(
  id: string,
  token: string
): Promise<Booking | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc("get_managed_booking", {
    p_booking_id: id,
    p_token: token,
  });
  if (error) return null;
  const row = Array.isArray(data) ? data[0] : data;
  return row ? mapBookingRow(row) : null;
}

export async function recoverBooking(
  reference: string,
  email: string
): Promise<{ id?: string; token?: string; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { error: "Database not configured." };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc("recover_booking", {
    p_reference: reference.trim(),
    p_email: email.trim(),
  });
  if (error)
    return {
      error: friendly(error.message, "We couldn't find a matching booking."),
    };
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return { error: "We couldn't find a matching booking." };
  const result = { id: row.booking_id as string, token: row.manage_token as string };
  saveManagedBooking({ id: result.id, token: result.token, reference: reference.trim() });
  return result;
}

export async function cancelMyBooking(
  id: string,
  token: string
): Promise<{ error?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { error: "Database not configured." };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).rpc("cancel_managed_booking", {
    p_booking_id: id,
    p_token: token,
  });
  if (error) return { error: friendly(error.message, "Failed to cancel.") };
  return {};
}

export async function rescheduleMyBooking(
  id: string,
  token: string,
  newDate: string,
  newStart: string,
  durationMins: number
): Promise<{ error?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { error: "Database not configured." };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).rpc("reschedule_managed_booking", {
    p_booking_id: id,
    p_token: token,
    p_new_date: newDate,
    p_new_start: newStart,
    p_duration_mins: durationMins,
  });
  if (error) return { error: friendly(error.message, "Failed to reschedule.") };
  return {};
}

export async function payMyBalance(
  id: string,
  token: string
): Promise<{ error?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { error: "Database not configured." };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).rpc("pay_balance", {
    p_booking_id: id,
    p_token: token,
  });
  if (error) return { error: friendly(error.message, "Payment failed.") };
  return {};
}

export async function submitReview(
  id: string,
  token: string,
  rating: number,
  comment: string
): Promise<{ error?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { error: "Database not configured." };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).rpc("submit_review", {
    p_booking_id: id,
    p_token: token,
    p_rating: rating,
    p_comment: comment,
  });
  if (error) return { error: friendly(error.message, "Failed to submit review.") };
  return {};
}
