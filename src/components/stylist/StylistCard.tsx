import Image from "next/image";
import Link from "next/link";
import { formatRegion } from "@/types/stylist";
import type { Stylist } from "@/types/stylist";

interface StylistCardProps {
  stylist: Stylist;
  variant?: "default" | "compact" | "featured";
}

export function StylistCard({ stylist, variant = "default" }: StylistCardProps) {
  if (variant === "featured") {
    return (
      <Link
        href={`/stylists/${stylist.id}`}
        className="group w-72 flex-shrink-0 cursor-pointer"
      >
        <div className="relative mb-4 aspect-[4/5] w-full overflow-hidden rounded-md bg-surface-container">
          <Image
            src={stylist.coverImage}
            alt={stylist.name}
            fill
            className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
            sizes="288px"
          />
          <span className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-primary backdrop-blur-sm transition-colors group-hover:bg-background">
            <span className="material-symbols-outlined text-lg">favorite</span>
          </span>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-display text-base font-semibold text-primary">
              {stylist.name}
            </h3>
            <p className="mt-1 text-[13px] text-on-surface-variant">
              {stylist.tagline}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined fill text-secondary text-base">
              star
            </span>
            <span className="text-[12px] font-semibold text-primary">
              {stylist.rating.toFixed(1)}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link
        href={`/stylists/${stylist.id}`}
        className="group flex w-40 shrink-0 flex-col gap-3"
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-md bg-surface-container">
          <Image
            src={stylist.avatar}
            alt={stylist.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="160px"
          />
        </div>
        <div>
          <h3 className="font-display text-sm font-semibold text-primary">
            {stylist.name}
          </h3>
          <p className="text-[12px] text-on-surface-variant">
            {formatRegion(stylist.region)}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/stylists/${stylist.id}`}
      className="group block cursor-pointer"
    >
      <div className="relative mb-3 aspect-[4/5] w-full overflow-hidden rounded-md bg-surface-container">
        <Image
          src={stylist.coverImage}
          alt={stylist.name}
          fill
          className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
          sizes="(max-width: 512px) 50vw, 256px"
        />
        <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-primary backdrop-blur-sm">
          <span className="material-symbols-outlined text-lg">favorite</span>
        </span>
      </div>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-display text-base font-semibold text-primary">
            {stylist.name}
          </h3>
          <p className="mt-0.5 truncate text-[13px] text-on-surface-variant">
            {stylist.tagline}
          </p>
          <p className="mt-1 text-[12px] uppercase tracking-caps text-outline">
            {formatRegion(stylist.region)}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <span className="material-symbols-outlined fill text-secondary text-base">
            star
          </span>
          <span className="text-[12px] font-semibold text-primary">
            {stylist.rating.toFixed(1)}
          </span>
        </div>
      </div>
    </Link>
  );
}
