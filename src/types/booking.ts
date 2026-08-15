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
  status: "confirmed" | "cancelled" | "completed";
  notes: string | null;
  createdAt: string;
  // Joined data
  serviceName?: string;
  servicePrice?: number;
  stylistName?: string;
}

export interface StylistAvailability {
  id: string;
  stylistId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
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

export const TIME_SLOT_INTERVAL = 3; // 3-hour intervals

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
  intervalHours: number = TIME_SLOT_INTERVAL
): string[] {
  const slots: string[] = [];
  const [startHour] = startTime.split(":").map(Number);
  const [endHour] = endTime.split(":").map(Number);

  for (let hour = startHour; hour < endHour; hour += intervalHours) {
    slots.push(`${hour.toString().padStart(2, "0")}:00`);
  }

  return slots;
}
