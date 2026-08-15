"use client";

import { notFound } from "next/navigation";
import { use } from "react";
import { Badge } from "@/components/ui/Badge";
import { ProfileBookingBar } from "@/components/stylist/profile/ProfileBookingBar";
import { ProfileHeader } from "@/components/stylist/profile/ProfileHeader";
import { ProfilePortfolio } from "@/components/stylist/profile/ProfilePortfolio";
import { ProfileServices } from "@/components/stylist/profile/ProfileServices";
import { useStylistStore } from "@/context/StylistStoreProvider";

interface StylistProfileViewProps {
  params: Promise<{ id: string }>;
}

export function StylistProfileView({ params }: StylistProfileViewProps) {
  const { id } = use(params);
  const { ready, getStylistById } = useStylistStore();

  if (!ready) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  const stylist = getStylistById(id);

  if (!stylist) {
    notFound();
  }

  return (
    <div className="pb-28">
      <ProfileHeader stylist={stylist} />

      <div className="mt-6 space-y-8 px-5">
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-400">
            About
          </h2>
          <p className="text-sm leading-relaxed text-gray-600">{stylist.bio}</p>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
            Specialties
          </h2>
          <div className="flex flex-wrap gap-2">
            {stylist.specialties.map((specialty) => (
              <Badge key={specialty} variant="brand">
                {specialty}
              </Badge>
            ))}
          </div>
        </section>

        <ProfileServices services={stylist.services} />

        <ProfilePortfolio
          photos={stylist.portfolio}
          stylistName={stylist.name}
        />
      </div>

      {/* Sticky Book Now bar */}
      <ProfileBookingBar stylist={stylist} />
    </div>
  );
}
