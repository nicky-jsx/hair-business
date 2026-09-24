import Link from "next/link";
import type { Stylist } from "@/types/stylist";

interface ClaimProfileBannerProps {
  stylist: Stylist;
}

export function ClaimProfileBanner({ stylist }: ClaimProfileBannerProps) {
  if (stylist.verified) return null;

  const firstName = stylist.name.split(" ")[0];

  return (
    <section className="relative overflow-hidden rounded-2xl border border-secondary/30 bg-gradient-to-br from-[#2a241c] via-[#1f1b16] to-[#171411] p-5 text-white shadow-ambient">
      {/* Subtle decorative glow */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-secondary-fixed/10 blur-2xl" />

      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-secondary-fixed/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-caps text-secondary-fixed">
            <span className="material-symbols-outlined text-[13px]">
              lock_open
            </span>
            Profile Unclaimed
          </div>

          <h2 className="font-display text-lg font-semibold tracking-tight text-[#fbf9f8]">
            Is this your business, {firstName}?
          </h2>

          <p className="max-w-md text-[13px] leading-relaxed text-[#d7cebf]">
            This profile is currently unclaimed. Claim and unlock your profile
            to showcase your portfolio, manage your services &amp; pricing, and
            collect verified client reviews.
          </p>
        </div>

        <Link
          href={`/stylist/claim?id=${stylist.id}`}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-secondary-fixed px-5 py-3 text-xs font-bold uppercase tracking-caps text-primary shadow-sm transition-all hover:bg-[#ffe7bf] active:scale-[0.98]"
        >
          <span>Claim Profile</span>
          <span className="material-symbols-outlined text-sm font-bold">
            arrow_forward
          </span>
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-white/10 pt-3 text-[11px] text-[#a8a49c]">
        <span className="inline-flex items-center gap-1">
          <span className="material-symbols-outlined text-[13px] text-secondary-fixed">
            check_circle
          </span>
          Verified Specialist Badge
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="material-symbols-outlined text-[13px] text-secondary-fixed">
            photo_library
          </span>
          High-Res Portfolio Grid
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="material-symbols-outlined text-[13px] text-secondary-fixed">
            calendar_today
          </span>
          Direct Bookings &amp; Deposits
        </span>
      </div>
    </section>
  );
}
