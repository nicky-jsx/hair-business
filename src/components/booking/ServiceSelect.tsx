"use client";

import { formatPrice } from "@/types/stylist";
import type { Service } from "@/types/stylist";

interface ServiceSelectProps {
  services: Service[];
  onSelect: (service: Service) => void;
}

export function ServiceSelect({ services, onSelect }: ServiceSelectProps) {
  return (
    <div className="p-5">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Choose a service
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Select the service you&apos;d like to book
        </p>
      </div>

      <div className="space-y-3">
        {services.map((service) => (
          <button
            key={service.name}
            onClick={() => onSelect(service)}
            className="group flex w-full items-center justify-between rounded-xl border border-gray-100 bg-white p-4 text-left shadow-sm transition-all hover:border-gray-200 hover:shadow-card active:scale-[0.99]"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900 group-hover:text-brand-700">
                {service.name}
              </p>
              <p className="mt-0.5 text-sm text-gray-400">{service.duration}</p>
            </div>
            <div className="ml-4 flex items-center gap-3">
              <p className="text-base font-semibold text-gray-900">
                {formatPrice(service.price)}
              </p>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-5 w-5 text-gray-300 transition-colors group-hover:text-brand-500"
              >
                <path
                  fillRule="evenodd"
                  d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
