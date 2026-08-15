"use client";

import { useEffect, useState } from "react";
import { fetchStylistAvailability, updateAvailability } from "@/lib/bookings-db";
import { DAYS_OF_WEEK, type StylistAvailability } from "@/types/booking";

interface AvailabilityManagerProps {
  stylistId: string;
}

export function AvailabilityManager({ stylistId }: AvailabilityManagerProps) {
  const [availability, setAvailability] = useState<StylistAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);

  useEffect(() => {
    fetchStylistAvailability(stylistId).then((data) => {
      setAvailability(data);
      setLoading(false);
    });
  }, [stylistId]);

  const handleToggle = async (dayOfWeek: number, isAvailable: boolean) => {
    setSaving(dayOfWeek);
    await updateAvailability(stylistId, dayOfWeek, { isAvailable });

    setAvailability((prev) =>
      prev.map((a) =>
        a.dayOfWeek === dayOfWeek ? { ...a, isAvailable } : a
      )
    );
    setSaving(null);
  };

  const handleTimeChange = async (
    dayOfWeek: number,
    field: "startTime" | "endTime",
    value: string
  ) => {
    setSaving(dayOfWeek);
    await updateAvailability(stylistId, dayOfWeek, { [field]: value });

    setAvailability((prev) =>
      prev.map((a) =>
        a.dayOfWeek === dayOfWeek ? { ...a, [field]: value } : a
      )
    );
    setSaving(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-card">
      <div className="border-b border-gray-100 px-4 py-3">
        <h2 className="font-semibold text-gray-900">Working hours</h2>
        <p className="text-xs text-gray-500">Set your availability for each day</p>
      </div>

      <div className="divide-y divide-gray-100">
        {availability
          .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
          .map((day) => (
            <div
              key={day.dayOfWeek}
              className={`flex items-center justify-between px-4 py-3 ${
                !day.isAvailable ? "bg-gray-50" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggle(day.dayOfWeek, !day.isAvailable)}
                  disabled={saving === day.dayOfWeek}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    day.isAvailable ? "bg-brand-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      day.isAvailable ? "left-[22px]" : "left-0.5"
                    }`}
                  />
                </button>
                <span
                  className={`text-sm font-medium ${
                    day.isAvailable ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  {DAYS_OF_WEEK[day.dayOfWeek]}
                </span>
              </div>

              {day.isAvailable && (
                <div className="flex items-center gap-2 text-sm">
                  <select
                    value={day.startTime}
                    onChange={(e) =>
                      handleTimeChange(day.dayOfWeek, "startTime", e.target.value)
                    }
                    disabled={saving === day.dayOfWeek}
                    className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs"
                  >
                    {generateTimeOptions().map((time) => (
                      <option key={time} value={time}>
                        {formatTime(time)}
                      </option>
                    ))}
                  </select>
                  <span className="text-gray-400">–</span>
                  <select
                    value={day.endTime}
                    onChange={(e) =>
                      handleTimeChange(day.dayOfWeek, "endTime", e.target.value)
                    }
                    disabled={saving === day.dayOfWeek}
                    className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs"
                  >
                    {generateTimeOptions().map((time) => (
                      <option key={time} value={time}>
                        {formatTime(time)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}

function generateTimeOptions(): string[] {
  const times: string[] = [];
  for (let hour = 6; hour <= 22; hour++) {
    times.push(`${hour.toString().padStart(2, "0")}:00`);
  }
  return times;
}

function formatTime(time: string): string {
  const [hours] = time.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:00 ${ampm}`;
}
