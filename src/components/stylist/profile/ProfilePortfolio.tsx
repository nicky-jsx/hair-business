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
                <h3 className="mt-0.5 font-display text-lg font-semibold text-primary">
                  {igHandle || `@${firstName.toLowerCase()}`}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">
                  {firstName}&apos;s full lookbook and latest client transformations
                  are actively updated on Instagram.
                </p>

                <a
                  href={igUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-caps text-background transition-opacity hover:opacity-90 active:scale-[0.99]"
                >
                  <span className="material-symbols-outlined text-base">
                    open_in_new
                  </span>
                  Explore Instagram Lookbook
                </a>
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
              This listing is currently in our London directory registry.
            </p>
          </div>
        )}

        {/* Locked In-App Gallery Preview */}
        {!verified && (
          <div className="relative overflow-hidden rounded-2xl border border-dashed border-outline-variant bg-surface-container-low/50 p-6 text-center">
            {/* Background faux gallery tiles with blur */}
            <div className="pointer-events-none mb-4 grid grid-cols-3 gap-2 opacity-25 filter blur-[1px]">
              <div className="aspect-square rounded-lg bg-surface-container-high" />
              <div className="aspect-square rounded-lg bg-surface-container" />
              <div className="aspect-square rounded-lg bg-surface-container-high" />
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-surface-container text-primary">
                <span className="material-symbols-outlined text-xl">lock</span>
              </div>
              <p className="text-sm font-semibold text-primary">
                Direct Portfolio Gallery
              </p>
              <p className="mt-1 max-w-xs text-xs leading-relaxed text-on-surface-variant">
                High-definition in-app photo grids unlock once {firstName} claims
                this profile and uploads client styles.
              </p>

              {stylistId && (
                <Link
                  href={`/stylist/claim?id=${stylistId}`}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-secondary hover:underline"
                >
                  <span>Are you {firstName}? Unlock your gallery here</span>
                  <span className="material-symbols-outlined text-sm">
                    arrow_forward
                  </span>
                </Link>
              )}
            </div>
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
