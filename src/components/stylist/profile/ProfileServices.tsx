import { formatPrice } from "@/types/stylist";
import type { Service, Stylist } from "@/types/stylist";

interface ProfileServicesProps {
  services: Service[];
  stylist?: Stylist;
}

export function ProfileServices({ services, stylist }: ProfileServicesProps) {
  if (services && services.length > 0) {
    return (
      <div className="divide-y divide-outline-variant/60 overflow-hidden rounded-2xl bg-surface-container-lowest shadow-ambient border border-outline-variant/40">
        {services.map((service) => (
          <div
            key={service.name}
            className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-surface-container-low/40"
          >
            <div>
              <p className="font-display text-sm font-semibold text-primary">
                {service.name}
              </p>
              {service.duration && (
                <p className="mt-0.5 text-[11px] uppercase tracking-caps text-outline font-medium">
                  {service.duration}
                </p>
              )}
            </div>
            <p className="shrink-0 font-display text-sm font-bold text-secondary">
              {formatPrice(service.price)}
            </p>
          </div>
        ))}
      </div>
    );
  }

  // Graceful, polished service preview for profiles with customized pricing
  return (
    <div className="rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-6 shadow-ambient">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-secondary-fixed text-primary">
          <span className="material-symbols-outlined text-2xl">
            spa
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-caps text-secondary">
              Services &amp; Pricing
            </span>
            {stylist?.priceRange && (
              <>
                <span className="h-1 w-1 rounded-full bg-outline-variant" />
                <span className="rounded-md bg-surface-container px-2 py-0.5 text-[10px] font-bold text-primary">
                  {stylist.priceRange} Tier
                </span>
              </>
            )}
          </div>

          <h3 className="mt-1 font-display text-base font-bold text-primary">
            Custom Appointments &amp; Pricing
          </h3>

          <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-on-surface-variant">
            {stylist?.bio
              ? stylist.bio
              : `Bespoke styling and personalized appointments are available across ${stylist?.region || "London"}.`}
          </p>

          {stylist?.specialties && stylist.specialties.length > 0 && (
            <div className="mt-3.5 flex flex-wrap gap-1.5">
              {stylist.specialties.map((spec) => (
                <span
                  key={spec}
                  className="rounded-lg bg-surface-container px-2.5 py-1 text-[11px] font-medium text-primary"
                >
                  {spec}
                </span>
              ))}
            </div>
          )}

          <p className="mt-4 text-xs text-outline">
            Full service details and custom bookings can be arranged directly below.
          </p>
        </div>
      </div>
    </div>
  );
}
