"use client";

import { useState } from "react";
import Link from "next/link";
import { REGIONS, type Region, type Specialty } from "@/types/stylist";

const SPECIALTIES: { label: string; value: Specialty | null }[] = [
  { label: "All Services", value: null },
  { label: "Wigs", value: "Wigs" },
  { label: "Lashes", value: "Eyelashes" },
  { label: "Dreadlocks", value: "Locs" },
];

export function AreaExplorer() {
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | null>(null);

  return (
    <section className="mb-14">
      <div className="mb-4">
        <h2 className="font-display text-lg font-semibold text-primary">
          {selectedSpecialty ? `Explore ${selectedSpecialty} by area` : "Explore by area"}
        </h2>
        <p className="text-[13px] text-on-surface-variant">
          {selectedSpecialty
            ? `Find curated ${selectedSpecialty.toLowerCase()} specialists across London`
            : "Browse professionals across London"}
        </p>
      </div>

      {/* Specialty Filter Tabs */}
      <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {SPECIALTIES.map((item) => {
          const isActive = selectedSpecialty === item.value;
          return (
            <button
              key={item.label}
              onClick={() => setSelectedSpecialty(item.value)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-caps transition-all ${
                isActive
                  ? "bg-primary text-background shadow-sm"
                  : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Region Cards Grid */}
      <div className="grid grid-cols-2 gap-3">
        {REGIONS.map((region: Region) => {
          const queryParams = new URLSearchParams();
          queryParams.set("region", region);
          if (selectedSpecialty) {
            queryParams.set("specialty", selectedSpecialty);
          }
          const href = `/?${queryParams.toString()}`;

          return (
            <Link
              key={region}
              href={href}
              className="group flex items-center justify-between rounded-xl bg-surface-container-lowest px-5 py-4 shadow-ambient transition-all hover:bg-secondary-fixed/40 active:scale-[0.99]"
            >
              <span className="flex flex-col">
                <span className="font-display text-base font-semibold text-primary">
                  {region}
                </span>
                <span className="text-[11px] uppercase tracking-caps text-secondary font-medium">
                  {selectedSpecialty ? selectedSpecialty : "London"}
                </span>
              </span>
              <span className="material-symbols-outlined text-outline transition-transform group-hover:translate-x-0.5">
                arrow_forward
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
