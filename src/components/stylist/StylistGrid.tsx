import { StylistCard } from "@/components/stylist/StylistCard";
import type { Stylist, Specialty } from "@/types/stylist";

interface StylistGridProps {
  stylists: Stylist[];
  emptyMessage?: string;
  activeFilter?: Specialty | null;
}

export function StylistGrid({
  stylists,
  emptyMessage = "No specialists found matching your search.",
  activeFilter,
}: StylistGridProps) {
  if (stylists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-outline-variant/80 bg-surface-container-low/40 py-16 px-6 text-center">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-secondary-fixed/40 text-primary">
          <span className="material-symbols-outlined text-2xl text-secondary">
            search_off
          </span>
        </div>
        <h3 className="font-display text-base font-bold text-primary">
          No Artisans Found
        </h3>
        <p className="mt-1 max-w-sm text-xs text-on-surface-variant leading-relaxed">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {stylists.map((stylist) => (
        <StylistCard key={stylist.id} stylist={stylist} activeFilter={activeFilter} />
      ))}
    </div>
  );
}
