"use client";

import { useEffect, useState } from "react";
import { fetchUpcomingBookings, cancelBooking } from "@/lib/bookings-db";
import { formatPrice } from "@/types/stylist";
import type { Booking } from "@/types/booking";

interface BookingsListProps {
  stylistId: string;
}

export function BookingsList({ stylistId }: BookingsListProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    fetchUpcomingBookings(stylistId).then((data) => {
      setBookings(data);
      setLoading(false);
    });
  }, [stylistId]);

  const handleCancel = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    setCancelling(bookingId);
    const result = await cancelBooking(bookingId);

    if (!result.error) {
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
    }
    setCancelling(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-brand-600" />
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
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
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
            />
          </svg>
        </div>
        <p className="font-medium text-gray-900">No upcoming bookings</p>
        <p className="mt-1 text-sm text-gray-500">
          Bookings will appear here when customers book with you
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bookings.map((booking) => {
        const date = parseLocalDate(booking.bookingDate);
        const isToday = isDateToday(date);
        const isTomorrow = isDateTomorrow(date);

        const dateLabel = isToday
          ? "Today"
          : isTomorrow
            ? "Tomorrow"
            : date.toLocaleDateString("en-GB", {
                weekday: "short",
                day: "numeric",
                month: "short",
              });

        return (
          <div
            key={booking.id}
            className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-gray-900">
                  {booking.customerName}
                </p>
                <p className="mt-0.5 text-sm text-brand-600">{booking.serviceName}</p>
              </div>
              {booking.servicePrice && (
                <span className="text-sm font-semibold text-gray-900">
                  {formatPrice(booking.servicePrice)}
                </span>
              )}
            </div>

            <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4 text-gray-400"
                >
                  <path d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Z" />
                </svg>
                <span className={isToday ? "font-medium text-brand-600" : ""}>
                  {dateLabel}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4 text-gray-400"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>
                  {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
                </span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-gray-50 pt-3">
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <a
                  href={`mailto:${booking.customerEmail}`}
                  className="hover:text-brand-600 hover:underline"
                >
                  {booking.customerEmail}
                </a>
                <span className="text-gray-200">·</span>
                <a
                  href={`tel:${booking.customerPhone}`}
                  className="hover:text-brand-600 hover:underline"
                >
                  {booking.customerPhone}
                </a>
              </div>
              <button
                onClick={() => handleCancel(booking.id)}
                disabled={cancelling === booking.id}
                className="text-xs font-medium text-gray-400 transition-colors hover:text-red-500 disabled:opacity-50"
              >
                {cancelling === booking.id ? "Cancelling..." : "Cancel"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function isDateToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

function isDateTomorrow(date: Date): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return (
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear()
  );
}
