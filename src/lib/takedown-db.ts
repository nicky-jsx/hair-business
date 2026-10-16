import { getSupabase } from "./supabase";

export interface TakedownRequestInput {
  businessName: string;
  requesterName: string;
  email: string;
  reason: string;
  details?: string;
  profileId?: string | null;
}

function friendlyTakedownError(message?: string): string {
  const msg = message || "";
  if (msg.includes("rate_limited"))
    return "Too many requests. Please wait a while and try again.";
  if (msg.includes("invalid_email")) return "Please enter a valid email address.";
  if (msg.includes("invalid_business"))
    return "Please enter the business name or stylist handle.";
  if (msg.includes("invalid_name")) return "Please enter your name.";
  if (msg.includes("details_too_long"))
    return "Please keep the details under 3,000 characters.";
  return "We couldn't submit your request. Please try again.";
}

// Stores a removal / copyright / report request for the team to action.
export async function submitTakedownRequest(
  input: TakedownRequestInput
): Promise<{ error?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { error: "Service unavailable. Please try again later." };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).rpc("submit_takedown_request", {
    p_business_name: input.businessName,
    p_requester_name: input.requesterName,
    p_email: input.email,
    p_reason: input.reason,
    p_details: input.details || null,
    p_profile_id: input.profileId || null,
  });

  if (error) {
    console.error("Error submitting takedown request:", error.message);
    return { error: friendlyTakedownError(error.message) };
  }
  return {};
}
