"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { FilterChips } from "@/components/search/FilterChips";
import { SearchBar } from "@/components/search/SearchBar";
import { StylistGrid } from "@/components/stylist/StylistGrid";
import { filterStylists, getAllSpecialties } from "@/data/stylists";
import { REGIONS, type Region, type Specialty } from "@/types/stylist";

function isRegion(value: string | null): value is Region {
  return value !== null && REGIONS.includes(value as Region);
}

const ENABLED_SPECIALTIES: Specialty[] = ["Wigs", "Braids"];

function isSpecialty(value: string | null): value is Specialty {
  return (
    value !== null &&
    ENABLED_SPECIALTIES.includes(value as Specialty)
  );
}

function DiscoverContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const regionParam = searchParams.get("region");
  const specialtyParam = searchParams.get("specialty");

  const [query, setQuery] = useState(initialQuery);
  const [region, setRegion] = useState<Region | null>(
    isRegion(regionParam) ? regionParam : null
  );
  const [specialty, setSpecialty] = useState<Specialty | null>(
    isSpecialty(specialtyParam) ? specialtyParam : null
  );

  const specialties = ENABLED_SPECIALTIES;

  const results = useMemo(
    () => filterStylists({ query, specialty, region }),
    [query, specialty, region]
  );

  return (
    <div className="px-5 pb-8">
      <section className="pt-4 pb-5">
        <h1 className="font-display text-2xl font-semibold text-gray-900">
          Discover London stylists
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {results.length} stylist{results.length !== 1 ? "s" : ""} found
        </p>
      </section>

      <section className="mb-5">
        <SearchBar
          defaultValue={initialQuery}
          onSearch={setQuery}
          autoFocus={!!initialQuery}
        />
      </section>

      <section className="mb-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Region
        </p>
        <FilterChips options={REGIONS} selected={region} onSelect={setRegion} />
      </section>

      <section className="mb-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Specialty
        </p>
        <FilterChips
          options={specialties}
          selected={specialty}
          onSelect={setSpecialty}
        />
      </section>

      <StylistGrid stylists={results} />
    </div>
  );
}

export default function StylistsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
        </div>
      }
    >
      <DiscoverContent />
    </Suspense>
  );
}
