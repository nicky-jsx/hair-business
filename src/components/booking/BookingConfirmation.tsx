"use client";

import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/types/stylist";
import type { Stylist } from "@/types/stylist";
import type { Booking } from "@/types/booking";

interface BookingConfirmationProps {
  booking: Booking;
  stylist: Stylist;
  onClose: () => void;
}

export function BookingConfirmation({
  booking,
  stylist,
  onClose,
}: BookingConfirmationProps) {
  const formattedDate = new Date(booking.bookingDate).toLocaleDateString(
    "en-GB",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );

  const formattedTime = formatTimeDisplay(booking.startTime);

  return (
    <div className="flex flex-col items-center p-6 text-center">
      {/* Success icon */}
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-8 w-8 text-green-600"
        >
          <path
            fillRule="evenodd"
            d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      <h2 className="mb-2 text-xl font-semibold text-gray-900">
        Booking confirmed!
      </h2>
      <p className="mb-6 text-sm text-gray-500">
        A confirmation has been sent to {booking.customerEmail}
      </p>

      {/* Booking details card */}
      <div className="mb-6 w-full rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-card">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-lg font-bold text-brand-600">
            {stylist.name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{stylist.name}</p>
            <p className="text-sm text-gray-500">{booking.serviceName}</p>
          </div>
        </div>

        <div className="space-y-3 border-t border-gray-100 pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Date</span>
            <span className="font-medium text-gray-900">{formattedDate}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Time</span>
            <span className="font-medium text-gray-900">{formattedTime}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Duration</span>
            <span className="font-medium text-gray-900">
              {booking.startTime} – {formatTimeDisplay(booking.endTime)}
            </span>
          </div>
          {booking.servicePrice && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Price</span>
              <span className="font-semibold text-brand-600">
                {formatPrice(booking.servicePrice)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Reference number */}
      <p className="mb-6 text-xs text-gray-400">
        Booking reference: {booking.id.slice(0, 8).toUpperCase()}
      </p>

      <Button onClick={onClose} fullWidth size="lg">
        Done
      </Button>
    </div>
  );
}

function formatTimeDisplay(time: string): string {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}
