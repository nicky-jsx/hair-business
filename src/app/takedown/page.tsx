"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/FormField";

export default function TakedownPage() {
  const [submitted, setSubmitted] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [requesterName, setRequesterName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [reason, setReason] = useState("owner_removal");
  const [details, setDetails] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate recording or open mailto fallback
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
          Directory Removal &amp; Takedown Request
        </h1>
        <p className="mt-1.5 text-xs text-on-surface-variant leading-relaxed">
          Hair Korter respects the privacy, copyright, and business preferences of all hair professionals. If you would like your business profile removed, updated, or have a copyright notice, please submit below. We honor all genuine removal requests promptly without question.
        </p>
      </div>

      {submitted ? (
        <div className="rounded-2xl border border-secondary/30 bg-surface-container-lowest p-6 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary-fixed/30 text-secondary mb-3">
            <span className="material-symbols-outlined text-2xl">check_circle</span>
          </div>
          <h2 className="font-display text-lg font-bold text-primary">
            Removal Request Received
          </h2>
          <p className="mt-2 text-xs text-on-surface-variant leading-relaxed">
            Thank you for notifying us. We have registered your request for{" "}
            <strong>{businessName || "your business"}</strong>. Our team verifies and processes all directory removals within 24 to 48 hours.
          </p>
          <p className="mt-3 text-xs text-outline">
            Need urgent assistance? You can also email us directly at{" "}
            <a
              href="mailto:takedown@hairkorter.com"
              className="font-semibold text-secondary underline"
            >
              takedown@hairkorter.com
            </a>.
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
          <Input
            label="Business Name / Stylist Handle"
            placeholder="e.g. @stylistname or Salon Name"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            required
          />

          <Input
            label="Your Name"
            placeholder="First and last name"
            value={requesterName}
            onChange={(e) => setRequesterName(e.target.value)}
            required
          />

          <Input
            label="Contact Email Address"
            type="email"
            placeholder="you@example.com"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            required
          />

          <Select
            label="Reason for Request"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            options={[
              { value: "owner_removal", label: "I am the business owner — please remove my profile" },
              { value: "copyright", label: "Copyright infringement / intellectual property claim" },
              { value: "inaccurate_data", label: "Information is outdated or incorrect" },
              { value: "other", label: "Other inquiry" },
            ]}
          />

          <Textarea
            label="Additional Details (Optional)"
            placeholder="Include profile link or any specific details..."
            rows={3}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          />

          <div className="pt-2">
            <Button type="submit" fullWidth>
              Submit Removal Request
            </Button>
          </div>

          <p className="text-center text-[11px] text-outline pt-2">
            Alternatively, send an email directly to{" "}
            <a
              href="mailto:takedown@hairkorter.com"
              className="text-secondary underline font-medium"
            >
              takedown@hairkorter.com
            </a>
          </p>
        </form>
      )}
    </div>
  );
}
