import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { formatRegion } from "@/types/stylist";
import type { Stylist } from "@/types/stylist";

interface StylistCardProps {
  stylist: Stylist;
  variant?: "default" | "compact";
}

export function StylistCard({ stylist, variant = "default" }: StylistCardProps) {
  if (variant === "compact") {
    return (
      <Link
        href={`/stylists/${stylist.id}`}
        className="group flex shrink-0 flex-col gap-3"
      >
        <div className="relative h-44 w-36 overflow-hidden rounded-2xl bg-gray-100 shadow-card transition-shadow group-hover:shadow-card-hover">
          <Image
            src={stylist.avatar}
            alt={stylist.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="144px"
          />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{stylist.name}</h3>
          <p className="text-xs text-gray-500">{formatRegion(stylist.region)}</p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/stylists/${stylist.id}`}
      className="group block overflow-hidden rounded-2xl bg-white shadow-card transition-all duration-200 hover:shadow-card-hover active:scale-[0.99]"
    >
      <div className="relative h-36 overflow-hidden bg-gray-100">
        <Image
          src={stylist.coverImage}
          alt=""
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="400px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-3 left-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-white">
            <Image
              src={stylist.avatar}
              alt={stylist.name}
              fill
              className="object-cover"
              sizes="48px"
            />
          </div>
        </div>
        <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-gray-700 backdrop-blur-sm">
          {stylist.priceRange}
        </span>
      </div>

      <div className="p-4">
        <div className="mb-1 flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900">{stylist.name}</h3>
        </div>
        <p className="mb-2 text-sm text-gray-500">{stylist.tagline}</p>
        <div className="mb-2 flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-3.5 w-3.5 text-amber-400"
          >
            <path
              fillRule="evenodd"
              d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-xs font-medium text-gray-700">
            {stylist.rating.toFixed(1)}
          </span>
          <span className="text-xs text-gray-400">
            ({stylist.reviewCount})
          </span>
        </div>
        <p className="mb-3 text-xs text-gray-400">
          {formatRegion(stylist.region)}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {stylist.specialties.slice(0, 3).map((specialty) => (
            <Badge key={specialty} variant="brand">
              {specialty}
            </Badge>
          ))}
        </div>
      </div>
    </Link>
  );
}
