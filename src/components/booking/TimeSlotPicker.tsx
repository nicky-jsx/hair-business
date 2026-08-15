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
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="mb-1 text-lg font-semibold text-gray-900">
        Select a time
      </h2>
      <p className="mb-4 text-sm text-gray-500">{formattedDate}</p>

      {availableSlots.length === 0 ? (
        <div className="rounded-2xl bg-gray-50 p-6 text-center">
          <p className="text-gray-500">No available slots on this day.</p>
          <p className="mt-1 text-sm text-gray-400">
            Please select a different date.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {slots.map((slot) => (
            <button
              key={slot.time}
              onClick={() => slot.available && onSelect(slot.time)}
              disabled={!slot.available}
              className={`rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                selectedTime === slot.time
                  ? "bg-brand-600 text-white"
                  : slot.available
                    ? "bg-white border border-gray-200 text-gray-900 hover:border-brand-200 hover:bg-brand-50"
                    : "bg-gray-50 text-gray-300 line-through"
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
