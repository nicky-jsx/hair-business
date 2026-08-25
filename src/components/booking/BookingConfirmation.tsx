"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/types/stylist";
import type { Stylist } from "@/types/stylist";
import type { Booking } from "@/types/booking";

interface BookingConfirmationProps {
  booking: Booking;
  stylist: Stylist;
  manageUrl?: string | null;
  onClose: () => void;
}

export function BookingConfirmation({
  booking,
  stylist,
  manageUrl,
  onClose,
}: BookingConfirmationProps) {
  const reference = booking.reference || booking.id.slice(0, 8).toUpperCase();
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
  const formattedEndTime = formatTimeDisplay(booking.endTime);

  const calendarUrl = generateCalendarUrl(booking, stylist);

  return (
    <div className="flex flex-col p-5">
      {/* Success header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
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
        <h2 className="text-2xl font-semibold text-gray-900">
          You&apos;re all booked!
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          A confirmation has been sent to<br />
          <span className="font-medium text-gray-700">{booking.customerEmail}</span>
        </p>
      </div>

      {/* Booking details card */}
      <div className="mb-6 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        {/* Stylist info */}
        <div className="flex items-center gap-3 pb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-lg font-semibold text-brand-600">
            {stylist.name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{stylist.name}</p>
            <p className="text-sm text-gray-500">{booking.serviceName}</p>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-3 border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Date</span>
            <span className="text-sm font-medium text-gray-900">{formattedDate}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Time</span>
            <span className="text-sm font-medium text-gray-900">
              {formattedTime} – {formattedEndTime}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Service total</span>
            <span className="text-sm font-medium text-gray-900">
              {formatPrice(booking.totalPrice || booking.servicePrice || 0)}
            </span>
          </div>
          {booking.paymentOption === "deposit" && booking.depositAmount > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Deposit paid</span>
                <span className="text-sm font-semibold text-green-600">
                  {formatPrice(booking.depositAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Due in cash on the day</span>
                <span className="text-sm font-semibold text-brand-600">
                  {formatPrice(
                    (booking.totalPrice || booking.servicePrice || 0) -
                      booking.depositAmount
                  )}
                </span>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Paid in full</span>
              <span className="text-sm font-semibold text-green-600">
                {formatPrice(booking.totalPrice || booking.servicePrice || 0)}
              </span>
            </div>
          )}
        </div>

        {/* Reference */}
        <div className="mt-4 rounded-lg bg-gray-50 px-3 py-2 text-center">
          <p className="text-xs text-gray-400">Booking reference</p>
          <p className="font-mono text-sm font-medium text-gray-700">
            {reference}
          </p>
        </div>
      </div>

      {/* Manage booking */}
      {manageUrl && (
        <div className="mb-6 rounded-xl border border-brand-100 bg-brand-50/50 p-4">
          <p className="text-sm font-medium text-gray-900">Need to make changes?</p>
          <p className="mt-1 text-[13px] text-gray-500">
            Cancel, reschedule, pay your balance or leave a review from your
            booking page. We&apos;ve saved it on this device.
          </p>
          <Link
            href={manageUrl}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            Manage booking
            <span aria-hidden>→</span>
          </Link>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        <a
          href={calendarUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5 text-gray-400"
          >
            <path d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" />
          </svg>
          Add to calendar
        </a>

        <Button onClick={onClose} fullWidth size="lg">
          Done
        </Button>

        <Link
          href="/"
          className="block text-center text-sm text-gray-500 hover:text-gray-700"
        >
          Discover more stylists
        </Link>
      </div>
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

function generateCalendarUrl(booking: Booking, stylist: Stylist): string {
  const startDate = new Date(`${booking.bookingDate}T${booking.startTime}`);
  const endDate = new Date(`${booking.bookingDate}T${booking.endTime}`);

  const formatForCalendar = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  const title = encodeURIComponent(`${booking.serviceName} with ${stylist.name}`);
  const details = encodeURIComponent(
    `Booking reference: ${booking.id.slice(0, 8).toUpperCase()}`
  );

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatForCalendar(startDate)}/${formatForCalendar(endDate)}&details=${details}`;
}
