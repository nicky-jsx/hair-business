import { DEFAULT_BOOKING_POLICY } from "@/types/stylist";
import type { BookingPolicy } from "@/types/stylist";

interface ProfilePolicyProps {
  policy?: BookingPolicy | null;
}

const POLICY_ITEMS: { key: keyof BookingPolicy; label: string; icon: string }[] = [
  { key: "deposit", label: "Deposit", icon: "payments" },
  { key: "cancellation", label: "Cancellation & rescheduling", icon: "event_busy" },
  { key: "lateness", label: "Lateness", icon: "schedule" },
  { key: "noShow", label: "No-shows", icon: "person_off" },
];

export function ProfilePolicy({ policy }: ProfilePolicyProps) {
  const resolved = policy ?? DEFAULT_BOOKING_POLICY;

  return (
    <div className="space-y-3">
      {POLICY_ITEMS.map((item) => {
        const value = resolved[item.key];
        if (!value) return null;

        return (
          <div
            key={item.key}
            className="flex gap-4 rounded-xl bg-surface-container-lowest p-4 shadow-ambient"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-fixed text-primary">
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
            </span>
            <div>
              <h3 className="font-display text-sm font-semibold text-primary">
                {item.label}
              </h3>
              <p className="mt-1 text-[13px] leading-relaxed text-on-surface-variant">
                {value}
              </p>
            </div>
          </div>
        );
      })}

      {resolved.additionalNotes ? (
        <div className="rounded-xl border border-outline-variant bg-transparent p-4">
          <h3 className="text-[12px] font-semibold uppercase tracking-caps text-outline">
            Additional notes
          </h3>
          <p className="mt-2 text-[13px] leading-relaxed text-on-surface-variant">
            {resolved.additionalNotes}
          </p>
        </div>
      ) : null}
    </div>
  );
}
