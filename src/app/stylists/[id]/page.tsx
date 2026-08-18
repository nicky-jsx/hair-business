import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { ProfileBookingBar } from "@/components/stylist/profile/ProfileBookingBar";
import { ProfileHeader } from "@/components/stylist/profile/ProfileHeader";
import { ProfileTabs } from "@/components/stylist/profile/ProfileTabs";
import { fetchStylistById } from "@/lib/stylists-db";

export const revalidate = 60;

interface ProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function StylistProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;
  const stylist = await fetchStylistById(id);

  if (!stylist) {
    notFound();
  }

  return (
    <div className="pb-28">
      <ProfileHeader stylist={stylist} />

      <div className="mt-6 space-y-8 px-5">
        <section>
          <h2 className="mb-2 text-[12px] font-semibold uppercase tracking-caps text-outline">
            About
          </h2>
          <p className="text-sm leading-relaxed text-on-surface-variant">
            {stylist.bio}
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-[12px] font-semibold uppercase tracking-caps text-outline">
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

        <ProfileTabs stylist={stylist} />
      </div>

      {/* Sticky Book Now bar */}
      <ProfileBookingBar stylist={stylist} />
    </div>
  );
}
