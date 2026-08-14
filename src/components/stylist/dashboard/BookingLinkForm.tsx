"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/FormField";
import { useStylistStore } from "@/context/StylistStoreProvider";
import {
  isValidBookingUrl,
  normaliseBookingUrl,
  type Stylist,
} from "@/types/stylist";

interface BookingLinkFormProps {
  profile: Stylist;
}

export function BookingLinkForm({ profile }: BookingLinkFormProps) {
  const { updateProfile } = useStylistStore();
  const [url, setUrl] = useState(profile.bookingUrl ?? "");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(false);

    if (!isValidBookingUrl(url)) {
      setError("Please enter a valid URL.");
      return;
    }

    updateProfile({
      ...profile,
      bookingUrl: normaliseBookingUrl(url),
    });
    setSaved(true);
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-card">
      <h2 className="font-semibold text-gray-900">Booking link</h2>
      <p className="mt-1 mb-4 text-sm text-gray-500">
        Add a link to your existing booking page — Square, Fresha, Calendly, or
        your own website.
      </p>

      {error && (
        <div className="mb-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {saved && (
        <div className="mb-3 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
          Booking link saved.
        </div>
      )}

      <Input
        label="External booking URL"
        name="bookingUrl"
        type="url"
        placeholder="https://book.fresha.com/your-salon"
        value={url}
        onChange={(e) => {
          setUrl(e.target.value);
          setSaved(false);
        }}
      />

      <Button type="submit" fullWidth className="mt-4">
        Save booking link
      </Button>
    </form>
  );
}
