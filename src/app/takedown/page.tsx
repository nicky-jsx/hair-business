"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/FormField";
import { submitTakedownRequest } from "@/lib/takedown-db";
import { CONTACT_EMAILS } from "@/lib/site-config";

const REASONS = [
  "owner_removal",
  "copyright",
  "inaccurate_data",
  "report",
  "other",
];
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function TakedownForm() {
  const params = useSearchParams();
  const profileParam = params.get("profile");
  const profileId = profileParam && UUID_RE.test(profileParam) ? profileParam : null;
  const reasonParam = params.get("reason");

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [requesterName, setRequesterName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [reason, setReason] = useState(
    reasonParam && REASONS.includes(reasonParam) ? reasonParam : "owner_removal"
  );
  const [details, setDetails] = useState(
    profileId ? `Profile link: /stylists/${profileId}\n` : ""
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const result = await submitTakedownRequest({
      businessName: businessName.trim(),
      requesterName: requesterName.trim(),
      email: contactEmail.trim(),
      reason,
      details: details.trim(),
      profileId,
    });
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSubmitted(true);
  };

  return (
    <div className="px-5 py-8 max-w-xl mx-auto">
      <div className="mb-6">
        <Link
          href="/"
          className="text-xs font-semibold uppercase tracking-caps text-secondary hover:text-primary transition-colors inline-flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Home
        </Link>
        <h1 className="mt-3 font-display text-2xl font-bold text-primary">
          Removal, Takedown &amp; Report
        </h1>
        <p className="mt-1.5 text-xs text-on-surface-variant leading-relaxed">
          Hair Korter respects the privacy, copyright, and business preferences of
          all hair professionals. If you would like your business profile removed
          or updated, have a copyright notice, or want to report a profile or
          review, please submit the form below. Genuine removal requests from
          the business owner are honoured promptly.
        </p>
      </div>

      {submitted ? (
        <div
          role="status"
          className="rounded-2xl border border-secondary/30 bg-surface-container-lowest p-6 text-center shadow-sm"
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary-fixed/30 text-secondary mb-3">
            <span className="material-symbols-outlined text-2xl">check_circle</span>
          </div>
          <h2 className="font-display text-lg font-bold text-primary">
            Request Received
          </h2>
          <p className="mt-2 text-xs text-on-surface-variant leading-relaxed">
            Thank you. We&apos;ve recorded your request for{" "}
            <strong>{businessName || "your business"}</strong> and will review it
            as quickly as we can, usually within a few days. We may email you at{" "}
            <strong>{contactEmail}</strong> if we need to verify anything.
          </p>
          <p className="mt-3 text-xs text-outline">
            Need urgent assistance? Email{" "}
            <a
              href={`mailto:${CONTACT_EMAILS.takedown}`}
              className="font-semibold text-secondary underline"
            >
              {CONTACT_EMAILS.takedown}
            </a>
            .
          </p>
          <div className="mt-6">
            <Link href="/">
              <Button variant="secondary" size="sm">
                Return to Directory
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-5 shadow-sm"
        >
          {error && (
            <div role="alert" className="rounded-xl bg-red-50 p-3 text-xs text-red-600">
              {error}
            </div>
          )}

          <Input
            name="businessName"
            label="Business Name / Stylist Handle"
            placeholder="e.g. @stylistname or Salon Name"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            maxLength={200}
            required
          />

          <Input
            name="requesterName"
            label="Your Name"
            placeholder="First and last name"
            value={requesterName}
            onChange={(e) => setRequesterName(e.target.value)}
            maxLength={120}
            required
          />

          <Input
            name="contactEmail"
            label="Contact Email Address"
            type="email"
            placeholder="you@example.com"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            maxLength={254}
            required
          />

          <Select
            name="reason"
            label="Reason for Request"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            options={[
              { value: "owner_removal", label: "I am the business owner — please remove my profile" },
              { value: "copyright", label: "Copyright infringement / intellectual property claim" },
              { value: "inaccurate_data", label: "Information is outdated or incorrect" },
              { value: "report", label: "Report a profile or review (offensive, fake or abusive)" },
              { value: "other", label: "Other inquiry" },
            ]}
          />

          <Textarea
            name="details"
            label="Additional Details (Optional)"
            placeholder="Include profile link or any specific details..."
            rows={3}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            maxLength={3000}
          />

          <div className="pt-2">
            <Button type="submit" fullWidth disabled={submitting}>
              {submitting ? "Submitting…" : "Submit Request"}
            </Button>
          </div>

          <p className="text-center text-[11px] text-outline pt-2">
            Alternatively, send an email directly to{" "}
            <a
              href={`mailto:${CONTACT_EMAILS.takedown}`}
              className="text-secondary underline font-medium"
            >
              {CONTACT_EMAILS.takedown}
            </a>
          </p>
        </form>
      )}
    </div>
  );
}

export default function TakedownPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-secondary border-t-primary" />
        </div>
      }
    >
      <TakedownForm />
    </Suspense>
  );
}
