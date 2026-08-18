import Link from "next/link";
import { SearchBar } from "@/components/search/SearchBar";
import { StylistCard } from "@/components/stylist/StylistCard";
import { fetchFeaturedStylists } from "@/lib/stylists-db";
import { REGIONS } from "@/types/stylist";

const CATEGORIES: { label: string; specialty: string; icon: string }[] = [
  { label: "Wigs", specialty: "Wigs", icon: "face_3" },
  { label: "Braids", specialty: "Braids", icon: "gesture" },
  { label: "Locs", specialty: "Locs", icon: "waves" },
  { label: "Lashes", specialty: "Eyelashes", icon: "visibility" },
];

export const revalidate = 60; // Revalidate every 60 seconds

export default async function HomePage() {
  const featured = await fetchFeaturedStylists();

  return (
    <div className="px-6 pb-8">
      {/* Location + Search */}
      <section className="pt-4 mb-10">
        <div className="mb-3 flex items-center gap-2">
          <span
            className="material-symbols-outlined fill text-outline text-lg"
          >
            location_on
          </span>
          <span className="text-[12px] font-semibold uppercase tracking-caps text-on-surface-variant">
            London, UK
          </span>
        </div>
        <SearchBar navigateOnSubmit />
      </section>

      {/* Hero headline */}
      <section className="mb-12">
        <h1 className="font-display text-[32px] font-bold leading-tight tracking-tight text-primary md:text-5xl">
          Find your
          <br />
          next stylist.
        </h1>
      </section>

      {/* Categories */}
      <section className="mb-14 -mx-6 px-6">
        <div className="flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.label}
              href={`/stylists?specialty=${encodeURIComponent(cat.specialty)}`}
              className="group flex flex-shrink-0 flex-col items-center gap-2"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-container transition-colors group-hover:bg-secondary-fixed">
                <span className="material-symbols-outlined text-on-surface">
                  {cat.icon}
                </span>
              </div>
              <span className="text-[12px] font-semibold uppercase tracking-caps text-on-surface-variant">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured stylists */}
      <section className="mb-14">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-lg font-semibold text-primary">
            Featured Stylists
          </h2>
          <Link
            href="/stylists"
            className="text-[12px] font-semibold uppercase tracking-caps text-secondary transition-colors hover:text-primary"
          >
            View All
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto -mx-6 px-6 pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {featured.map((stylist) => (
            <StylistCard key={stylist.id} stylist={stylist} variant="featured" />
          ))}
        </div>
      </section>

      {/* Regions */}
      <section className="mb-4">
        <h2 className="mb-4 font-display text-lg font-semibold text-primary">
          Explore by area
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {REGIONS.map((region) => (
            <Link
              key={region}
              href={`/stylists?region=${region}`}
              className="group flex items-center justify-between rounded-xl bg-surface-container-lowest px-5 py-5 shadow-ambient transition-colors hover:bg-secondary-fixed"
            >
              <span className="font-display text-base font-semibold text-primary">
                {region}
              </span>
              <span className="material-symbols-outlined text-outline transition-transform group-hover:translate-x-0.5">
                arrow_forward
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
