import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { BookNowButton } from "@/components/stylist/profile/BookNowButton";
import { ProfileHeader } from "@/components/stylist/profile/ProfileHeader";
import { ProfilePortfolio } from "@/components/stylist/profile/ProfilePortfolio";
import { ProfileServices } from "@/components/stylist/profile/ProfileServices";
import { getStylistById } from "@/data/stylists";

interface ProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function StylistProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;
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
      <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-lg -translate-x-1/2 border-t border-gray-100 bg-white/95 px-5 py-4 backdrop-blur-md safe-bottom">
        <BookNowButton stylistName={stylist.name} fullWidth />
      </div>
    </div>
  );
}
