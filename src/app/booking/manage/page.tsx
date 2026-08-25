"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DatePicker } from "@/components/booking/DatePicker";
import { TimeSlotPicker } from "@/components/booking/TimeSlotPicker";
import { fetchReleasedDates } from "@/lib/bookings-db";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  getManagedBooking,
  recoverBooking,
  cancelMyBooking,
  rescheduleMyBooking,
  payMyBalance,
  submitReview,
} from "@/lib/customer-bookings";
import { formatTime } from "@/types/booking";
import { formatPrice } from "@/types/stylist";
import type { Booking } from "@/types/booking";

function minutesBetween(start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return eh * 60 + em - (sh * 60 + sm);
}

function StatusBadge({ status }: { status: Booking["status"] }) {
  const map: Record<Booking["status"], { label: string; cls: string }> = {
    confirmed: { label: "Confirmed", cls: "bg-green-50 text-green-700" },
    completed: { label: "Completed", cls: "bg-brand-50 text-brand-700" },
    cancelled: { label: "Cancelled", cls: "bg-red-50 text-red-600" },
    no_show: { label: "No-show", cls: "bg-gray-100 text-gray-500" },
  };
  const s = map[status];
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${s.cls}`}>
      {s.label}
    </span>
  );
}

function ManageInner() {
  const params = useSearchParams();
  const urlId = params.get("id");
  const urlToken = params.get("t");

  const [id, setId] = useState<string | null>(urlId);
  const [token, setToken] = useState<string | null>(urlToken);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(Boolean(urlId && urlToken));
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // recovery form
  const [reference, setReference] = useState("");
  const [email, setEmail] = useState("");
  const [recovering, setRecovering] = useState(false);

  // view state
  const [mode, setMode] = useState<"view" | "reschedule" | "review">("view");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (bookingId: string, bookingToken: string) => {
    setLoading(true);
    const b = await getManagedBooking(bookingId, bookingToken);
    setLoading(false);
    if (!b) {
      setError("This booking link is no longer valid.");
      setBooking(null);
      return;
    }
    setBooking(b);
    setError("");
  }, []);

  useEffect(() => {
    if (urlId && urlToken) {
      setId(urlId);
      setToken(urlToken);
      load(urlId, urlToken);
    }
  }, [urlId, urlToken, load]);

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecovering(true);
    setError("");
    const result = await recoverBooking(reference, email);
    setRecovering(false);
    if (result.error || !result.id || !result.token) {
      setError(result.error || "We couldn't find that booking.");
      return;
    }
    setId(result.id);
    setToken(result.token);
    await load(result.id, result.token);
  };

  const refresh = () => id && token && load(id, token);

  // ----- render -----
  if (!id || !token) {
    return (
      <RecoveryForm
        reference={reference}
        email={email}
        setReference={setReference}
        setEmail={setEmail}
        onSubmit={handleRecover}
        loading={recovering}
        error={error}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-brand-600" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-6 text-center shadow-sm">
        <p className="font-medium text-gray-900">Booking not found</p>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
        <button
          onClick={() => {
            setId(null);
            setToken(null);
            setError("");
          }}
          className="mt-4 text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          Look up with reference & email
        </button>
      </div>
    );
  }

  if (mode === "reschedule") {
    return (
      <RescheduleView
        booking={booking}
        onCancel={() => setMode("view")}
        onDone={async (date, time) => {
          setBusy(true);
          const durationMins = minutesBetween(booking.startTime, booking.endTime);
          const result = await rescheduleMyBooking(
            booking.id,
            token,
            date,
            time,
            durationMins
          );
          setBusy(false);
          if (result.error) {
            setError(result.error);
            return;
          }
          setMode("view");
          setNotice("Your appointment was rescheduled.");
          refresh();
        }}
        busy={busy}
      />
    );
  }

  if (mode === "review") {
    return (
      <ReviewView
        onCancel={() => setMode("view")}
        onSubmit={async (rating, comment) => {
          setBusy(true);
          const result = await submitReview(booking.id, token, rating, comment);
          setBusy(false);
          if (result.error) return result.error;
          setMode("view");
          setNotice("Thanks! Your review has been posted.");
          return null;
        }}
        busy={busy}
      />
    );
  }

  return (
    <BookingView
      booking={booking}
      notice={notice}
      error={error}
      busy={busy}
      onReschedule={() => {
        setError("");
        setMode("reschedule");
      }}
      onReview={() => {
        setError("");
        setMode("review");
      }}
      onCancel={async () => {
        if (!confirm("Cancel this appointment?")) return;
        setBusy(true);
        const result = await cancelMyBooking(booking.id, token);
        setBusy(false);
        if (result.error) {
          setError(result.error);
          return;
        }
        setNotice("Your appointment has been cancelled.");
        refresh();
      }}
      onPay={async () => {
        setBusy(true);
        const result = await payMyBalance(booking.id, token);
        setBusy(false);
        if (result.error) {
          setError(result.error);
          return;
        }
        setNotice("Balance paid in full. Thank you!");
        refresh();
      }}
    />
  );
}

function RecoveryForm({
  reference,
  email,
  setReference,
  setEmail,
  onSubmit,
  loading,
  error,
}: {
  reference: string;
  email: string;
  setReference: (v: string) => void;
  setEmail: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  error: string;
}) {
  return (
    <div>
      <h1 className="font-display text-xl font-semibold text-primary">
        Manage your booking
      </h1>
      <p className="mt-1 text-sm text-on-surface-variant">
        Enter your booking reference and the email you booked with.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {error && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}
        <div>
          <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-caps text-outline">
            Booking reference
          </label>
          <input
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="e.g. A1B2C3"
            required
            className="w-full rounded-lg border border-outline-variant bg-white px-3 py-2.5 text-sm uppercase text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-caps text-outline">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full rounded-lg border border-outline-variant bg-white px-3 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Finding booking..." : "Find my booking"}
        </button>
      </form>
    </div>
  );
}

function BookingView({
  booking,
  notice,
  error,
  busy,
  onReschedule,
  onReview,
  onCancel,
  onPay,
}: {
  booking: Booking;
  notice: string;
  error: string;
  busy: boolean;
  onReschedule: () => void;
  onReview: () => void;
  onCancel: () => void;
  onPay: () => void;
}) {
  const date = new Date(`${booking.bookingDate}T${booking.startTime}`);
  const isPast = date.getTime() < Date.now();
  const total = booking.totalPrice || booking.servicePrice || 0;
  const paid = booking.amountPaid ?? booking.depositAmount ?? 0;
  const remaining = Math.max(0, total - paid);

  const isActive = booking.status === "confirmed";
  const canManage = isActive && !isPast;
  const hasBalance = remaining > 0 && !booking.paidInFull && booking.status !== "cancelled";
  const canReview =
    booking.status === "completed" ||
    (isPast && booking.status !== "cancelled" && booking.status !== "no_show");

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-xl font-semibold text-primary">
          Your appointment
        </h1>
        <StatusBadge status={booking.status} />
      </div>

      {notice && (
        <div className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
          {notice}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <p className="text-lg font-semibold text-gray-900">
          {booking.serviceName || booking.serviceId}
        </p>
        <div className="mt-4 space-y-3 border-t border-gray-100 pt-4 text-sm">
          <Row label="Date">
            {date.toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </Row>
          <Row label="Time">
            {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
          </Row>
          <Row label="Service total">{formatPrice(total)}</Row>
          <Row label="Paid so far">
            <span className="text-green-600">{formatPrice(paid)}</span>
          </Row>
          {remaining > 0 && (
            <Row label={booking.paidInFull ? "Remaining" : "Remaining balance"}>
              <span className="font-semibold text-brand-600">
                {formatPrice(remaining)}
              </span>
            </Row>
          )}
        </div>
        <div className="mt-4 rounded-lg bg-gray-50 px-3 py-2 text-center">
          <p className="text-xs text-gray-400">Booking reference</p>
          <p className="font-mono text-sm font-medium text-gray-700">
            {booking.reference || booking.id.slice(0, 8).toUpperCase()}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-5 space-y-3">
        {hasBalance && (
          <button
            onClick={onPay}
            disabled={busy}
            className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            Pay remaining {formatPrice(remaining)} in full online
          </button>
        )}

        {canManage && (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onReschedule}
              disabled={busy}
              className="rounded-xl border border-outline-variant py-3 text-sm font-semibold text-primary transition-colors hover:bg-surface-container disabled:opacity-50"
            >
              Reschedule
            </button>
            <button
              onClick={onCancel}
              disabled={busy}
              className="rounded-xl border border-outline-variant py-3 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        )}

        {canReview && (
          <button
            onClick={onReview}
            disabled={busy}
            className="w-full rounded-xl border border-outline-variant py-3 text-sm font-semibold text-primary transition-colors hover:bg-surface-container disabled:opacity-50"
          >
            Leave a review
          </button>
        )}

        <Link
          href="/"
          className="block pt-1 text-center text-sm text-gray-500 hover:text-gray-700"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{children}</span>
    </div>
  );
}

function RescheduleView({
  booking,
  onCancel,
  onDone,
  busy,
}: {
  booking: Booking;
  onCancel: () => void;
  onDone: (date: string, time: string) => void;
  busy: boolean;
}) {
  const [allowedDates, setAllowedDates] = useState<Set<string> | undefined>(
    undefined
  );
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const duration = useMemo(
    () => minutesBetween(booking.startTime, booking.endTime),
    [booking.startTime, booking.endTime]
  );

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    fetchReleasedDates(booking.stylistId).then((dates) =>
      setAllowedDates(new Set(dates.map((d) => d.date)))
    );
  }, [booking.stylistId]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-xl font-semibold text-primary">
          Reschedule
        </h1>
        <button
          onClick={onCancel}
          className="text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>

      {!date ? (
        <DatePicker selectedDate={date} onSelect={setDate} allowedDates={allowedDates} />
      ) : !time ? (
        <div>
          <button
            onClick={() => setDate("")}
            className="mb-3 text-sm font-medium text-brand-600"
          >
            ← Change date
          </button>
          <TimeSlotPicker
            stylistId={booking.stylistId}
            date={date}
            serviceDuration={duration}
            selectedTime={time}
            onSelect={setTime}
          />
        </div>
      ) : (
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">New appointment</p>
          <p className="mt-1 font-semibold text-gray-900">
            {new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}{" "}
            at {formatTime(time)}
          </p>
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => setTime("")}
              className="flex-1 rounded-lg border border-outline-variant py-2.5 text-sm font-medium text-primary"
            >
              Change time
            </button>
            <button
              onClick={() => onDone(date, time)}
              disabled={busy}
              className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {busy ? "Saving..." : "Confirm"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ReviewView({
  onCancel,
  onSubmit,
  busy,
}: {
  onCancel: () => void;
  onSubmit: (rating: number, comment: string) => Promise<string | null>;
  busy: boolean;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  const handle = async () => {
    setError("");
    const err = await onSubmit(rating, comment);
    if (err) setError(err);
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-xl font-semibold text-primary">
          Leave a review
        </h1>
        <button
          onClick={onCancel}
          className="text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium text-gray-700">Your rating</p>
        <div className="mt-2 flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setRating(n)}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              className={`material-symbols-outlined text-3xl ${
                n <= rating ? "fill text-amber-400" : "text-gray-300"
              }`}
            >
              star
            </button>
          ))}
        </div>

        <label className="mt-5 mb-1.5 block text-sm font-medium text-gray-700">
          Your review (optional)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          maxLength={600}
          placeholder="How was your appointment?"
          className="w-full rounded-lg border border-outline-variant bg-white px-3 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />

        <button
          onClick={handle}
          disabled={busy || rating === 0}
          className="mt-4 w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "Posting..." : "Post review"}
        </button>
      </div>
    </div>
  );
}

export default function ManageBookingPage() {
  return (
    <div className="mx-auto min-h-dvh max-w-lg px-5 py-8">
      <Suspense
        fallback={
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-brand-600" />
          </div>
        }
      >
        <ManageInner />
      </Suspense>
    </div>
  );
}
