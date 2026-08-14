import { StylistCard } from "@/components/stylist/StylistCard";
import type { Stylist } from "@/types/stylist";

interface StylistGridProps {
  stylists: Stylist[];
  emptyMessage?: string;
}

export function StylistGrid({
  stylists,
  emptyMessage = "No stylists found. Try a different search.",
}: StylistGridProps) {
  if (stylists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="h-8 w-8 text-gray-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
        </div>
        <p className="text-sm text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {stylists.map((stylist) => (
        <StylistCard key={stylist.id} stylist={stylist} />
      ))}
    </div>
  );
}
