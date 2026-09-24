import Image from "next/image";
import Link from "next/link";
import { formatRegion } from "@/types/stylist";
import type { Stylist } from "@/types/stylist";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";

interface ProfileHeaderProps {
  stylist: Stylist;
}

export function ProfileHeader({ stylist }: ProfileHeaderProps) {
  const primarySpecialty = stylist.specialties?.[0] || formatRegion(stylist.region);

  return (
    <>
      <div className="relative h-56 bg-surface-container overflow-hidden">
        {stylist.coverImage ? (
          <Image
            src={stylist.coverImage}
            alt=""
            fill
            className="object-cover"
            priority
            sizes="512px"
          />
        ) : (
          <div className="relative h-full w-full bg-gradient-to-br from-[#1c1917] via-[#24201c] to-[#161412]">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-secondary-fixed/10 via-transparent to-transparent" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

        {/* Back navigation */}
        <Link
          href="/stylists"
          aria-label="Back to directory"
          className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-black/60"
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
        </Link>

        {/* Curated status tag on cover */}
        <div className="absolute right-4 top-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1 text-[11px] font-medium tracking-wide text-[#fbf9f8] backdrop-blur-md">
            <span className="material-symbols-outlined text-[14px] text-secondary-fixed">
              {stylist.verified ? "verified" : "hotel_class"}
            </span>
            {stylist.verified ? "Verified Specialist" : "Curated Profile"}
          </span>
        </div>
      </div>

      <div className="relative px-5">
        <div className={`${stylist.avatar ? "-mt-14 mb-4" : "mt-3 mb-2"} flex items-end justify-between`}>
          {stylist.avatar && (
            <div className="relative h-24 w-24 overflow-hidden rounded-2xl bg-surface-container-high ring-4 ring-background shadow-card">
              <Image
                src={stylist.avatar}
                alt={stylist.name}
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>
          )}
          <span className="rounded-full bg-surface-container-lowest px-3 py-1 text-xs font-semibold uppercase tracking-caps text-on-surface shadow-sm border border-outline-variant/30 ml-auto">
            {stylist.priceRange}
          </span>
        </div>

        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-primary">
              {stylist.name}
            </h1>
            <p className="mt-1 text-sm font-medium text-secondary">
              {stylist.tagline}
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-on-surface-variant">
          <span className="inline-flex items-center gap-1 font-medium">
            <span className="material-symbols-outlined text-[14px] text-outline">
              location_on
            </span>
            {formatRegion(stylist.region)}
          </span>
          {stylist.yearsExperience > 0 && (
            <>
              <span className="text-outline-variant">•</span>
              <span>{stylist.yearsExperience} yrs experience</span>
            </>
          )}
          <span className="text-outline-variant">•</span>
          <span className="inline-flex items-center gap-1 text-outline">
            <span className="material-symbols-outlined text-[13px]">
              local_library
            </span>
            London Directory
          </span>
        </div>
      </div>
    </>
  );
}
