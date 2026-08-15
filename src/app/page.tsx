import Link from "next/link";
import { SearchBar } from "@/components/search/SearchBar";
import { StylistCard } from "@/components/stylist/StylistCard";
import { Button } from "@/components/ui/Button";
import { fetchFeaturedStylists } from "@/lib/stylists-db";
import { REGIONS, type Specialty } from "@/types/stylist";

const ENABLED_SPECIALTIES: Specialty[] = ["Wigs", "Braids", "Locs", "Eyelashes"];

export const revalidate = 60; // Revalidate every 60 seconds

export default async function HomePage() {
  const featured = await fetchFeaturedStylists();
  const specialties = ENABLED_SPECIALTIES;

  return (
    <div className="px-5 pb-8">
      {/* Hero */}
      <section className="pt-6 pb-8">
        <p className="mb-2 text-sm font-medium text-brand-600">London&apos;s beauty directory</p>
        <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight text-gray-900">
          Find your perfect
          <br />
          <span className="text-brand-600">professional in London</span>
        </h1>
        <p className="mt-3 text-base text-gray-500 leading-relaxed">
          Discover talented hair and beauty professionals across North, East, South, and West
          London. Browse styles, compare specialties, and find your match.
        </p>
      </section>

      {/* Search */}
      <section className="mb-8">
        <SearchBar navigateOnSubmit />
      </section>

      {/* Regions */}
      <section className="mb-10">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
          Browse by region
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {REGIONS.map((region) => (
            <Link
              key={region}
              href={`/stylists?region=${region}`}
              className="rounded-2xl border border-gray-200 bg-white px-4 py-4 text-center transition-colors hover:border-brand-200 hover:bg-brand-50"
            >
              <span className="block font-semibold text-gray-900">{region}</span>
              <span className="text-xs text-gray-500">London</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick categories */}
      <section className="mb-10">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
          Browse by specialty
        </h2>
        <div className="flex flex-wrap gap-2">
          {specialties.map((specialty) => (
            <Link
              key={specialty}
              href={`/stylists?specialty=${encodeURIComponent(specialty)}`}
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
            >
              {specialty}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured professionals */}
      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Featured professionals</h2>
          <Link
            href="/stylists"
            className="text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            See all
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {featured.map((stylist) => (
            <StylistCard key={stylist.id} stylist={stylist} variant="compact" />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-6 text-white">
        <h2 className="font-display text-xl font-semibold">Ready to explore?</h2>
        <p className="mt-2 text-sm text-brand-100 leading-relaxed">
          Browse professionals across North, East, South, and West London.
        </p>
        <Link href="/stylists" className="mt-4 inline-block">
          <Button
            variant="secondary"
            size="md"
            className="border-0 bg-white text-brand-700 hover:bg-brand-50"
          >
            Browse all
          </Button>
        </Link>
      </section>
    </div>
  );
}
