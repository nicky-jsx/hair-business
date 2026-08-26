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

  // Locked teaser for unclaimed listings — reviews unlock once the
  // professional joins Hair Korter.
  if (!verified) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-secondary-fixed">
          <span className="material-symbols-outlined text-2xl text-primary">
            lock
          </span>
        </div>
        <p className="text-sm font-semibold text-on-surface">
          Reviews locked
        </p>
        <p className="mx-auto mt-1.5 max-w-xs text-[13px] leading-relaxed text-on-surface-variant">
          {firstName ? `${firstName} hasn't` : "This professional hasn't"} joined
          Hair Korter yet. Once they claim their profile, verified client reviews
          will appear here.
        </p>
        <span className="mt-4 inline-flex items-center gap-1 rounded-full bg-surface-container px-3 py-1 text-[11px] font-semibold uppercase tracking-caps text-outline">
          <span className="material-symbols-outlined text-[14px]">
            hourglass_empty
          </span>
          Awaiting verification
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center gap-4 rounded-xl bg-surface-container-lowest p-5 shadow-ambient">
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
            {reviewCount} review{reviewCount !== 1 ? "s" : ""}
          </p>
          <p className="mt-0.5 text-[13px] text-on-surface-variant">
            From verified clients
          </p>
        </div>
      </div>

      {/* List */}
      {list.length > 0 ? (
        <div className="space-y-3">
          {list.map((review) => (
            <div
              key={review.id}
              className="rounded-xl bg-surface-container-lowest p-4 shadow-ambient"
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
      ) : (
        <div className="rounded-xl border border-outline-variant bg-transparent p-8 text-center">
          <span className="material-symbols-outlined text-3xl text-outline">
            reviews
          </span>
          <p className="mt-2 text-sm font-medium text-on-surface">
            No reviews yet
          </p>
          <p className="mt-1 text-[13px] text-on-surface-variant">
            Be the first to book and leave a review.
          </p>
        </div>
      )}
    </div>
  );
}
