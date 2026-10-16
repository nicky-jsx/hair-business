import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — Hair Korter",
  description: "Terms and conditions governing the use of the Hair Korter directory and discovery platform.",
};

export default function TermsPage() {
  return (
    <div className="px-5 py-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/"
          className="text-xs font-semibold uppercase tracking-caps text-secondary hover:text-primary transition-colors inline-flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Home
        </Link>
        <h1 className="mt-3 font-display text-2xl sm:text-3xl font-bold text-primary">
          Terms of Service
        </h1>
        <p className="mt-1 text-xs text-outline">
          Last updated: October 2026 • Governed by the laws of England and Wales
        </p>
      </div>

      <div className="space-y-6 text-sm text-on-surface-variant leading-relaxed">
        {/* Important Summary Callout */}
        <div className="rounded-2xl border border-secondary/30 bg-secondary-fixed/15 p-4 text-xs text-primary leading-relaxed">
          <strong className="block font-display font-bold text-sm mb-1">
            Important Summary
          </strong>
          Hair Korter is an independent directory and booking discovery platform. We do not provide hairdressing or beauty services, we are not an employer or agent of any listed stylist, and we do not collect or hold client funds. All appointments and treatments are conducted strictly between clients and independent professionals.
        </div>

        <section className="space-y-2">
          <h2 className="font-display text-base font-bold text-primary">
            1. Introduction &amp; Acceptance
          </h2>
          <p>
            Welcome to Hair Korter (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;). By accessing our website, browsing our directory, claiming a profile, or booking an appointment through our platform, you agree to be bound by these Terms of Service. If you do not agree, you must discontinue using the platform.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-base font-bold text-primary">
            2. Platform Status — Introductory Directory Only
          </h2>
          <p>
            Hair Korter operates solely as an introductory venue and technology intermediary:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>
              <strong>Independent Professionals:</strong> All stylists, salons, and beauty practitioners listed on Hair Korter are independent third-party operators. Hair Korter is not a hair salon and does not employ, contract, or direct any stylist.
            </li>
            <li>
              <strong>Direct Contract:</strong> Any appointment, service booking, consultation, or commercial transaction is formed directly and solely between the client and the respective stylist. Hair Korter is not a party to that agreement.
            </li>
            <li>
              <strong>No Quality Guarantee:</strong> While we aim to highlight reputable artisans across London, we do not inspect premises, verify insurance, or guarantee the skill, hygiene, chemical products, or safety of any stylist.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-base font-bold text-primary">
            3. Disclaimer of Liability &amp; Treatments
          </h2>
          <p>
            To the maximum extent permitted by applicable law (including the Consumer Rights Act 2015):
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>
              Hair Korter disclaims all liability for any personal injury, scalp or hair damage, allergic reactions, burns, infections, physical distress, or dissatisfaction arising out of services rendered by any stylist.
            </li>
            <li>
              Clients are solely responsible for discussing health conditions, patch tests, hair history, and service expectations directly with their chosen practitioner prior to treatment.
            </li>
            <li>
              In no event shall Hair Korter be liable for any indirect, special, incidental, punitive, or consequential damages, or any loss of profits or appointments.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-base font-bold text-primary">
            4. Payments, Deposits &amp; Cancellations
          </h2>
          <p>
            Hair Korter does not currently collect, hold, or process credit card payments or client deposits on-platform:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>
              Any deposits, full payments, or cancellation fees indicated on a stylist&apos;s profile are agreed directly between the client and the stylist, and paid through the stylist&apos;s chosen payment method (e.g. in person, bank transfer, or third-party booking link).
            </li>
            <li>
              Hair Korter has no control over refunds, chargebacks, or deposit forfeitures. Any financial disputes must be resolved directly with the stylist.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-base font-bold text-primary">
            5. Stylist Obligations &amp; Profile Claims
          </h2>
          <p>
            Stylists who claim, register, or maintain a profile on Hair Korter warrant that:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>
              They hold appropriate skills, qualifications, sanitary facilities, and professional liability insurance necessary to perform their advertised services.
            </li>
            <li>
              All information, pricing, bios, and service durations are accurate and kept up to date.
            </li>
            <li>
              They own or have all necessary licenses and client consents for any portfolio photography, logos, or media uploaded to Hair Korter.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-base font-bold text-primary">
            6. Intellectual Property &amp; Takedown Requests
          </h2>
          <p>
            Stylists retain full copyright and ownership of their creative media. Unclaimed profiles use factual business details and dynamic placeholder designs. If you are a business owner or photographer wishing to modify, update, or remove a listing, please submit a request via our{" "}
            <Link href="/takedown" className="text-secondary font-semibold underline">
              Directory Removal Portal
            </Link>{" "}
            for immediate processing.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-base font-bold text-primary">
            7. Reviews &amp; Conduct
          </h2>
          <p>
            Users who submit reviews confirm that their reviews reflect genuine, first-hand experiences. Defamatory, fraudulent, unlawful, abusive, or discriminatory content is strictly prohibited. We reserve the right to moderate or remove reviews at our sole discretion under the Defamation Act 2013.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-base font-bold text-primary">
            8. Governing Law &amp; Jurisdiction
          </h2>
          <p>
            These Terms of Service and any dispute or claim arising out of or in connection with them shall be governed by and construed in accordance with the laws of <strong>England and Wales</strong>. You agree to submit to the exclusive jurisdiction of the courts of England and Wales.
          </p>
        </section>

        <section className="space-y-2 pt-2 border-t border-outline-variant/60">
          <h2 className="font-display text-base font-bold text-primary">
            9. Contact Us
          </h2>
          <p className="text-xs">
            For legal inquiries, terms questions, or formal notices, contact us at:{" "}
            <span className="font-semibold text-primary">legal@hairkorter.com</span>.
          </p>
        </section>
      </div>
    </div>
  );
}
