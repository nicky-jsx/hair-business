"use client";

import { useState } from "react";
import { ProfileServices } from "@/components/stylist/profile/ProfileServices";
import { ProfilePortfolio } from "@/components/stylist/profile/ProfilePortfolio";
import { ProfilePolicy } from "@/components/stylist/profile/ProfilePolicy";
import type { Stylist } from "@/types/stylist";

interface ProfileTabsProps {
  stylist: Stylist;
}

type TabId = "services" | "portfolio" | "policy";

const TABS: { id: TabId; label: string }[] = [
  { id: "services", label: "Services" },
  { id: "portfolio", label: "Portfolio" },
  { id: "policy", label: "Booking Policy" },
];

export function ProfileTabs({ stylist }: ProfileTabsProps) {
  const [active, setActive] = useState<TabId>("services");

  return (
    <section>
      {/* Tab bar */}
      <div className="sticky top-16 z-10 -mx-5 mb-6 border-b border-outline-variant bg-background/90 px-5 backdrop-blur-md">
        <div className="flex gap-6">
          {TABS.map((tab) => {
            const isActive = active === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className={`relative -mb-px py-3 text-[12px] font-semibold uppercase tracking-caps transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      {active === "services" && <ProfileServices services={stylist.services} />}
      {active === "portfolio" && (
        <ProfilePortfolio photos={stylist.portfolio} stylistName={stylist.name} />
      )}
      {active === "policy" && <ProfilePolicy policy={stylist.bookingPolicy} />}
    </section>
  );
}
