"use client";

import { useEffect, useState } from "react";
import { fetchStylistAvailability, updateAvailability } from "@/lib/bookings-db";
import { DAYS_OF_WEEK, formatTime, type StylistAvailability } from "@/types/booking";

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
      prev.map((a) => (a.dayOfWeek === dayOfWeek ? { ...a, isAvailable } : a))
    );
    setSaving(null);
  };

  const persistSlots = async (dayOfWeek: number, slots: string[]) => {
    setSaving(dayOfWeek);
    setAvailability((prev) =>
      prev.map((a) => (a.dayOfWeek === dayOfWeek ? { ...a, slots } : a))
    );
    await updateAvailability(stylistId, dayOfWeek, { slots });
    setSaving(null);
  };

  const handleAddSlot = (day: StylistAvailability, time: string) => {
    if (!time || day.slots.includes(time)) return;
    const next = [...day.slots, time].sort();
    persistSlots(day.dayOfWeek, next);
  };

  const handleRemoveSlot = (day: StylistAvailability, time: string) => {
    const next = day.slots.filter((t) => t !== time);
    persistSlots(day.dayOfWeek, next);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-brand-600" />
      </div>
    );
  }

  const timeOptions = generateTimeOptions();

  return (
    <div className="space-y-3">
      {availability
        .slice()
        .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
        .map((day) => {
          const remaining = timeOptions.filter((t) => !day.slots.includes(t));
          return (
            <div
              key={day.dayOfWeek}
              className="rounded-xl bg-surface-container-lowest p-4 shadow-ambient"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggle(day.dayOfWeek, !day.isAvailable)}
                  disabled={saving === day.dayOfWeek}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    day.isAvailable ? "bg-primary" : "bg-outline-variant"
                  } ${saving === day.dayOfWeek ? "opacity-50" : ""}`}
                  role="switch"
                  aria-checked={day.isAvailable}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                      day.isAvailable ? "left-[22px]" : "left-0.5"
                    }`}
                  />
                </button>
                <span
                  className={`font-display text-sm font-semibold ${
                    day.isAvailable ? "text-primary" : "text-on-surface-variant"
                  }`}
                >
                  {DAYS_OF_WEEK[day.dayOfWeek]}
                </span>
              </div>

              {day.isAvailable && (
                <div className="mt-3">
                  {day.slots.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {day.slots.map((time) => (
                        <span
                          key={time}
                          className="flex items-center gap-1 rounded-full bg-secondary-fixed/50 py-1 pl-3 pr-1 text-[13px] font-medium text-primary"
                        >
                          {formatTime(time)}
                          <button
                            onClick={() => handleRemoveSlot(day, time)}
                            disabled={saving === day.dayOfWeek}
                            aria-label={`Remove ${formatTime(time)}`}
                            className="flex h-5 w-5 items-center justify-center rounded-full text-primary/70 hover:bg-primary/10 hover:text-primary"
                          >
                            <span className="material-symbols-outlined text-sm">
                              close
                            </span>
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[13px] text-on-surface-variant">
                      No times yet — add the slots you want to offer.
                    </p>
                  )}

                  <div className="mt-3">
                    <select
                      value=""
                      onChange={(e) => handleAddSlot(day, e.target.value)}
                      disabled={saving === day.dayOfWeek || remaining.length === 0}
                      className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                    >
                      <option value="" disabled>
                        {remaining.length === 0 ? "All times added" : "+ Add a time"}
                      </option>
                      {remaining.map((time) => (
                        <option key={time} value={time}>
                          {formatTime(time)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
}

function generateTimeOptions(): string[] {
  const times: string[] = [];
  for (let hour = 6; hour <= 22; hour++) {
    times.push(`${hour.toString().padStart(2, "0")}:00`);
    times.push(`${hour.toString().padStart(2, "0")}:30`);
  }
  return times;
}
