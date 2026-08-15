"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { FilterChips } from "@/components/search/FilterChips";
import { SearchBar } from "@/components/search/SearchBar";
import { StylistGrid } from "@/components/stylist/StylistGrid";
import { fetchAllStylists, filterStylistsLocal } from "@/lib/stylists-db";
import {
  PRICE_RANGES,
  RATING_FILTERS,
  REGIONS,
  type PriceRange,
  type RatingFilter,
  type Region,
  type Specialty,
  type Stylist,
} from "@/types/stylist";

function isRegion(value: string | null): value is Region {
  return value !== null && REGIONS.includes(value as Region);
}

const ENABLED_SPECIALTIES: Specialty[] = ["Wigs", "Braids", "Locs", "Eyelashes"];

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

  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(initialQuery);
  const [region, setRegion] = useState<Region | null>(
    isRegion(regionParam) ? regionParam : null
  );
  const [specialty, setSpecialty] = useState<Specialty | null>(
    isSpecialty(specialtyParam) ? specialtyParam : null
  );
  const [priceRange, setPriceRange] = useState<PriceRange | null>(null);
  const [rating, setRating] = useState<RatingFilter | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    fetchAllStylists().then((data) => {
      setStylists(data);
      setLoading(false);
    });
  }, []);

  const specialties = ENABLED_SPECIALTIES;

  const results = useMemo(
    () => filterStylistsLocal(stylists, { query, specialty, region, priceRange, rating }),
    [stylists, query, specialty, region, priceRange, rating]
  );

  const activeFilterCount = [region, specialty, priceRange, rating].filter(Boolean).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  return (
    <div className="px-5 pb-8">
      <section className="pt-4 pb-5">
        <h1 className="font-display text-2xl font-semibold text-gray-900">
          Discover London professionals
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {results.length} professional{results.length !== 1 ? "s" : ""} found
        </p>
      </section>

      <section className="mb-5 flex gap-2">
        <div className="flex-1">
          <SearchBar
            defaultValue={initialQuery}
            onSearch={setQuery}
            autoFocus={!!initialQuery}
          />
        </div>
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition-colors ${
            filtersOpen || activeFilterCount > 0
              ? "border-brand-200 bg-brand-50 text-brand-600"
              : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
          }`}
          aria-label="Toggle filters"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
          >
            <path
              fillRule="evenodd"
              d="M2.628 1.601C5.028 1.206 7.49 1 10 1s4.973.206 7.372.601a.75.75 0 0 1 .628.74v2.288a2.25 2.25 0 0 1-.659 1.59l-4.682 4.683a2.25 2.25 0 0 0-.659 1.59v3.037c0 .684-.31 1.33-.844 1.757l-1.937 1.55A.75.75 0 0 1 8 18.25v-5.757a2.25 2.25 0 0 0-.659-1.591L2.659 6.22A2.25 2.25 0 0 1 2 4.629V2.34a.75.75 0 0 1 .628-.74Z"
              clipRule="evenodd"
            />
          </svg>
          {activeFilterCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </section>

      {filtersOpen && (
        <section className="mb-5 space-y-3 rounded-2xl border border-gray-100 bg-white p-4">
          <FilterChips
            label="Region"
            options={REGIONS}
            selected={region}
            onSelect={setRegion}
          />
          <FilterChips
            label="Style"
            options={specialties}
            selected={specialty}
            onSelect={setSpecialty}
          />
          <FilterChips
            label="Price"
            options={PRICE_RANGES}
            selected={priceRange}
            onSelect={setPriceRange}
          />
          <FilterChips
            label="Rating"
            options={RATING_FILTERS}
            selected={rating}
            onSelect={setRating}
          />
        </section>
      )}

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
