"use client";

import { normaliseBookingUrl, normaliseInstagramUrl } from "@/types/stylist";
import type { Stylist } from "@/types/stylist";

interface ProfileBookingBarProps {
  stylist: Stylist;
}

export function ProfileBookingBar({ stylist }: ProfileBookingBarProps) {
  const bookingUrl = stylist.bookingUrl
    ? normaliseBookingUrl(stylist.bookingUrl)
    : null;
  const instagramUrl = normaliseInstagramUrl(stylist.instagramUrl);
  const firstName = stylist.name.split(" ")[0];
  const verified = Boolean(stylist.verified);

  return (
    <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-lg -translate-x-1/2 border-t border-gray-100 bg-white/95 px-5 py-4 backdrop-blur-md safe-bottom">
      {/* Contact / external links */}
      {(bookingUrl || instagramUrl) && (
        <div className="mb-2 flex gap-2">
          {bookingUrl && (
            <a
              href={bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-600 px-6 py-3 text-base font-medium text-white shadow-sm transition-all hover:bg-brand-700 active:bg-brand-800"
            >
              Book with {firstName}
              <span className="material-symbols-outlined text-[18px]">
                open_in_new
              </span>
            </a>
          )}
          {instagramUrl && (
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${firstName} on Instagram`}
              className={`flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 px-4 py-3 text-base font-medium text-gray-700 transition-colors hover:bg-gray-50 ${
                bookingUrl ? "" : "flex-1"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                photo_camera
              </span>
              {!bookingUrl && "Instagram"}
            </a>
          )}
        </div>
      )}

      {/* In-app booking is disabled for now (directory mode). Kept greyed out
          so we can re-enable it once professionals are onboarded. */}
      <button
        type="button"
        disabled
        aria-disabled="true"
        title="In-app booking is coming soon"
        className="flex w-full cursor-not-allowed items-center justify-center gap-1.5 rounded-xl bg-gray-100 px-6 py-3 text-base font-medium text-gray-400"
      >
        Book Now
        <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
          Coming soon
        </span>
      </button>

      {!verified && (
        <p className="mt-2 flex items-center justify-center gap-1 text-center text-[12px] leading-snug text-gray-400">
          <span className="material-symbols-outlined text-[14px]">lock</span>
          Not yet verified — in-app booking &amp; reviews unlock when {firstName}{" "}
          joins Hair Korter
        </p>
      )}
    </div>
  );
}
