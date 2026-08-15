"use client";

import { formatPrice } from "@/types/stylist";
import type { Service } from "@/types/stylist";

interface ServiceSelectProps {
  services: Service[];
  onSelect: (service: Service) => void;
}

export function ServiceSelect({ services, onSelect }: ServiceSelectProps) {
  return (
    <div className="p-4">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        Select a service
      </h2>
      <div className="space-y-2">
        {services.map((service) => (
          <button
            key={service.name}
            onClick={() => onSelect(service)}
            className="flex w-full items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 text-left transition-all hover:border-brand-200 hover:bg-brand-50 active:scale-[0.98]"
          >
            <div>
              <p className="font-medium text-gray-900">{service.name}</p>
              <p className="text-sm text-gray-500">{service.duration}</p>
            </div>
            <p className="font-semibold text-brand-600">
              {formatPrice(service.price)}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
