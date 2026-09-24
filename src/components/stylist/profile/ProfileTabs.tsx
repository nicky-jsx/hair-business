"use client";

import { useState } from "react";
import { ProfileServices } from "@/components/stylist/profile/ProfileServices";
import { ProfilePortfolio } from "@/components/stylist/profile/ProfilePortfolio";
import { ProfileReviews } from "@/components/stylist/profile/ProfileReviews";
import { ProfilePolicy } from "@/components/stylist/profile/ProfilePolicy";
import type { Stylist } from "@/types/stylist";

interface ProfileTabsProps {
  stylist: Stylist;
}

type TabId = "services" | "portfolio" | "reviews" | "policy";

export function ProfileTabs({ stylist }: ProfileTabsProps) {
  const [active, setActive] = useState<TabId>("services");

  const hasCustomPolicy = Boolean(
    stylist.bookingPolicy &&
      (stylist.bookingPolicy.deposit ||
        stylist.bookingPolicy.cancellation ||
        stylist.bookingPolicy.lateness ||
        stylist.bookingPolicy.noShow ||
        stylist.bookingPolicy.additionalNotes)
  );

  const tabs: { id: TabId; label: string }[] = [
    { id: "services", label: "Services" },
    { id: "portfolio", label: "Portfolio" },
    ...(hasCustomPolicy ? [{ id: "policy" as TabId, label: "Booking Policy" }] : []),
    { id: "reviews", label: "Reviews" },
  ];

  return (
    <section>
      {/* Tab bar */}
      <div className="sticky top-16 z-10 -mx-5 mb-6 border-b border-outline-variant bg-background/90 px-5 backdrop-blur-md">
        <div className="flex gap-6 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map((tab) => {
            const isActive = active === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className={`relative -mb-px shrink-0 whitespace-nowrap py-3 text-[12px] font-semibold uppercase tracking-caps transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                <span>{tab.label}</span>
                {isActive && (
                  <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      {active === "services" && (
        <ProfileServices services={stylist.services} stylist={stylist} />
      )}
      {active === "portfolio" && (
        <ProfilePortfolio
          photos={stylist.portfolio}
          stylistName={stylist.name}
          instagramUrl={stylist.instagramUrl}
          stylistId={stylist.id}
          verified={stylist.verified}
        />
      )}
      {active === "reviews" && (
        <ProfileReviews
          reviews={stylist.reviews}
          rating={stylist.rating}
          reviewCount={stylist.reviewCount}
          verified={stylist.verified}
          stylistName={stylist.name}
        />
      )}
      {active === "policy" && <ProfilePolicy policy={stylist.bookingPolicy} />}
    </section>
  );
}
