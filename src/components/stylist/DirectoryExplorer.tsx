"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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

function parseRegion(value: string | null): Region | null {
  if (!value) return null;
  const match = REGIONS.find((r) => r.toLowerCase() === value.trim().toLowerCase());
  return match ?? null;
}

const ALL_VALID_SPECIALTIES: Specialty[] = [
  "Wigs",
  "Braids",
  "Locs",
  "Eyelashes",
  "Silk Press",
  "Cuts",
  "Color",
  "Extensions",
  "Natural Hair",
];

function parseSpecialty(value: string | null): Specialty | null {
  if (!value) return null;
  const match = ALL_VALID_SPECIALTIES.find(
    (s) => s.toLowerCase() === value.trim().toLowerCase()
  );
  return match ?? null;
}

const ALL_STYLES: { label: string; value: Specialty | null }[] = [
  { label: "All Styles", value: null },
  { label: "Wigs", value: "Wigs" },
  { label: "Braids", value: "Braids" },
  { label: "Locs", value: "Locs" },
  { label: "Natural Hair", value: "Natural Hair" },
  { label: "Silk Press", value: "Silk Press" },
  { label: "Lashes", value: "Eyelashes" },
  { label: "Cuts", value: "Cuts" },
  { label: "Color", value: "Color" },
  { label: "Extensions", value: "Extensions" },
];

const ALL_AREAS: { label: string; value: Region | null }[] = [
  { label: "All London", value: null },
  { label: "North", value: "North" },
  { label: "East", value: "East" },
  { label: "South", value: "South" },
  { label: "West", value: "West" },
];

function DirectoryExplorerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const regionParam = searchParams.get("region");
  const specialtyParam = searchParams.get("specialty");

  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(initialQuery);
  const [region, setRegion] = useState<Region | null>(parseRegion(regionParam));
  const [specialty, setSpecialty] = useState<Specialty | null>(
    parseSpecialty(specialtyParam)
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

  // Sync internal state if URL params change externally
  useEffect(() => {
    setRegion(parseRegion(searchParams.get("region")));
    setSpecialty(parseSpecialty(searchParams.get("specialty")));
    if (searchParams.get("q") !== null) {
      setQuery(searchParams.get("q") || "");
    }
  }, [searchParams]);

  const updateUrl = (
    newRegion: Region | null,
    newSpecialty: Specialty | null,
    newQuery: string
  ) => {
    const params = new URLSearchParams();
    if (newQuery) params.set("q", newQuery);
    if (newRegion) params.set("region", newRegion);
    if (newSpecialty) params.set("specialty", newSpecialty);
    const queryString = params.toString();
    const target = queryString ? `/?${queryString}` : "/";
    router.replace(target, { scroll: false });
  };

  function handleSelectSpecialty(newSpecialty: Specialty | null) {
    setSpecialty(newSpecialty);
    updateUrl(region, newSpecialty, query);
  }

  function handleSelectRegion(newRegion: Region | null) {
    setRegion(newRegion);
    updateUrl(newRegion, specialty, query);
  }

  function handleSearch(newQuery: string) {
    setQuery(newQuery);
    updateUrl(region, specialty, newQuery);
  }

  function clearAllFilters() {
    setQuery("");
    setRegion(null);
    setSpecialty(null);
    setPriceRange(null);
    setRating(null);
    router.replace("/", { scroll: false });
  }

  const results = useMemo(
    () =>
      filterStylistsLocal(stylists, {
        query,
        specialty,
        region,
        priceRange,
        rating,
      }),
    [stylists, query, specialty, region, priceRange, rating]
  );

  const extraFilterCount = [priceRange, rating].filter(Boolean).length;
  const hasActiveFilters = Boolean(
    query || region || specialty || priceRange || rating
  );

  // Dynamic Specific Title & Subtitle
  let title = "What are you looking for?";
  let subtitle = "Curated directory of hair & beauty specialists across London";

  if (query) {
    title = `Results for "${query}"`;
    subtitle = `${results.length} matching specialist${results.length !== 1 ? "s" : ""}`;
  } else if (specialty && region) {
    title = `${specialty} in ${region} London`;
    subtitle = `${results.length} curated ${specialty.toLowerCase()} specialist${results.length !== 1 ? "s" : ""} found in ${region} London`;
  } else if (specialty) {
    title = `${specialty} in London`;
    subtitle = `${results.length} curated ${specialty.toLowerCase()} specialist${results.length !== 1 ? "s" : ""} across all London`;
  } else if (region) {
    title = `Specialists in ${region} London`;
    subtitle = `${results.length} curated professional${results.length !== 1 ? "s" : ""} available in ${region} London`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  return (
    <div className="px-6 pb-12">
      {/* Location Badge */}
      <section className="pt-2 mb-3">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined fill text-secondary text-base">
            location_on
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-caps text-on-surface-variant">
            London, UK
          </span>
        </div>
      </section>

      {/* Dynamic Hero Title */}
      <section className="mb-6">
        <h1 className="font-display text-[28px] font-bold leading-tight tracking-tight text-primary md:text-4xl">
          {title}
        </h1>
        <p className="mt-1 text-xs text-on-surface-variant leading-relaxed">
          {subtitle}
        </p>
      </section>

      {/* Search Input & Advanced Filters Toggle */}
      <section className="mb-4 flex gap-2">
        <div className="flex-1">
          <SearchBar
            defaultValue={query}
            onSearch={handleSearch}
            placeholder="Search wigs, braids, locs, areas…"
            navigateOnSubmit={false}
          />
        </div>
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border transition-colors ${
            filtersOpen || extraFilterCount > 0
              ? "border-secondary bg-secondary-fixed/30 text-primary"
              : "border-outline-variant/60 bg-surface-container-lowest text-outline hover:border-outline"
          }`}
          aria-label="Toggle price and rating filters"
          title="Price & Rating filters"
        >
          <span className="material-symbols-outlined text-xl">tune</span>
          {extraFilterCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-background">
              {extraFilterCount}
            </span>
          )}
        </button>
      </section>

      {/* Tier 1: Category / Style Filter Chips */}
      <section className="mb-2.5">
        <div className="flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {ALL_STYLES.map((item) => {
            const isSelected = specialty === item.value;
            return (
              <button
                key={item.label}
                onClick={() => handleSelectSpecialty(item.value)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-caps transition-all ${
                  isSelected
                    ? "bg-primary text-background shadow-sm scale-[1.02]"
                    : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Tier 2: Area / Region Filter Chips */}
      <section className="mb-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <span className="text-[11px] font-semibold uppercase tracking-caps text-outline shrink-0 pr-1">
            Area:
          </span>
          {ALL_AREAS.map((item) => {
            const isSelected = region === item.value;
            return (
              <button
                key={item.label}
                onClick={() => handleSelectRegion(item.value)}
                className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-secondary-fixed text-primary font-semibold shadow-xs"
                    : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Active Filter Dismiss Chips */}
      {hasActiveFilters && (
        <section className="mb-5 flex flex-wrap items-center gap-2 border-t border-outline-variant/30 pt-3">
          <span className="text-[11px] uppercase tracking-caps text-outline">
            Active:
          </span>
          {specialty && (
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-container px-2.5 py-1 text-xs font-medium text-primary">
              <span>{specialty}</span>
              <button
                onClick={() => handleSelectSpecialty(null)}
                className="material-symbols-outlined text-sm text-outline hover:text-primary"
                aria-label={`Remove ${specialty} filter`}
              >
                close
              </button>
            </span>
          )}
          {region && (
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-container px-2.5 py-1 text-xs font-medium text-primary">
              <span>{region} London</span>
              <button
                onClick={() => handleSelectRegion(null)}
                className="material-symbols-outlined text-sm text-outline hover:text-primary"
                aria-label={`Remove ${region} London filter`}
              >
                close
              </button>
            </span>
          )}
          {priceRange && (
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-container px-2.5 py-1 text-xs font-medium text-primary">
              <span>Price: {priceRange}</span>
              <button
                onClick={() => setPriceRange(null)}
                className="material-symbols-outlined text-sm text-outline hover:text-primary"
                aria-label="Remove price filter"
              >
                close
              </button>
            </span>
          )}
          {rating && (
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-container px-2.5 py-1 text-xs font-medium text-primary">
              <span>Rating: {rating}</span>
              <button
                onClick={() => setRating(null)}
                className="material-symbols-outlined text-sm text-outline hover:text-primary"
                aria-label="Remove rating filter"
              >
                close
              </button>
            </span>
          )}
          {query && (
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-container px-2.5 py-1 text-xs font-medium text-primary">
              <span>&ldquo;{query}&rdquo;</span>
              <button
                onClick={() => handleSearch("")}
                className="material-symbols-outlined text-sm text-outline hover:text-primary"
                aria-label="Remove search query"
              >
                close
              </button>
            </span>
          )}
          <button
            onClick={clearAllFilters}
            className="text-[11px] font-semibold uppercase tracking-caps text-secondary underline hover:text-primary ml-auto"
          >
            Clear all
          </button>
        </section>
      )}

      {/* Advanced Filter Drawer (Price & Rating) */}
      {filtersOpen && (
        <section className="mb-5 space-y-3 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-4 shadow-ambient">
          <FilterChips
            label="Price Range"
            options={PRICE_RANGES}
            selected={priceRange}
            onSelect={setPriceRange}
          />
          <FilterChips
            label="Minimum Rating"
            options={RATING_FILTERS}
            selected={rating}
            onSelect={setRating}
          />
        </section>
      )}

      {/* Directory Results */}
      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-display text-base font-semibold text-primary">
            {specialty || region || query ? "Matching Listings" : "London Listings"}
          </h2>
          <span className="text-xs text-outline">
            {results.length} specialist{results.length !== 1 ? "s" : ""}
          </span>
        </div>

        {results.length > 0 ? (
          <StylistGrid stylists={results} />
        ) : (
          <div className="rounded-2xl border border-dashed border-outline-variant/80 bg-surface-container-low/50 py-16 px-6 text-center">
            <span className="material-symbols-outlined text-4xl text-outline mb-2">
              search_off
            </span>
            <h3 className="font-display text-lg font-bold text-primary">
              No specialists found
            </h3>
            <p className="mx-auto mt-1 max-w-sm text-xs text-on-surface-variant leading-relaxed">
              {specialty && region
                ? `We don't currently have ${specialty.toLowerCase()} specialists listed in ${region} London.`
                : "Try adjusting your search terms or clearing filters."}
            </p>
            <div className="mt-5 flex justify-center gap-2">
              {region && (
                <button
                  onClick={() => handleSelectRegion(null)}
                  className="rounded-xl bg-surface-container px-4 py-2 text-xs font-semibold uppercase tracking-caps text-primary hover:bg-surface-container-high"
                >
                  Search all London
                </button>
              )}
              <button
                onClick={clearAllFilters}
                className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-caps text-background hover:opacity-90"
              >
                Reset all filters
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Stylist Outreach & Claim Banner */}
      <section className="mt-10 rounded-2xl border border-secondary/25 bg-gradient-to-br from-surface-container to-surface-container-low p-6 text-center shadow-ambient">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-secondary-fixed text-primary mb-3">
          <span className="material-symbols-outlined text-xl">verified</span>
        </div>
        <h3 className="font-display text-base font-bold text-primary">
          Are you a London hair professional?
        </h3>
        <p className="mx-auto mt-1 max-w-sm text-xs text-on-surface-variant leading-relaxed">
          Claim your existing listing on Hair Korter to unlock your high-res portfolio lookbook, verified directory placement, and direct client bookings.
        </p>
        <div className="mt-4 flex justify-center">
          <Link
            href="/stylist/claim"
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold uppercase tracking-caps text-background shadow-xs hover:opacity-90 transition-all"
          >
            <span className="material-symbols-outlined text-base">verified</span>
            <span>Claim Your Profile</span>
          </Link>
        </div>
      </section>
    </div>
  );
}

export function DirectoryExplorer() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
        </div>
      }
    >
      <DirectoryExplorerContent />
    </Suspense>
  );
}
