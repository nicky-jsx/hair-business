import { formatPrice } from "@/types/stylist";
import type { Service } from "@/types/stylist";

interface ProfileServicesProps {
  services: Service[];
}

export function ProfileServices({ services }: ProfileServicesProps) {
  return (
    <div className="divide-y divide-outline-variant/60 overflow-hidden rounded-xl bg-surface-container-lowest shadow-ambient">
      {services.map((service) => (
        <div
          key={service.name}
          className="flex items-center justify-between gap-4 px-5 py-4"
        >
          <div>
            <p className="font-display text-sm font-semibold text-primary">
              {service.name}
            </p>
            <p className="mt-0.5 text-[12px] uppercase tracking-caps text-outline">
              {service.duration}
            </p>
          </div>
          <p className="shrink-0 font-display text-sm font-semibold text-secondary">
            {formatPrice(service.price)}
          </p>
        </div>
      ))}
    </div>
  );
}
