"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/FormField";
import { formatPrice } from "@/types/stylist";
import type { Service } from "@/types/stylist";

interface CustomerFormProps {
  service: Service;
  date: string;
  time: string;
  stylistName: string;
  onSubmit: (data: {
    name: string;
    email: string;
    phone: string;
    notes?: string;
  }) => void;
  loading: boolean;
}

export function CustomerForm({
  service,
  date,
  time,
  stylistName,
  onSubmit,
  loading,
}: CustomerFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const formattedDate = new Date(date).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  const formattedTime = formatTimeDisplay(time);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit({ name, email, phone, notes: notes || undefined });
  }

  return (
    <div className="p-5">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Your details
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          We&apos;ll send your confirmation here
        </p>
      </div>

      {/* Booking summary */}
      <div className="mb-6 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-semibold text-gray-900">{service.name}</p>
            <p className="mt-0.5 text-sm text-gray-500">with {stylistName}</p>
          </div>
          <p className="text-base font-semibold text-brand-600">
            {formatPrice(service.price)}
          </p>
        </div>
        <div className="mt-3 flex items-center gap-4 border-t border-gray-50 pt-3">
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4 text-gray-400"
            >
              <path d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Z" />
            </svg>
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
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
            <span>{formattedTime}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
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
            <span>{service.duration}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full name"
          name="name"
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="name"
        />

        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />

        <Input
          label="Phone number"
          name="phone"
          type="tel"
          placeholder="07123 456789"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          autoComplete="tel"
        />

        <Textarea
          label="Notes (optional)"
          name="notes"
          placeholder="Any special requests..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />

        <div className="pt-2">
          <Button type="submit" fullWidth size="lg" disabled={loading}>
            {loading ? "Confirming..." : "Confirm booking"}
          </Button>
        </div>
      </form>
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
