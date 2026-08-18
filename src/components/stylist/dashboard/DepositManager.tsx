"use client";

import { useState } from "react";
import { updateStylistDeposit } from "@/lib/stylists-db";
import type { DepositType } from "@/types/stylist";

interface DepositManagerProps {
  stylistId: string;
  initialType?: DepositType | null;
  initialValue?: number | null;
}

const OPTIONS: { id: DepositType; label: string }[] = [
  { id: "none", label: "No deposit" },
  { id: "percentage", label: "Percentage" },
  { id: "fixed", label: "Fixed amount" },
];

export function DepositManager({
  stylistId,
  initialType,
  initialValue,
}: DepositManagerProps) {
  const [type, setType] = useState<DepositType>(initialType ?? "none");
  const [value, setValue] = useState<string>(
    initialValue != null ? String(initialValue) : ""
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    const numeric = type === "none" ? 0 : Math.max(0, Number(value) || 0);
    const result = await updateStylistDeposit(stylistId, type, numeric);
    setSaving(false);
    if (!result.error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  const preview =
    type === "none"
      ? "Clients pay the full amount when booking."
      : type === "percentage"
        ? `Clients pay ${value || 0}% upfront, the rest on the day.`
        : `Clients pay £${value || 0} upfront, the rest on the day.`;

  return (
    <div className="rounded-xl bg-surface-container-lowest p-5 shadow-ambient">
      <div className="mb-4 grid grid-cols-3 gap-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setType(opt.id)}
            className={`rounded-lg border px-3 py-2 text-[13px] font-medium transition-colors ${
              type === opt.id
                ? "border-primary bg-secondary-fixed/40 text-primary"
                : "border-outline-variant text-on-surface-variant hover:border-outline"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {type !== "none" && (
        <div className="mb-4">
          <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-caps text-outline">
            {type === "percentage" ? "Deposit percentage" : "Deposit amount"}
          </label>
          <div className="relative">
            {type === "fixed" && (
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                £
              </span>
            )}
            <input
              type="number"
              min={0}
              max={type === "percentage" ? 100 : undefined}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={type === "percentage" ? "50" : "20"}
              className={`w-full rounded-lg border border-outline-variant bg-surface-container-lowest py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${
                type === "fixed" ? "pl-7 pr-3" : "px-3"
              }`}
            />
            {type === "percentage" && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                %
              </span>
            )}
          </div>
        </div>
      )}

      <p className="mb-4 text-[13px] text-on-surface-variant">{preview}</p>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {saving ? "Saving..." : saved ? "Saved" : "Save deposit settings"}
      </button>
    </div>
  );
}
