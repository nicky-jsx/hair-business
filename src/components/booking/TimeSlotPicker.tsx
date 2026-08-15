"use client";

import { useEffect, useState } from "react";
import { getAvailableSlots } from "@/lib/bookings-db";
import type { TimeSlot } from "@/types/booking";

interface TimeSlotPickerProps {
  stylistId: string;
  date: string;
  serviceDuration: number;
  selectedTime: string;
  onSelect: (time: string) => void;
}

export function TimeSlotPicker({
  stylistId,
  date,
  serviceDuration,
  selectedTime,
  onSelect,
}: TimeSlotPickerProps) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getAvailableSlots(stylistId, date, serviceDuration).then((data) => {
      setSlots(data);
      setLoading(false);
    });
  }, [stylistId, date, serviceDuration]);

  const formattedDate = new Date(date).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const availableSlots = slots.filter((s) => s.available);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-brand-600" />
        <p className="mt-3 text-sm text-gray-400">Loading available times...</p>
      </div>
    );
  }

  return (
    <div className="p-5">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Choose a time
        </h2>
        <p className="mt-1 text-sm text-gray-500">{formattedDate}</p>
      </div>

      {availableSlots.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6 text-gray-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          </div>
          <p className="font-medium text-gray-900">No available times</p>
          <p className="mt-1 text-sm text-gray-500">
            Try selecting a different date
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {slots.map((slot) => (
            <button
              key={slot.time}
              onClick={() => slot.available && onSelect(slot.time)}
              disabled={!slot.available}
              className={`rounded-xl px-4 py-3.5 text-sm font-medium transition-all ${
                selectedTime === slot.time
                  ? "bg-brand-600 text-white shadow-sm"
                  : slot.available
                    ? "border border-gray-100 bg-white text-gray-900 shadow-sm hover:border-gray-200 hover:shadow-card"
                    : "cursor-not-allowed bg-gray-50 text-gray-300 line-through"
              }`}
            >
              {slot.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
