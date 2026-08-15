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
    <div className="p-4">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        Your details
      </h2>

      {/* Booking summary */}
      <div className="mb-6 rounded-2xl bg-brand-50 p-4">
        <p className="font-medium text-gray-900">{service.name}</p>
        <p className="text-sm text-gray-600">
          {formattedDate} at {formattedTime}
        </p>
        <p className="mt-1 text-sm font-semibold text-brand-600">
          {formatPrice(service.price)}
        </p>
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
          placeholder="Any special requests or notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
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
