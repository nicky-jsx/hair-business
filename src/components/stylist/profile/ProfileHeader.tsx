import Image from "next/image";
import Link from "next/link";
import { formatRegion } from "@/types/stylist";
import type { Stylist } from "@/types/stylist";

interface ProfileHeaderProps {
  stylist: Stylist;
}

export function ProfileHeader({ stylist }: ProfileHeaderProps) {
  return (
    <>
      <div className="relative h-52 bg-gray-100">
        <Image
          src={stylist.coverImage}
          alt=""
          fill
          className="object-cover"
          priority
          sizes="512px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
        <Link
          href="/stylists"
          className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-700 backdrop-blur-sm transition-colors hover:bg-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
          >
            <path
              fillRule="evenodd"
              d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08l-4.158 3.96H16.25A.75.75 0 0 1 17 10Z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
      </div>

      <div className="relative px-5">
        <div className="-mt-12 mb-4 flex items-end justify-between">
          <div className="relative h-24 w-24 overflow-hidden rounded-2xl bg-gray-100 ring-4 ring-surface shadow-card">
            <Image
              src={stylist.avatar}
              alt={stylist.name}
              fill
              className="object-cover"
              sizes="96px"
            />
          </div>
          <span className="mb-1 rounded-full bg-white px-3 py-1 text-sm font-medium text-gray-700 shadow-sm">
            {stylist.priceRange}
          </span>
        </div>

        <h1 className="font-display text-2xl font-semibold text-gray-900">
          {stylist.name}
        </h1>
        <p className="mt-1 text-base text-brand-600">{stylist.tagline}</p>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
          <span>{formatRegion(stylist.region)}</span>
          <span>{stylist.yearsExperience} yrs experience</span>
        </div>
      </div>
    </>
  );
}
