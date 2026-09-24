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
    <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-outline-variant/40 bg-background/95 px-5 py-3.5 backdrop-blur-md safe-bottom shadow-lg">
      {/* Contact / external links */}
      {(bookingUrl || instagramUrl) && (
        <div className="mb-2 flex gap-2">
          {bookingUrl && (
            <a
              href={bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold uppercase tracking-caps text-background shadow-sm transition-opacity hover:opacity-90 active:scale-[0.99]"
            >
              <span>Book with {firstName}</span>
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
              className={`flex items-center justify-center gap-1.5 rounded-xl border border-outline-variant/70 bg-surface-container-lowest px-4 py-2.5 text-sm font-medium text-on-surface transition-colors hover:bg-surface-container-low ${
                bookingUrl ? "" : "flex-1"
              }`}
            >
              <span className="material-symbols-outlined text-[18px] text-secondary">
                photo_camera
              </span>
              <span>{!bookingUrl ? `View Instagram (@${firstName.toLowerCase()})` : "Instagram"}</span>
            </a>
          )}
        </div>
      )}

      {/* Claim callout for unclaimed listings */}
      {!verified ? (
        <div className="mt-2 flex items-center justify-between rounded-xl bg-secondary-fixed/25 px-3 py-2 text-xs">
          <div className="flex items-center gap-1.5 text-primary">
            <span className="material-symbols-outlined text-sm text-secondary">
              verified
            </span>
            <span className="font-medium">Is this your business?</span>
          </div>
          <a
            href={`/stylist/claim?id=${stylist.id}`}
            className="font-bold uppercase tracking-caps text-secondary underline hover:text-primary transition-colors"
          >
            Claim Profile &rarr;
          </a>
        </div>
      ) : (
        <button
          type="button"
          disabled
          aria-disabled="true"
          title="In-app booking is coming soon"
          className="flex w-full cursor-not-allowed items-center justify-center gap-1.5 rounded-xl bg-surface-container px-6 py-2.5 text-sm font-medium text-outline"
        >
          Book Appointment
          <span className="rounded-full bg-surface-container-high px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-on-surface-variant">
            Direct
          </span>
        </button>
      )}
    </div>
  );
}
