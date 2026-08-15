"use client";

import { useState } from "react";
import { BookingFlow } from "@/components/booking/BookingFlow";
import type { Stylist } from "@/types/stylist";

interface BookNowButtonProps {
  stylist: Stylist;
  fullWidth?: boolean;
  className?: string;
}

export function BookNowButton({
  stylist,
  fullWidth = false,
  className = "",
}: BookNowButtonProps) {
  const [showBooking, setShowBooking] = useState(false);

  const baseStyles = `inline-flex items-center justify-center rounded-xl bg-brand-600 px-6 py-3 text-base font-medium text-white shadow-sm transition-all duration-150 hover:bg-brand-700 active:bg-brand-800 ${fullWidth ? "w-full" : ""} ${className}`;

  return (
    <>
      <button
        type="button"
        onClick={() => setShowBooking(true)}
        className={baseStyles}
      >
        Book Now
      </button>

      {showBooking && (
        <BookingFlow
          stylist={stylist}
          onClose={() => setShowBooking(false)}
        />
      )}
    </>
  );
}
