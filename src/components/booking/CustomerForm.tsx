"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/FormField";
import { formatPrice } from "@/types/stylist";
import type { Service } from "@/types/stylist";
import type { PaymentOption } from "@/types/booking";

interface CustomerFormProps {
  service: Service;
  date: string;
  time: string;
  stylistName: string;
  depositAmount: number;
  onSubmit: (data: {
    name: string;
    email: string;
    phone: string;
    notes?: string;
    paymentOption: PaymentOption;
  }) => void;
  loading: boolean;
}

export function CustomerForm({
  service,
  date,
  time,
  stylistName,
  depositAmount,
  onSubmit,
  loading,
}: CustomerFormProps) {
  const total = service.price;
  const hasDeposit = depositAmount > 0 && depositAmount < total;
  const remaining = total - depositAmount;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentOption, setPaymentOption] = useState<PaymentOption>(
    hasDeposit ? "deposit" : "full"
  );

  const formattedDate = new Date(`${date}T00:00:00`).toLocaleDateString(
    "en-GB",
    { weekday: "short", day: "numeric", month: "short" }
  );
  const formattedTime = formatTimeDisplay(time);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit({
      name,
      email,
      phone,
      notes: notes || undefined,
      paymentOption: hasDeposit ? paymentOption : "full",
    });
  }

  return (
    <div className="p-5">
      <div className="mb-6">
        <h2 className="font-display text-xl font-semibold text-primary">
          Your details
        </h2>
        <p className="mt-1 text-sm text-on-surface-variant">
          We&apos;ll send your confirmation here
        </p>
      </div>

      {/* Booking summary */}
      <div className="mb-6 rounded-xl bg-surface-container-lowest p-4 shadow-ambient">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-display font-semibold text-primary">{service.name}</p>
            <p className="mt-0.5 text-sm text-on-surface-variant">with {stylistName}</p>
          </div>
          <p className="font-display text-base font-semibold text-secondary">
            {formatPrice(total)}
          </p>
        </div>
        <div className="mt-3 flex items-center gap-4 border-t border-outline-variant/60 pt-3 text-sm text-on-surface-variant">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base text-outline">
              calendar_today
            </span>
            {formattedDate}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base text-outline">
              schedule
            </span>
            {formattedTime}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base text-outline">
              hourglass_empty
            </span>
            {service.duration}
          </span>
        </div>
      </div>

      {/* Payment options */}
      {hasDeposit && (
        <div className="mb-6">
          <h3 className="mb-3 text-[12px] font-semibold uppercase tracking-caps text-outline">
            Payment
          </h3>
          <div className="space-y-3">
            <PaymentChoice
              selected={paymentOption === "deposit"}
              onSelect={() => setPaymentOption("deposit")}
              title="Pay deposit now"
              amount={formatPrice(depositAmount)}
              subtitle={`${formatPrice(remaining)} paid in cash at your appointment`}
            />
            <PaymentChoice
              selected={paymentOption === "full"}
              onSelect={() => setPaymentOption("full")}
              title="Pay in full"
              amount={formatPrice(total)}
              subtitle="Nothing left to pay on the day"
            />
          </div>

          {/* Breakdown */}
          <div className="mt-4 space-y-2 rounded-xl bg-surface-container-low p-4">
            <div className="flex items-center justify-between text-sm text-on-surface-variant">
              <span>Service total</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-on-surface-variant">
              <span>
                {paymentOption === "deposit" ? "Deposit due now" : "Paying now"}
              </span>
              <span className="font-semibold text-primary">
                {formatPrice(paymentOption === "deposit" ? depositAmount : total)}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-outline-variant/60 pt-2 text-sm">
              <span className="text-on-surface-variant">Remaining in cash on the day</span>
              <span className="font-semibold text-primary">
                {formatPrice(paymentOption === "deposit" ? remaining : 0)}
              </span>
            </div>
          </div>
        </div>
      )}

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
            {loading
              ? "Confirming..."
              : hasDeposit && paymentOption === "deposit"
                ? `Confirm & pay ${formatPrice(depositAmount)} deposit`
                : "Confirm booking"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function PaymentChoice({
  selected,
  onSelect,
  title,
  amount,
  subtitle,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  amount: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-colors ${
        selected
          ? "border-primary bg-secondary-fixed/40"
          : "border-outline-variant bg-surface-container-lowest hover:border-outline"
      }`}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
          selected ? "border-primary" : "border-outline-variant"
        }`}
      >
        {selected && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
      </span>
      <span className="flex-1">
        <span className="flex items-center justify-between">
          <span className="font-display text-sm font-semibold text-primary">
            {title}
          </span>
          <span className="font-display text-sm font-semibold text-primary">
            {amount}
          </span>
        </span>
        <span className="mt-0.5 block text-[13px] text-on-surface-variant">
          {subtitle}
        </span>
      </span>
    </button>
  );
}

function formatTimeDisplay(time: string): string {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}
