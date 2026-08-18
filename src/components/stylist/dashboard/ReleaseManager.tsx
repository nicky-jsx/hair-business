"use client";

import { useEffect, useMemo, useState } from "react";
import {
  fetchStylistAvailability,
  fetchReleasedDates,
  releaseDate,
  unreleaseDate,
} from "@/lib/bookings-db";
import { formatTime, type StylistAvailability } from "@/types/booking";

interface ReleaseManagerProps {
  stylistId: string;
}

function formatDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function generateTimeOptions(): string[] {
  const times: string[] = [];
  for (let hour = 6; hour <= 22; hour++) {
    times.push(`${hour.toString().padStart(2, "0")}:00`);
    times.push(`${hour.toString().padStart(2, "0")}:30`);
  }
  return times;
}

export function ReleaseManager({ stylistId }: ReleaseManagerProps) {
  const [template, setTemplate] = useState<StylistAvailability[]>([]);
  const [released, setReleased] = useState<Map<string, string[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editorSlots, setEditorSlots] = useState<string[]>([]);

  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  useEffect(() => {
    Promise.all([
      fetchStylistAvailability(stylistId),
      fetchReleasedDates(stylistId),
    ]).then(([tpl, dates]) => {
      setTemplate(tpl);
      setReleased(new Map(dates.map((d) => [d.date, d.slots])));
      setLoading(false);
    });
  }, [stylistId]);

  const templateSlotsFor = (dateStr: string): string[] => {
    const dow = new Date(`${dateStr}T00:00:00`).getDay();
    const day = template.find((t) => t.dayOfWeek === dow);
    return day && day.isAvailable ? [...day.slots] : [];
  };

  const openEditor = (dateStr: string) => {
    setSelectedDate(dateStr);
    const existing = released.get(dateStr);
    setEditorSlots(existing ? [...existing] : templateSlotsFor(dateStr));
  };

  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= lastDate; i++) days.push(new Date(year, month, i));
    return days;
  }, [currentMonth]);

  const monthName = currentMonth.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  const isPastMonth =
    currentMonth.getFullYear() < today.getFullYear() ||
    (currentMonth.getFullYear() === today.getFullYear() &&
      currentMonth.getMonth() <= today.getMonth());

  const handleRelease = async () => {
    if (!selectedDate) return;
    setSaving(true);
    const slots = [...editorSlots].sort();
    const result = await releaseDate(stylistId, selectedDate, slots);
    if (!result.error) {
      setReleased((prev) => new Map(prev).set(selectedDate, slots));
      setSelectedDate(null);
    }
    setSaving(false);
  };

  const handleClose = async () => {
    if (!selectedDate) return;
    setSaving(true);
    const result = await unreleaseDate(stylistId, selectedDate);
    if (!result.error) {
      setReleased((prev) => {
        const next = new Map(prev);
        next.delete(selectedDate);
        return next;
      });
      setSelectedDate(null);
    }
    setSaving(false);
  };

  const handleReleaseMonth = async () => {
    setSaving(true);
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const updates = new Map(released);

    for (let d = 1; d <= lastDate; d++) {
      const dateObj = new Date(year, month, d);
      if (dateObj < today) continue;
      const dateStr = formatDateStr(dateObj);
      const slots = templateSlotsFor(dateStr);
      if (slots.length === 0) continue;
      const result = await releaseDate(stylistId, dateStr, slots.sort());
      if (!result.error) updates.set(dateStr, slots);
    }

    setReleased(updates);
    setSaving(false);
  };

  const addSlot = (time: string) => {
    if (!time || editorSlots.includes(time)) return;
    setEditorSlots((prev) => [...prev, time].sort());
  };
  const removeSlot = (time: string) => {
    setEditorSlots((prev) => prev.filter((t) => t !== time));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-brand-600" />
      </div>
    );
  }

  const timeOptions = generateTimeOptions();
  const remaining = timeOptions.filter((t) => !editorSlots.includes(t));
  const editingReleased = selectedDate ? released.has(selectedDate) : false;

  return (
    <div className="rounded-xl bg-surface-container-lowest p-4 shadow-ambient">
      {/* Month nav */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() =>
            setCurrentMonth(
              new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
            )
          }
          disabled={isPastMonth}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-outline transition-colors hover:bg-surface-container disabled:opacity-30"
          aria-label="Previous month"
        >
          <span className="material-symbols-outlined text-lg">chevron_left</span>
        </button>
        <h3 className="text-sm font-semibold text-primary">{monthName}</h3>
        <button
          onClick={() =>
            setCurrentMonth(
              new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
            )
          }
          className="flex h-9 w-9 items-center justify-center rounded-lg text-outline transition-colors hover:bg-surface-container"
          aria-label="Next month"
        >
          <span className="material-symbols-outlined text-lg">chevron_right</span>
        </button>
      </div>

      {/* Weekday headers */}
      <div className="mb-1 grid grid-cols-7 text-center">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="py-1 text-[11px] font-medium text-outline">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div className="grid grid-cols-7 gap-1">
        {daysInMonth.map((date, index) => {
          if (!date) return <div key={`e-${index}`} />;
          const dateStr = formatDateStr(date);
          const isPast = date < today;
          const isReleased = released.has(dateStr);
          const isSelected = dateStr === selectedDate;

          return (
            <button
              key={dateStr}
              onClick={() => !isPast && openEditor(dateStr)}
              disabled={isPast}
              className={`relative flex h-10 w-full items-center justify-center rounded-lg text-sm font-medium transition-all ${
                isSelected
                  ? "bg-primary text-white"
                  : isPast
                    ? "cursor-not-allowed text-gray-200"
                    : isReleased
                      ? "bg-secondary-fixed/60 text-primary hover:bg-secondary-fixed"
                      : "text-gray-700 hover:bg-surface-container"
              }`}
            >
              {date.getDate()}
              {isReleased && !isSelected && (
                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-secondary" />
              )}
            </button>
          );
        })}
      </div>

      {/* Release whole month */}
      <button
        onClick={handleReleaseMonth}
        disabled={saving}
        className="mt-4 w-full rounded-lg border border-outline-variant py-2 text-[13px] font-medium text-primary transition-colors hover:bg-surface-container disabled:opacity-50"
      >
        {saving ? "Working..." : "Release this month with my weekly times"}
      </button>

      {/* Date editor */}
      {selectedDate && (
        <div className="mt-4 rounded-lg border border-outline-variant p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-display text-sm font-semibold text-primary">
              {new Date(`${selectedDate}T00:00:00`).toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
            <button
              onClick={() => setSelectedDate(null)}
              className="text-outline hover:text-primary"
              aria-label="Close editor"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          {editorSlots.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {editorSlots.map((time) => (
                <span
                  key={time}
                  className="flex items-center gap-1 rounded-full bg-secondary-fixed/50 py-1 pl-3 pr-1 text-[13px] font-medium text-primary"
                >
                  {formatTime(time)}
                  <button
                    onClick={() => removeSlot(time)}
                    aria-label={`Remove ${formatTime(time)}`}
                    className="flex h-5 w-5 items-center justify-center rounded-full text-primary/70 hover:bg-primary/10 hover:text-primary"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-on-surface-variant">
              No times for this date yet — add the slots you want to offer.
            </p>
          )}

          <select
            value=""
            onChange={(e) => addSlot(e.target.value)}
            disabled={remaining.length === 0}
            className="mt-3 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
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

          <div className="mt-4 flex gap-2">
            <button
              onClick={handleRelease}
              disabled={saving || editorSlots.length === 0}
              className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingReleased
                  ? "Save changes"
                  : "Release date"}
            </button>
            {editingReleased && (
              <button
                onClick={handleClose}
                disabled={saving}
                className="rounded-lg border border-outline-variant px-4 py-2.5 text-sm font-medium text-on-surface-variant transition-colors hover:text-red-500 disabled:opacity-50"
              >
                Close date
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
