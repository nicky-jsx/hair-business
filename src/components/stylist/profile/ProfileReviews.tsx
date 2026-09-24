import type { Review } from "@/types/stylist";

interface ProfileReviewsProps {
  reviews?: Review[];
  rating: number;
  reviewCount: number;
  verified?: boolean;
  stylistName?: string;
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`material-symbols-outlined text-[16px] ${
            i < Math.round(rating) ? "fill text-amber-400" : "text-outline-variant"
          }`}
        >
          star
        </span>
      ))}
    </span>
  );
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
  });
}

export function ProfileReviews({
  reviews,
  rating,
  reviewCount,
  verified = false,
  stylistName,
}: ProfileReviewsProps) {
  const list = reviews ?? [];
  const firstName = stylistName?.split(" ")[0];

  if (list.length > 0) {
    return (
      <div className="space-y-4">
        {/* Summary */}
        <div className="flex items-center gap-4 rounded-xl border border-outline-variant/50 bg-surface-container-lowest p-5 shadow-ambient">
          <div className="text-center">
            <p className="font-display text-3xl font-semibold text-primary">
              {rating.toFixed(1)}
            </p>
            <div className="mt-1">
              <Stars rating={rating} />
            </div>
          </div>
          <div className="h-12 w-px bg-outline-variant" />
          <div>
            <p className="text-sm font-semibold text-on-surface">
              {reviewCount || list.length} review{(reviewCount || list.length) !== 1 ? "s" : ""}
            </p>
            <p className="mt-0.5 text-[13px] text-on-surface-variant">
              From verified appointments
            </p>
          </div>
        </div>

        {/* List */}
        <div className="space-y-3">
          {list.map((review) => (
            <div
              key={review.id}
              className="rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-4 shadow-ambient"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-fixed text-[13px] font-semibold text-primary">
                  {initials(review.reviewerName)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-on-surface">
                    {review.reviewerName}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <Stars rating={review.rating} />
                    {review.createdAt && (
                      <span className="text-[11px] text-outline">
                        {formatDate(review.createdAt)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {review.comment && (
                <p className="mt-3 text-[14px] leading-relaxed text-on-surface-variant">
                  {review.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-8 text-center shadow-ambient">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary-fixed text-primary">
        <span className="material-symbols-outlined text-2xl">
          rate_review
        </span>
      </div>
      <h3 className="font-display text-base font-semibold text-primary">
        Client Reviews
      </h3>
      <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-on-surface-variant">
        No client reviews have been published on Hair Korter yet. Verified reviews will appear here once booked clients complete their appointments.
      </p>
      <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-surface-container px-3.5 py-1 text-[11px] font-medium text-outline">
        <span className="material-symbols-outlined text-[14px]">
          verified
        </span>
        Hair Korter Verified Reviews
      </div>
    </div>
  );
}
