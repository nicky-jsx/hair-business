import Link from "next/link";
import { SearchBar } from "@/components/search/SearchBar";
import { FeaturedStylists } from "@/components/stylist/FeaturedStylists";
import { fetchAllStylists, fetchFeaturedStylists } from "@/lib/stylists-db";
import { REGIONS, type Region, type Specialty } from "@/types/stylist";

// Authentic specialties and icons
const SPECIALTY_NAV: { label: Specialty; displayName: string; slug: string; icon: string }[] = [
  { label: "Wigs", displayName: "Wigs", slug: "Wigs", icon: "face_3" },
  { label: "Eyelashes", displayName: "Lashes", slug: "Lashes", icon: "visibility" },
  { label: "Locs", displayName: "Dreadlocks", slug: "Dreadlocks", icon: "waves" },
  { label: "Braids", displayName: "Braids", slug: "Braids", icon: "gesture" },
  { label: "Natural Hair", displayName: "Natural", slug: "Natural", icon: "spa" },
  { label: "Silk Press", displayName: "Silk Press", slug: "Silk Press", icon: "flare" },
  { label: "Color", displayName: "Color", slug: "Color", icon: "palette" },
  { label: "Cuts", displayName: "Cuts", slug: "Cuts", icon: "content_cut" },
  { label: "Extensions", displayName: "Extensions", slug: "Extensions", icon: "auto_fix_high" },
];

const BOROUGHS: { name: Region; subtitle: string }[] = [
  { name: "East", subtitle: "Hackney • Shoreditch • Stratford" },
  { name: "South", subtitle: "Peckham • Brixton • Croydon" },
  { name: "North", subtitle: "Camden • Islington • Finsbury Park" },
  { name: "West", subtitle: "Notting Hill • Kensington • Chelsea" },
];

export const revalidate = 60; // Revalidate every 60 seconds

export default async function HomePage() {
  const [allStylists, featuredStylists] = await Promise.all([
    fetchAllStylists(),
    fetchFeaturedStylists(),
  ]);

  // Exclude any categories that have 0 results in the database
  const presentSpecialties = new Set<Specialty>();
  allStylists.forEach((s) => {
    s.specialties?.forEach((spec) => presentSpecialties.add(spec));
  });

  const activeSpecialtyNav = SPECIALTY_NAV.filter((cat) =>
    presentSpecialties.has(cat.label)
  );

  return (
    <div className="px-4 pb-12">
      {/* 1. LOCATION & SEARCH HEADER */}
      <section className="pt-3 mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined fill text-secondary text-sm">
              location_on
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-caps text-on-surface-variant">
              London, UK
            </span>
          </div>
          <Link
            href="/stylists"
            className="text-[11px] font-semibold uppercase tracking-caps text-secondary hover:text-primary"
          >
            Browse All →
          </Link>
        </div>

        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-primary leading-tight mb-3">
          Find your specialist <br className="hidden sm:inline" />
          in London
        </h1>

        <SearchBar
          navigateOnSubmit={true}
          placeholder="Search by name, service, or borough…"
        />
      </section>

      {/* 2. BROWSE BY CATEGORY */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-primary">
            Browse by Category
          </h2>
          <Link
            href="/stylists"
            className="text-xs font-medium text-secondary hover:underline"
          >
            View All
          </Link>
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-2 -mx-4 px-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {activeSpecialtyNav.map((cat) => (
            <Link
              key={cat.label}
              href={`/stylists?specialty=${encodeURIComponent(cat.slug)}`}
              className="group flex flex-shrink-0 flex-col items-center gap-1.5 active:scale-95 transition-transform"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-container transition-all group-hover:bg-secondary-fixed group-hover:shadow-xs">
                <span className="material-symbols-outlined text-xl text-on-surface group-hover:text-primary">
                  {cat.icon}
                </span>
              </div>
              <span className="text-[11px] font-medium text-on-surface-variant group-hover:text-primary whitespace-nowrap">
                {cat.displayName}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FEATURED STYLISTS OF THE WEEK */}
      <FeaturedStylists stylists={featuredStylists} />

      {/* 4. EXPLORE BY BOROUGH */}
      <section className="mb-8">
        <div className="mb-3">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-primary">
            Explore London by Area
          </h2>
          <p className="text-[11px] text-on-surface-variant">
            Discover verified talent in your neighborhood
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {BOROUGHS.map((b) => (
            <Link
              key={b.name}
              href={`/stylists?region=${b.name}`}
              className="group flex flex-col justify-between rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-3.5 shadow-sm transition-all hover:border-secondary/50 hover:bg-secondary-fixed/20 active:scale-[0.98]"
            >
              <div>
                <span className="font-display text-sm font-bold text-primary block group-hover:text-secondary transition-colors">
                  {b.name} London
                </span>
                <span className="text-[10px] text-outline line-clamp-1 mt-0.5">
                  {b.subtitle}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between text-[10px] font-semibold uppercase tracking-caps text-secondary group-hover:text-primary">
                <span>Browse Area</span>
                <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-0.5">
                  arrow_forward
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. ARE YOU A STYLIST? OUTREACH HERO */}
      <section className="rounded-2xl border border-secondary/25 bg-gradient-to-br from-[#1c1917] to-[#24201c] p-5 text-center text-[#fbf9f8] shadow-sm">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-secondary-fixed/20 border border-secondary-fixed/30 text-[#e4cb96] mb-2.5">
          <span className="material-symbols-outlined text-xl">storefront</span>
        </div>
        <h3 className="font-display text-base font-bold text-white">
          Are you a London hair or beauty professional?
        </h3>
        <p className="mx-auto mt-1 max-w-xs text-xs text-[#d7cebf] leading-relaxed">
          Claim your profile on Hair Korter to unlock high-res portfolio lookbooks, verified directory placement, and direct client bookings.
        </p>
        <div className="mt-3.5 flex justify-center">
          <Link
            href="/stylist/claim"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#c9a86a] px-4 py-2.5 text-xs font-bold uppercase tracking-caps text-[#1a1715] shadow-xs active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-sm">verified</span>
            <span>Claim Your Profile</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
