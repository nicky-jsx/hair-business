import Image from "next/image";
import Link from "next/link";
import { formatRegion } from "@/types/stylist";
import type { Stylist } from "@/types/stylist";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";

interface StylistCardProps {
  stylist: Stylist;
  variant?: "default" | "compact" | "featured";
}

function getStartingPrice(stylist: Stylist): string {
  if (stylist.services && stylist.services.length > 0) {
    const min = Math.min(...stylist.services.map((s) => s.price));
    if (min > 0) return `From £${min}`;
  }
  const bioMatch = stylist.bio?.match(/£(\d+)/);
  if (bioMatch) {
    const num = parseInt(bioMatch[1], 10);
    if (!isNaN(num) && num > 0) return `From £${num}`;
  }
  return stylist.priceRange || "££";
}

export function StylistCard({ stylist, variant = "default" }: StylistCardProps) {
  const primarySpecialty = stylist.specialties?.[0] || formatRegion(stylist.region);
  const startingPrice = getStartingPrice(stylist);

  if (variant === "featured") {
    return (
      <Link
        href={`/stylists/${stylist.id}`}
        className="group relative flex w-72 flex-shrink-0 flex-col overflow-hidden rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-3 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-secondary/40 hover:shadow-card-hover cursor-pointer"
      >
        <div className="relative mb-3 aspect-[4/5] w-full overflow-hidden rounded-xl bg-surface-container">
          {stylist.coverImage ? (
            <Image
              src={stylist.coverImage}
              alt={stylist.name}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="288px"
            />
          ) : (
            <PlaceholderImage
              name={stylist.name}
              textClassName="text-3xl"
              subtitle={primarySpecialty}
            />
          )}

          {/* Bottom vignette */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

          {/* Status tag */}
          <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-semibold tracking-caps uppercase text-[#e9e4dc] backdrop-blur-md border border-white/10">
            <span className="material-symbols-outlined text-[12px] text-secondary-fixed">
              {stylist.verified ? "verified" : "hotel_class"}
            </span>
            {stylist.verified ? "Verified" : "Curated"}
          </span>

          {/* Price badge on image */}
          <span className="absolute bottom-2.5 left-2.5 rounded-md bg-white/95 px-2 py-0.5 text-[11px] font-bold text-primary backdrop-blur-sm shadow-xs">
            {startingPrice}
          </span>

          {/* Rating badge on image */}
          {stylist.rating > 0 && (
            <span className="absolute bottom-2.5 right-2.5 flex items-center gap-1 rounded-md bg-black/65 px-2 py-0.5 text-[11px] font-semibold text-[#fbf9f8] backdrop-blur-sm">
              <span className="material-symbols-outlined fill text-[13px] text-secondary-fixed">
                star
              </span>
              <span>{stylist.rating.toFixed(1)}</span>
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col justify-between">
          <div>
            <h3 className="font-display text-base font-bold text-primary transition-colors group-hover:text-secondary leading-snug break-normal [text-wrap:balance]">
              {stylist.name}
            </h3>
            <p className="mt-0.5 text-[12px] text-on-surface-variant truncate">
              {stylist.tagline}
            </p>
            <div className="mt-1 flex items-center gap-1 text-[11px] text-outline">
              <span className="material-symbols-outlined text-[13px] text-secondary">
                location_on
              </span>
              <span>{formatRegion(stylist.region)}</span>
              <span>•</span>
              <span className="text-secondary font-medium">
                {stylist.specialties && stylist.specialties.length > 0
                  ? stylist.specialties.slice(0, 2).join(" • ")
                  : primarySpecialty}
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link
        href={`/stylists/${stylist.id}`}
        className="group flex w-40 shrink-0 flex-col overflow-hidden rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-2 shadow-card transition-all hover:border-secondary/40"
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-surface-container mb-2">
          {stylist.avatar ? (
            <Image
              src={stylist.avatar}
              alt={stylist.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="160px"
            />
          ) : (
            <PlaceholderImage
              name={stylist.name}
              textClassName="text-2xl"
              subtitle={primarySpecialty}
            />
          )}
        </div>
        <div>
          <h3 className="font-display text-xs font-bold text-primary leading-snug break-normal [text-wrap:balance]">
            {stylist.name}
          </h3>
          <p className="text-[10px] text-on-surface-variant truncate">
            {formatRegion(stylist.region)} • {startingPrice}
          </p>
        </div>
      </Link>
    );
  }

  // Default Grid Card
  return (
    <Link
      href={`/stylists/${stylist.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-2.5 sm:p-3 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-secondary/50 hover:shadow-card-hover cursor-pointer"
    >
      <div className="relative mb-2.5 aspect-[4/5] w-full overflow-hidden rounded-xl bg-surface-container">
        {stylist.coverImage ? (
          <Image
            src={stylist.coverImage}
            alt={stylist.name}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
          />
        ) : (
          <PlaceholderImage
            name={stylist.name}
            textClassName="text-3xl"
            subtitle={primarySpecialty}
          />
        )}

        {/* Gradient vignette on image bottom */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/75 via-black/25 to-transparent pointer-events-none" />

        {/* Curated status tag on top-left */}
        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold tracking-caps uppercase text-[#e9e4dc] backdrop-blur-md border border-white/10">
          <span className="material-symbols-outlined text-[11px] text-secondary-fixed">
            {stylist.verified ? "verified" : "hotel_class"}
          </span>
          {stylist.verified ? "Verified" : "Curated"}
        </span>

        {/* Favorite icon top-right */}
        <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white/90 backdrop-blur-md transition-all hover:bg-black/70 hover:scale-110">
          <span className="material-symbols-outlined text-[16px]">favorite</span>
        </span>

        {/* Starting price tag on bottom-left of image */}
        <span className="absolute bottom-2 left-2 rounded-md bg-white/95 px-2 py-0.5 text-[10px] sm:text-[11px] font-bold text-primary backdrop-blur-sm shadow-xs">
          {startingPrice}
        </span>

        {/* Star Rating on bottom-right of image */}
        {stylist.rating > 0 && (
          <span className="absolute bottom-2 right-2 flex items-center gap-0.5 rounded-md bg-black/65 px-1.5 py-0.5 text-[10px] sm:text-[11px] font-semibold text-[#fbf9f8] backdrop-blur-sm">
            <span className="material-symbols-outlined fill text-[12px] text-secondary-fixed">
              star
            </span>
            <span>{stylist.rating.toFixed(1)}</span>
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <h3 className="font-display text-[14px] sm:text-base font-bold text-primary transition-colors group-hover:text-secondary leading-snug break-normal [text-wrap:balance]">
            {stylist.name}
          </h3>
          <p className="mt-0.5 truncate text-[11px] sm:text-[12px] text-on-surface-variant">
            {stylist.tagline}
          </p>

          <div className="mt-1.5 flex items-center gap-1 text-[10px] sm:text-[11px] text-outline">
            <span className="material-symbols-outlined text-[13px] text-secondary">
              location_on
            </span>
            <span className="truncate">{formatRegion(stylist.region)}</span>
          </div>

          {/* Specialty chips */}
          <div className="mt-2 flex flex-wrap gap-1">
            {stylist.specialties.slice(0, 2).map((spec) => (
              <span
                key={spec}
                className="rounded-md bg-surface-container px-1.5 py-0.5 text-[9px] sm:text-[10px] font-medium text-on-surface-variant"
              >
                {spec}
              </span>
            ))}
            {stylist.specialties.length > 2 && (
              <span className="rounded-md bg-surface-container px-1 py-0.5 text-[9px] sm:text-[10px] font-medium text-outline">
                +{stylist.specialties.length - 2}
              </span>
            )}
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between border-t border-outline-variant/30 pt-1.5 text-[10px] font-semibold uppercase tracking-caps text-secondary group-hover:text-primary transition-colors">
          <span>View Profile</span>
          <span className="material-symbols-outlined text-[13px] transition-transform group-hover:translate-x-0.5">
            arrow_forward
          </span>
        </div>
      </div>
    </Link>
  );
}
