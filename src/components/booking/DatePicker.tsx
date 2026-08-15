"use client";

import { useState, useMemo } from "react";

interface DatePickerProps {
  selectedDate: string;
  onSelect: (date: string) => void;
}

export function DatePicker({ selectedDate, onSelect }: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    const days: (Date | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= lastDate; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  }, [currentMonth]);

  const monthName = currentMonth.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  const goToPrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const isPastMonth =
    currentMonth.getFullYear() < today.getFullYear() ||
    (currentMonth.getFullYear() === today.getFullYear() &&
      currentMonth.getMonth() <= today.getMonth());

  return (
    <div className="p-5">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Pick a date
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Choose your preferred appointment date
        </p>
      </div>

      {/* Calendar card */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        {/* Month navigation */}
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={goToPrevMonth}
            disabled={isPastMonth}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
            aria-label="Previous month"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path
                fillRule="evenodd"
                d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <h3 className="text-sm font-semibold text-gray-900">{monthName}</h3>
          <button
            onClick={goToNextMonth}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600"
            aria-label="Next month"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path
                fillRule="evenodd"
                d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Weekday headers */}
        <div className="mb-2 grid grid-cols-7 text-center">
          {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
            <div key={i} className="py-2 text-xs font-medium text-gray-400">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {daysInMonth.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} />;
            }

            const dateStr = date.toISOString().split("T")[0];
            const isPast = date < today;
            const isSelected = dateStr === selectedDate;
            const isToday = date.getTime() === today.getTime();

            return (
              <button
                key={dateStr}
                onClick={() => !isPast && onSelect(dateStr)}
                disabled={isPast}
                className={`flex h-10 w-full items-center justify-center rounded-lg text-sm font-medium transition-all ${
                  isSelected
                    ? "bg-brand-600 text-white shadow-sm"
                    : isPast
                      ? "cursor-not-allowed text-gray-200"
                      : isToday
                        ? "bg-brand-50 text-brand-700 hover:bg-brand-100"
                        : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
