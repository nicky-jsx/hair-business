import Image from "next/image";
import Link from "next/link";
import { normaliseInstagramUrl } from "@/types/stylist";

interface ProfilePortfolioProps {
  photos: string[];
  stylistName: string;
  instagramUrl?: string | null;
  stylistId?: string;
  verified?: boolean;
}

export function ProfilePortfolio({
  photos,
  stylistName,
  instagramUrl,
  stylistId,
  verified = false,
}: ProfilePortfolioProps) {
  if (photos.length === 0) {
    const igUrl = normaliseInstagramUrl(instagramUrl);
    const igHandle = instagramUrl?.replace(/^https?:\/\/(www\.)?instagram\.com\//i, "@").replace(/\/$/, "");
    const firstName = stylistName.split(" ")[0];

    return (
      <div className="space-y-6">
        {/* Instagram Portfolio Showcase */}
        {igUrl ? (
          <div className="rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-6 shadow-ambient">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-secondary-fixed text-primary">
                <span className="material-symbols-outlined text-2xl">
                  photo_camera
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-caps text-secondary">
                    Official Portfolio
                  </span>
                  <span className="h-1 w-1 rounded-full bg-outline-variant" />
                  <span className="text-[12px] text-outline">Instagram</span>
                </div>
                <a
                  href={igUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-0.5 inline-flex items-center gap-1 font-display text-lg font-semibold text-primary hover:text-secondary transition-colors group"
                >
                  <span>{igHandle || `@${firstName.toLowerCase()}`}</span>
                  <span className="material-symbols-outlined text-base text-secondary transition-transform group-hover:translate-x-0.5">
                    open_in_new
                  </span>
                </a>
                <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">
                  {firstName}&apos;s full lookbook and latest client transformations
                  are actively updated on Instagram.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-6 text-center shadow-ambient">
            <span className="material-symbols-outlined text-3xl text-outline mb-2">
              photo_camera
            </span>
            <h3 className="font-display text-base font-semibold text-primary">
              Portfolio In Curation
            </h3>
            <p className="mx-auto mt-1 max-w-sm text-sm text-on-surface-variant">
              This specialist&apos;s lookbook is currently in curation for the London directory.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {photos.map((photo, index) => (
        <div
          key={photo}
          className={`relative overflow-hidden rounded-md bg-surface-container ${
            index === 0 ? "col-span-2 aspect-[16/10]" : "aspect-square"
          }`}
        >
          <Image
            src={photo}
            alt={`${stylistName} portfolio ${index + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 512px) 50vw, 256px"
          />
        </div>
      ))}
    </div>
  );
}
