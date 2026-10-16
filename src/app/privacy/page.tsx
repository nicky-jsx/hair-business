import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Hair Korter",
  description: "How Hair Korter collects, uses, stores, and protects personal data in compliance with the UK GDPR.",
};

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p className="mt-1 text-xs text-outline">
          Last updated: October 2026 • Compliant with UK GDPR &amp; Data Protection Act 2018
        </p>
      </div>

      <div className="space-y-6 text-sm text-on-surface-variant leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-display text-base font-bold text-primary">
            1. Who We Are (Data Controller)
          </h2>
          <p>
            Hair Korter (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) operates a London-focused hair and beauty discovery directory and booking platform. For the purposes of the UK General Data Protection Regulation (&ldquo;UK GDPR&rdquo;) and the Data Protection Act 2018, Hair Korter is the Data Controller for personal data processed through our platform.
          </p>
          <p className="text-xs">
            Contact email for privacy and data requests:{" "}
            <span className="font-semibold text-primary">privacy@hairkorter.com</span>.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-base font-bold text-primary">
            2. Personal Data We Collect
          </h2>
          <ul className="list-disc pl-5 space-y-1.5 text-xs">
            <li>
              <strong>Clients Booking Appointments:</strong> When you book an appointment, we collect your full name, email address, UK telephone number, requested service, and optional booking notes.
            </li>
            <li>
              <strong>Registered Stylists:</strong> When you sign up or claim a profile, we collect your name, email address, password (stored securely as a cryptographic bcrypt hash), bio, services offered, price ranges, deposit settings, and profile imagery you upload.
            </li>
            <li>
              <strong>Directory Listings (Unclaimed):</strong> To operate an accurate London artisan directory, our catalog includes publicly accessible professional details such as business trading name, Instagram handle, London borough, and styling specialties.
            </li>
            <li>
              <strong>Technical &amp; Session Data:</strong> We store session tokens in your browser&apos;s local storage to keep you securely signed in. We do not sell tracking data or utilize invasive cross-site advertising cookies.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-base font-bold text-primary">
            3. Legal Bases for Processing (UK GDPR Art. 6)
          </h2>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>
              <strong>Contractual Necessity:</strong> To process client appointment bookings, provide booking confirmation links, and enable stylists to manage their calendar.
            </li>
            <li>
              <strong>Legitimate Interests:</strong> To operate, curate, and maintain a public directory of hair and beauty businesses in London, celebrate independent artisans, and connect clients with local services.
            </li>
            <li>
              <strong>Legal Compliance:</strong> To comply with legal obligations, prevent spam or abuse via rate limiting, and respond to lawful regulatory requests.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-base font-bold text-primary">
            4. Data Sharing &amp; Third-Party Processors
          </h2>
          <p>
            We do not sell, rent, or trade your personal data. We only share information in the following limited circumstances:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>
              <strong>With Your Chosen Stylist:</strong> When a client books an appointment, client contact details (name, email, phone) are transmitted to the chosen stylist to fulfill the appointment.
            </li>
            <li>
              <strong>Infrastructure Providers:</strong> Our database and storage infrastructure is hosted by Supabase (PostgreSQL with strict Row Level Security) and modern cloud hosting in the UK/EU.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-base font-bold text-primary">
            5. Your Rights Under UK GDPR
          </h2>
          <p>
            Under UK data protection law, you have statutory rights regarding your personal information:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li><strong>Right of Access:</strong> You can request a copy of the personal data we hold about you.</li>
            <li><strong>Right to Rectification:</strong> You can request corrections to inaccurate or incomplete data.</li>
            <li><strong>Right to Erasure (Right to be Forgotten):</strong> You can request that we delete your account, booking records, or directory listing.</li>
            <li><strong>Right to Object:</strong> If you are a stylist listed in our public directory and wish to be removed, you can object at any time.</li>
          </ul>
          <p className="text-xs pt-1">
            Stylists wishing to remove their listing can use our dedicated{" "}
            <Link href="/takedown" className="text-secondary font-semibold underline">
              Directory Removal &amp; Opt-Out Portal
            </Link>{" "}
            for immediate removal without dispute.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-base font-bold text-primary">
            6. Data Retention
          </h2>
          <p className="text-xs">
            We retain booking data only for as long as necessary to administer appointments and resolve customer queries. Stylist account data is retained while the profile remains active. When an account or listing removal is requested, personal data is permanently deleted from our active database.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-base font-bold text-primary">
            7. Complaints &amp; The ICO
          </h2>
          <p className="text-xs">
            If you have concerns about our data practices, we ask that you contact us first at <span className="font-semibold text-primary">privacy@hairkorter.com</span> so we can resolve the matter immediately. You also have the right to lodge a complaint with the UK supervisory authority, the <strong>Information Commissioner&apos;s Office (ICO)</strong> at{" "}
            <a
              href="https://ico.org.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary underline"
            >
              ico.org.uk
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
