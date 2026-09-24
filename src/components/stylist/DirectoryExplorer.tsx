"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchBar } from "@/components/search/SearchBar";
import { StylistGrid } from "@/components/stylist/StylistGrid";
import { Pagination } from "@/components/ui/Pagination";
import { fetchAllStylists, filterStylistsLocal } from "@/lib/stylists-db";
import {
  BUDGET_TIERS,
  PRICE_RANGES,
  RATING_FILTERS,
  REGIONS,
  SORT_OPTIONS,
  TOP_LONDON_BOROUGHS,
  type BudgetTier,
  type PriceRange,
  type RatingFilter,
  type Region,
  type SortOption,
  type Specialty,
  type Stylist,
} from "@/types/stylist";

const PAGE_SIZE = 12;

function parseRegion(value: string | null): Region | null {
  if (!value) return null;
  const match = REGIONS.find((r) => r.toLowerCase() === value.trim().toLowerCase());
  return match ?? null;
}

// Top-level categories: Lashes and Dreadlocks have their own distinct category
const ALL_SPECIALTY_FILTERS: { label: string; value: Specialty | null; slug: string | null }[] = [
  { label: "All Services", value: null, slug: null },
  { label: "Wigs", value: "Wigs", slug: "Wigs" },
  { label: "Lashes", value: "Eyelashes", slug: "Lashes" },
  { label: "Dreadlocks", value: "Locs", slug: "Dreadlocks" },
  { label: "Braids", value: "Braids", slug: "Braids" },
  { label: "Natural", value: "Natural Hair", slug: "Natural" },
  { label: "Silk Press", value: "Silk Press", slug: "Silk Press" },
  { label: "Color", value: "Color", slug: "Color" },
  { label: "Cuts", value: "Cuts", slug: "Cuts" },
  { label: "Extensions", value: "Extensions", slug: "Extensions" },
];

function parseSpecialty(value: string | null): Specialty | null {
  if (!value) return null;
  const v = value.trim().toLowerCase();
  if (v === "lashes" || v === "eyelashes" || v === "lash") return "Eyelashes";
  if (v === "dreadlocks" || v === "dreadlock" || v === "dreads" || v === "locs" || v === "loc") return "Locs";
  if (v === "wigs" || v === "wig") return "Wigs";
  if (v === "braids" || v === "braid") return "Braids";
  if (v === "natural" || v === "natural hair") return "Natural Hair";
  const match = ALL_SPECIALTY_FILTERS.find(
    (s) => s.value && (s.value.toLowerCase() === v || s.label.toLowerCase() === v)
  );
  return match?.value ?? null;
}

function getSpecialtyLabel(s: Specialty | null): string {
  if (!s) return "All Services";
  if (s === "Eyelashes") return "Lashes";
  if (s === "Locs") return "Dreadlocks";
  if (s === "Natural Hair") return "Natural";
  return s;
}

function getSpecialtySlug(s: Specialty | null): string | null {
  if (!s) return null;
  if (s === "Eyelashes") return "Lashes";
  if (s === "Locs") return "Dreadlocks";
  if (s === "Natural Hair") return "Natural";
  return s;
}

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
  const boroughParam = searchParams.get("borough");
  const budgetParam = searchParams.get("budget") as BudgetTier | null;
  const sortParam = (searchParams.get("sort") as SortOption) || "popular";
  const verifiedParam = searchParams.get("verified") === "true";
  const pageParam = parseInt(searchParams.get("page") ?? "1", 10);

  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(initialQuery);
  const [region, setRegion] = useState<Region | null>(parseRegion(regionParam));
  const [specialty, setSpecialty] = useState<Specialty | null>(parseSpecialty(specialtyParam));
  const [borough, setBorough] = useState<string | null>(boroughParam || null);
  const [budgetTier, setBudgetTier] = useState<BudgetTier | null>(budgetParam || null);
  const [sortBy, setSortBy] = useState<SortOption>(sortParam);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(verifiedParam);
  const [priceRange, setPriceRange] = useState<PriceRange | null>(null);
  const [rating, setRating] = useState<RatingFilter | null>(null);
  const [page, setPage] = useState<number>(
    Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1
  );
  const [filtersOpen, setFiltersOpen] = useState(false);

  const feedRef = useRef<HTMLElement>(null);

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
    setBorough(searchParams.get("borough") || null);
    setBudgetTier((searchParams.get("budget") as BudgetTier) || null);
    setSortBy((searchParams.get("sort") as SortOption) || "popular");
    setVerifiedOnly(searchParams.get("verified") === "true");
    if (searchParams.get("q") !== null) {
      setQuery(searchParams.get("q") || "");
    }
    const p = parseInt(searchParams.get("page") ?? "1", 10);
    setPage(Number.isInteger(p) && p > 0 ? p : 1);
  }, [searchParams]);

  const updateUrl = (options: {
    region?: Region | null;
    specialty?: Specialty | null;
    borough?: string | null;
    budgetTier?: BudgetTier | null;
    sortBy?: SortOption;
    verifiedOnly?: boolean | null;
    query?: string;
    page?: number;
  }) => {
    const params = new URLSearchParams();
    const q = options.query !== undefined ? options.query : query;
    const r = options.region !== undefined ? options.region : region;
    const s = options.specialty !== undefined ? options.specialty : specialty;
    const b = options.borough !== undefined ? options.borough : borough;
    const bt = options.budgetTier !== undefined ? options.budgetTier : budgetTier;
    const sort = options.sortBy !== undefined ? options.sortBy : sortBy;
    const v = options.verifiedOnly !== undefined ? options.verifiedOnly : verifiedOnly;
    const p = options.page !== undefined ? options.page : 1;

    if (q) params.set("q", q);
    if (r) params.set("region", r);
    if (s) {
      const slug = getSpecialtySlug(s);
      if (slug) params.set("specialty", slug);
    }
    if (b) params.set("borough", b);
    if (bt) params.set("budget", bt);
    if (sort && sort !== "popular") params.set("sort", sort);
    if (v) params.set("verified", "true");
    if (p > 1) params.set("page", String(p));

    const queryString = params.toString();
    const target = queryString ? `/stylists?${queryString}` : "/stylists";
    router.replace(target, { scroll: false });
  };

  function handleSelectSpecialty(newSpecialty: Specialty | null) {
    setSpecialty(newSpecialty);
    setPage(1);
    updateUrl({ specialty: newSpecialty, page: 1 });
  }

  function handleSelectRegion(newRegion: Region | null) {
    setRegion(newRegion);
    let nextBorough = borough;
    if (newRegion && borough) {
      const match = TOP_LONDON_BOROUGHS.find(
        (b) => b.name.toLowerCase() === borough.toLowerCase() && b.region === newRegion
      );
      if (!match) nextBorough = null;
    }
    setBorough(nextBorough);
    setPage(1);
    updateUrl({ region: newRegion, borough: nextBorough, page: 1 });
  }

  function handleSelectBorough(newBorough: string | null) {
    const nextBorough = borough === newBorough ? null : newBorough;
    setBorough(nextBorough);
    let nextRegion = region;
    if (nextBorough && !region) {
      const match = TOP_LONDON_BOROUGHS.find(
        (b) => b.name.toLowerCase() === nextBorough.toLowerCase()
      );
      if (match) nextRegion = match.region;
    }
    setRegion(nextRegion);
    setPage(1);
    updateUrl({ borough: nextBorough, region: nextRegion, page: 1 });
  }

  function handleSearch(newQuery: string) {
    setQuery(newQuery);
    setPage(1);
    updateUrl({ query: newQuery, page: 1 });
  }

  function handleBudgetSelect(newBudget: BudgetTier | null) {
    const nextVal = budgetTier === newBudget ? null : newBudget;
    setBudgetTier(nextVal);
    setPage(1);
    updateUrl({ budgetTier: nextVal, page: 1 });
  }

  function handleSortSelect(newSort: SortOption) {
    setSortBy(newSort);
    setPage(1);
    updateUrl({ sortBy: newSort, page: 1 });
  }

  function handleToggleVerified() {
    const nextVal = !verifiedOnly;
    setVerifiedOnly(nextVal);
    setPage(1);
    updateUrl({ verifiedOnly: nextVal, page: 1 });
  }

  function handlePriceSelect(newPrice: PriceRange | null) {
    setPriceRange(newPrice);
    setPage(1);
  }

  function handleRatingSelect(newRating: RatingFilter | null) {
    setRating(newRating);
    setPage(1);
  }

  function clearAllFilters() {
    setQuery("");
    setRegion(null);
    setSpecialty(null);
    setBorough(null);
    setBudgetTier(null);
    setPriceRange(null);
    setRating(null);
    setSortBy("popular");
    setVerifiedOnly(false);
    setPage(1);
    router.replace("/stylists", { scroll: false });
  }

  // Specialty counts for badge displays
  const specialtyCounts = useMemo(() => {
    const counts = new Map<string, number>();
    stylists.forEach((s) => {
      s.specialties?.forEach((spec) => {
        counts.set(spec, (counts.get(spec) || 0) + 1);
      });
    });
    return counts;
  }, [stylists]);

  // NEVER show categories that have 0 output when clicked!
  const availableSpecialtyFilters = useMemo(() => {
    return ALL_SPECIALTY_FILTERS.filter((item) => {
      if (item.value === null) return true;
      const count = specialtyCounts.get(item.value) || 0;
      return count > 0;
    });
  }, [specialtyCounts]);

  // If a category was requested in URL that has 0 results, gracefully clear it
  useEffect(() => {
    if (!loading && stylists.length > 0 && specialty) {
      const count = specialtyCounts.get(specialty) || 0;
      if (count === 0) {
        setSpecialty(null);
        updateUrl({ specialty: null, page: 1 });
      }
    }
  }, [loading, stylists, specialty, specialtyCounts]);

  // Filter boroughs based on currently selected region
  const availableBoroughs = useMemo(() => {
    if (!region) return TOP_LONDON_BOROUGHS;
    return TOP_LONDON_BOROUGHS.filter((b) => b.region === region);
  }, [region]);

  const results = useMemo(
    () =>
      filterStylistsLocal(stylists, {
        query,
        specialty,
        region,
        priceRange,
        rating,
        borough,
        budgetTier,
        sortBy,
        verifiedOnly,
      }),
    [
      stylists,
      query,
      specialty,
      region,
      priceRange,
      rating,
      borough,
      budgetTier,
      sortBy,
      verifiedOnly,
    ]
  );

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, page), totalPages);

  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return results.slice(start, start + PAGE_SIZE);
  }, [results, currentPage]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateUrl({ page: newPage });
    if (feedRef.current) {
      feedRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const extraFilterCount = [
    priceRange,
    rating,
    borough,
    budgetTier,
    sortBy !== "popular" ? sortBy : null,
    verifiedOnly ? "verified" : null,
  ].filter(Boolean).length;

  const hasActiveFilters = Boolean(
    query ||
      region ||
      specialty ||
      borough ||
      budgetTier ||
      priceRange ||
      rating ||
      sortBy !== "popular" ||
      verifiedOnly
  );

  const displaySpecialty = getSpecialtyLabel(specialty);

  let feedHeading = "Curated Specialists";
  if (query) {
    feedHeading = `Results for "${query}"`;
  } else if (specialty && borough) {
    feedHeading = `${displaySpecialty} in ${borough}`;
  } else if (specialty && region) {
    feedHeading = `${displaySpecialty} in ${region} London`;
  } else if (specialty) {
    feedHeading = `${displaySpecialty} Specialists`;
  } else if (borough) {
    feedHeading = `Specialists in ${borough}`;
  } else if (region) {
    feedHeading = `${region} London Specialists`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-28">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#82704b]/30 border-t-[#82704b]" />
      </div>
    );
  }

  return (
    <div className="px-4 pb-12">
      {/* 1. MOBILE APP HEADER & SEARCH */}
      <section className="pt-3 pb-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined fill text-secondary text-sm">
              location_on
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-caps text-on-surface-variant">
              London, UK
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-caps text-secondary bg-secondary-fixed/40 px-2.5 py-0.5 rounded-full border border-secondary/20">
            {results.length} Artisans
          </span>
        </div>

        <h1 className="font-display text-2xl font-bold tracking-tight text-primary leading-tight mb-3">
          Find Your Specialist
        </h1>

        <div className="flex gap-2">
          <div className="flex-1">
            <SearchBar
              defaultValue={query}
              onSearch={handleSearch}
              placeholder="Search by name, service, or borough…"
              navigateOnSubmit={false}
            />
          </div>
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border transition-all ${
              filtersOpen || extraFilterCount > 0
                ? "border-secondary bg-secondary-fixed/30 text-primary shadow-xs"
                : "border-outline-variant/60 bg-surface-container-lowest text-outline hover:border-outline"
            }`}
            aria-label="Toggle price, sorting, and borough filters"
            title="Advanced Filters"
          >
            <span className="material-symbols-outlined text-xl">tune</span>
            {extraFilterCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-background shadow-xs">
                {extraFilterCount}
              </span>
            )}
          </button>
        </div>
      </section>

      {/* 2. PRIMARY CATEGORY FILTER CHIPS (Only categories with actual results: Wigs, Lashes, Dreadlocks) */}
      <section className="mt-1 mb-2">
        <div className="flex gap-1.5 overflow-x-auto pb-1.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {availableSpecialtyFilters.map((item) => {
            const isSelected = specialty === item.value;
            const count = item.value ? specialtyCounts.get(item.value) : stylists.length;
            return (
              <button
                key={item.label}
                onClick={() => handleSelectSpecialty(item.value)}
                className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-caps transition-all active:scale-95 whitespace-nowrap ${
                  isSelected
                    ? "bg-primary text-background shadow-xs font-bold scale-[1.02]"
                    : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                <span>{item.label}</span>
                {count !== undefined && count > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono leading-none ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-surface-container-highest text-outline"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. LONDON BOROUGH & REGION SELECTOR */}
      <section className="mb-3">
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
                className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium transition-all active:scale-95 ${
                  isSelected
                    ? "bg-secondary-fixed text-primary font-bold shadow-xs"
                    : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {region && availableBoroughs.length > 0 && (
          <div className="mt-1.5 flex items-center gap-1 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <span className="text-[10px] font-semibold uppercase tracking-caps text-secondary shrink-0 pr-1">
              {region} Boroughs:
            </span>
            {availableBoroughs.slice(0, 8).map((b) => {
              const isSelected = borough?.toLowerCase() === b.name.toLowerCase();
              return (
                <button
                  key={b.name}
                  onClick={() => handleSelectBorough(b.name)}
                  className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] transition-all active:scale-95 ${
                    isSelected
                      ? "bg-primary text-background font-semibold"
                      : "bg-surface-container-lowest border border-outline-variant/50 text-on-surface-variant hover:border-outline"
                  }`}
                >
                  {b.name}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. ACTIVE FILTER DISMISS PILLS */}
      {hasActiveFilters && (
        <section className="mb-3.5 flex flex-wrap items-center gap-1.5 border-t border-outline-variant/30 pt-2.5">
          <span className="text-[10px] uppercase tracking-caps text-outline font-semibold">
            Filtered:
          </span>
          {specialty && (
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-container px-2 py-0.5 text-xs font-medium text-primary">
              <span>{displaySpecialty}</span>
              <button
                onClick={() => handleSelectSpecialty(null)}
                className="material-symbols-outlined text-sm text-outline hover:text-primary"
                aria-label={`Remove ${displaySpecialty} filter`}
              >
                close
              </button>
            </span>
          )}
          {borough && (
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-container px-2 py-0.5 text-xs font-medium text-primary">
              <span>📍 {borough}</span>
              <button
                onClick={() => handleSelectBorough(null)}
                className="material-symbols-outlined text-sm text-outline hover:text-primary"
                aria-label={`Remove ${borough} filter`}
              >
                close
              </button>
            </span>
          )}
          {region && !borough && (
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-container px-2 py-0.5 text-xs font-medium text-primary">
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
          {budgetTier && (
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-container px-2 py-0.5 text-xs font-medium text-primary">
              <span>
                {BUDGET_TIERS.find((b) => b.value === budgetTier)?.label || budgetTier}
              </span>
              <button
                onClick={() => handleBudgetSelect(null)}
                className="material-symbols-outlined text-sm text-outline hover:text-primary"
                aria-label="Remove budget filter"
              >
                close
              </button>
            </span>
          )}
          {sortBy !== "popular" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-container px-2 py-0.5 text-xs font-medium text-primary">
              <span>
                Sort: {SORT_OPTIONS.find((s) => s.value === sortBy)?.label || sortBy}
              </span>
              <button
                onClick={() => handleSortSelect("popular")}
                className="material-symbols-outlined text-sm text-outline hover:text-primary"
                aria-label="Reset sorting"
              >
                close
              </button>
            </span>
          )}
          {verifiedOnly && (
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-container px-2 py-0.5 text-xs font-medium text-primary">
              <span>✓ Verified Only</span>
              <button
                onClick={handleToggleVerified}
                className="material-symbols-outlined text-sm text-outline hover:text-primary"
                aria-label="Remove verified filter"
              >
                close
              </button>
            </span>
          )}
          {priceRange && (
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-container px-2 py-0.5 text-xs font-medium text-primary">
              <span>{priceRange}</span>
              <button
                onClick={() => {
                  setPriceRange(null);
                  setPage(1);
                }}
                className="material-symbols-outlined text-sm text-outline hover:text-primary"
                aria-label="Remove price filter"
              >
                close
              </button>
            </span>
          )}
          {rating && (
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-container px-2 py-0.5 text-xs font-medium text-primary">
              <span>★ {rating}</span>
              <button
                onClick={() => {
                  setRating(null);
                  setPage(1);
                }}
                className="material-symbols-outlined text-sm text-outline hover:text-primary"
                aria-label="Remove rating filter"
              >
                close
              </button>
            </span>
          )}
          {query && (
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-container px-2 py-0.5 text-xs font-medium text-primary">
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
            className="text-[10px] font-semibold uppercase tracking-caps text-secondary underline hover:text-primary ml-auto"
          >
            Clear all
          </button>
        </section>
      )}

      {/* 5. ADVANCED FILTER DRAWER (Sort By, Starting Price Budget, London Boroughs, Rating, Verified) */}
      {filtersOpen && (
        <section className="mb-4 space-y-4 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-4 shadow-sm animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-outline-variant/30 pb-2">
            <h3 className="font-display text-xs font-bold uppercase tracking-wider text-primary">
              Filter & Sort Artisans
            </h3>
            <button
              onClick={() => setFiltersOpen(false)}
              className="text-xs text-outline hover:text-primary"
              aria-label="Close filters"
            >
              Done
            </button>
          </div>

          {/* Sort By */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-caps text-outline">
                Sort By
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SORT_OPTIONS.map((option) => {
                const isSelected = sortBy === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleSortSelect(option.value)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-primary text-background font-bold shadow-xs"
                        : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Budget / Price Tiers */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-caps text-outline">
                Starting Price
              </span>
              {budgetTier && (
                <button
                  onClick={() => handleBudgetSelect(null)}
                  className="text-[10px] text-secondary underline"
                >
                  Reset
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              {BUDGET_TIERS.map((tier) => {
                const isSelected = budgetTier === tier.value;
                return (
                  <button
                    key={tier.value}
                    onClick={() => handleBudgetSelect(tier.value)}
                    className={`flex flex-col rounded-xl p-2 text-left border transition-all ${
                      isSelected
                        ? "border-primary bg-primary text-background shadow-xs"
                        : "border-outline-variant/50 bg-surface-container-low text-on-surface-variant hover:border-outline"
                    }`}
                  >
                    <span className="text-xs font-bold leading-tight">{tier.label}</span>
                    <span
                      className={`text-[10px] leading-tight mt-0.5 ${
                        isSelected ? "text-background/80" : "text-outline"
                      }`}
                    >
                      {tier.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* London Borough / Area Selector */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-caps text-outline">
                Popular London Boroughs
              </span>
              {borough && (
                <button
                  onClick={() => handleSelectBorough(null)}
                  className="text-[10px] text-secondary underline"
                >
                  Clear borough
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
              {TOP_LONDON_BOROUGHS.map((b) => {
                const isSelected = borough?.toLowerCase() === b.name.toLowerCase();
                return (
                  <button
                    key={b.name}
                    onClick={() => handleSelectBorough(b.name)}
                    className={`rounded-lg px-2.5 py-1 text-xs transition-all ${
                      isSelected
                        ? "bg-secondary-fixed text-primary font-bold shadow-xs border border-secondary"
                        : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                    }`}
                  >
                    {b.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Minimum Rating & Price Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-outline-variant/30">
            <div>
              <span className="text-xs font-semibold uppercase tracking-caps text-outline block mb-1.5">
                Minimum Rating
              </span>
              <div className="flex gap-1.5">
                {RATING_FILTERS.map((r) => {
                  const isSelected = rating === r;
                  return (
                    <button
                      key={r}
                      onClick={() => handleRatingSelect(isSelected ? null : r)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                        isSelected
                          ? "bg-primary text-background font-bold shadow-xs"
                          : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                      }`}
                    >
                      ★ {r}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold uppercase tracking-caps text-outline block mb-1.5">
                Price Tier
              </span>
              <div className="flex gap-1.5">
                {PRICE_RANGES.map((p) => {
                  const isSelected = priceRange === p;
                  return (
                    <button
                      key={p}
                      onClick={() => handlePriceSelect(isSelected ? null : p)}
                      className={`rounded-full px-3.5 py-1 text-xs font-medium transition-all ${
                        isSelected
                          ? "bg-primary text-background font-bold shadow-xs"
                          : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Verified Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-outline-variant/30">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-secondary">
                verified
              </span>
              <div>
                <p className="text-xs font-semibold text-primary">Verified Artisans Only</p>
                <p className="text-[10px] text-outline">
                  Show vetted professionals with verified profiles
                </p>
              </div>
            </div>
            <button
              onClick={handleToggleVerified}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                verifiedOnly ? "bg-primary" : "bg-surface-container-highest"
              }`}
              role="switch"
              aria-checked={verifiedOnly}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  verifiedOnly ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </section>
      )}

      {/* 6. DIRECTORY FEED */}
      <section className="mt-1" id="directory-feed" ref={feedRef}>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-primary">
            {feedHeading}
          </h2>
          <span className="text-[11px] text-outline font-medium">
            {totalPages > 1
              ? `Page ${currentPage} of ${totalPages} • ${results.length} specialists`
              : `${results.length} specialist${results.length !== 1 ? "s" : ""}`}
          </span>
        </div>

        {results.length > 0 ? (
          <>
            <StylistGrid stylists={paginatedResults} />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={results.length}
              itemsPerPage={PAGE_SIZE}
              itemName="specialists"
              onPageChange={handlePageChange}
            />
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-outline-variant/80 bg-surface-container-low/50 py-12 px-5 text-center">
            <span className="material-symbols-outlined text-3xl text-outline mb-1.5">
              search_off
            </span>
            <h3 className="font-display text-base font-bold text-primary">
              No specialists found
            </h3>
            <p className="mx-auto mt-1 max-w-xs text-xs text-on-surface-variant leading-relaxed">
              {borough
                ? `We don't currently have ${specialty ? displaySpecialty.toLowerCase() : ""} specialists listed in ${borough}.`
                : specialty && region
                ? `We don't currently have ${displaySpecialty.toLowerCase()} specialists listed in ${region} London.`
                : "Try adjusting your search terms or clearing filters."}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {borough && (
                <button
                  onClick={() => handleSelectBorough(null)}
                  className="rounded-xl bg-surface-container px-3.5 py-2 text-xs font-semibold uppercase tracking-caps text-primary active:scale-95"
                >
                  Clear borough
                </button>
              )}
              {region && (
                <button
                  onClick={() => handleSelectRegion(null)}
                  className="rounded-xl bg-surface-container px-3.5 py-2 text-xs font-semibold uppercase tracking-caps text-primary active:scale-95"
                >
                  All London
                </button>
              )}
              <button
                onClick={clearAllFilters}
                className="rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold uppercase tracking-caps text-background active:scale-95"
              >
                Reset all filters
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 7. MOBILE OUTREACH & CLAIM BANNER */}
      <section className="mt-8 rounded-2xl border border-secondary/25 bg-gradient-to-br from-[#1c1917] to-[#24201c] p-4 sm:p-5 text-center text-[#fbf9f8] shadow-sm">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-secondary-fixed/20 border border-secondary-fixed/30 text-[#e4cb96] mb-2">
          <span className="material-symbols-outlined text-xl">verified</span>
        </div>
        <h3 className="font-display text-sm font-bold text-white">
          Are you a London hair professional?
        </h3>
        <p className="mx-auto mt-1 text-xs text-[#d7cebf] leading-relaxed max-w-xs">
          Claim your profile on Hair Korter to unlock high-res portfolio lookbooks, verified placement, and direct client bookings.
        </p>
        <div className="mt-3 flex justify-center">
          <Link
            href="/stylist/claim"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#c9a86a] px-4 py-2 text-xs font-bold uppercase tracking-caps text-[#1a1715] shadow-xs active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-sm">verified</span>
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
        <div className="flex items-center justify-center py-28">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#82704b]/30 border-t-[#82704b]" />
        </div>
      }
    >
      <DirectoryExplorerContent />
    </Suspense>
  );
}
