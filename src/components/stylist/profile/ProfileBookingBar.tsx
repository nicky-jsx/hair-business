"use client";

import { useState } from "react";
import { BookingFlow } from "@/components/booking/BookingFlow";
import type { Stylist } from "@/types/stylist";

interface ProfileBookingBarProps {
  stylist: Stylist;
}

export function ProfileBookingBar({ stylist }: ProfileBookingBarProps) {
  const [showBooking, setShowBooking] = useState(false);

  return (
    <>
      <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-lg -translate-x-1/2 border-t border-gray-100 bg-white/95 px-5 py-4 backdrop-blur-md safe-bottom">
        <button
          onClick={() => setShowBooking(true)}
          className="w-full rounded-xl bg-brand-600 px-6 py-3 text-base font-medium text-white shadow-sm transition-all hover:bg-brand-700 active:bg-brand-800"
        >
          Book Now
        </button>
      </div>

      {showBooking && (
        <BookingFlow stylist={stylist} onClose={() => setShowBooking(false)} />
      )}
    </>
  );
}
