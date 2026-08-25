export interface Booking {
  id: string;
  stylistId: string;
  serviceId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  notes: string | null;
  createdAt: string;
  paymentOption: PaymentOption;
  depositAmount: number;
  totalPrice: number;
  amountPaid?: number;
  paidInFull?: boolean;
  reference?: string;
  // Joined data
  serviceName?: string;
  servicePrice?: number;
  stylistName?: string;
}

export type BookingStatus = "confirmed" | "cancelled" | "completed" | "no_show";

export type PaymentOption = "deposit" | "full";

export interface StylistAvailability {
  id: string;
  stylistId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  slots: string[]; // Specific appointment start times, e.g. ["10:00", "13:00"]
}

export interface DateAvailability {
  id: string;
  stylistId: string;
  date: string; // YYYY-MM-DD
  slots: string[];
  isOpen: boolean;
}

export interface BlockedTime {
  id: string;
  stylistId: string;
  blockedDate: string;
  startTime: string | null;
  endTime: string | null;
  reason: string | null;
}

export interface TimeSlot {
  time: string;
  label: string;
  available: boolean;
}

export interface BookingFormData {
  serviceId: string;
  servicePrice?: number;
  date: string;
  time: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes?: string;
  paymentOption: PaymentOption;
  depositAmount: number;
  totalPrice: number;
}

export const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export const DEFAULT_SLOT_INTERVAL_MINUTES = 180; // 3-hour intervals

// Options the stylist can choose from (label + minutes)
export const SLOT_INTERVAL_OPTIONS: { label: string; minutes: number }[] = [
  { label: "30 min", minutes: 30 },
  { label: "1 hour", minutes: 60 },
  { label: "1.5 hours", minutes: 90 },
  { label: "2 hours", minutes: 120 },
  { label: "3 hours", minutes: 180 },
  { label: "4 hours", minutes: 240 },
];

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

export function generateTimeSlots(
  startTime: string,
  endTime: string,
  intervalMinutes: number = DEFAULT_SLOT_INTERVAL_MINUTES
): string[] {
  const slots: string[] = [];
  const step = intervalMinutes > 0 ? intervalMinutes : DEFAULT_SLOT_INTERVAL_MINUTES;

  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);
  const start = startH * 60 + (startM || 0);
  const end = endH * 60 + (endM || 0);

  for (let mins = start; mins < end; mins += step) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    slots.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
  }

  return slots;
}
