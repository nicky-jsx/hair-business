import { formatPrice } from "@/types/stylist";
import type { Service } from "@/types/stylist";

interface ProfileServicesProps {
  services: Service[];
}

export function ProfileServices({ services }: ProfileServicesProps) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
        Services &amp; prices
      </h2>
      <div className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-100 bg-white">
        {services.map((service) => (
          <div
            key={service.name}
            className="flex items-center justify-between gap-4 px-4 py-3.5"
          >
            <div>
              <p className="font-medium text-gray-900">{service.name}</p>
              <p className="text-xs text-gray-400">{service.duration}</p>
            </div>
            <p className="shrink-0 font-semibold text-brand-600">
              {formatPrice(service.price)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
