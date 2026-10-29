import Link from "next/link";
import { CONTACT_EMAILS } from "@/lib/site-config";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-outline-variant/40 bg-surface-container-lowest/80 px-5 pt-8 pb-28 text-on-surface-variant backdrop-blur-sm">
      <div className="space-y-4">
        {/* Brand header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-display text-sm font-bold tracking-tight text-primary">
              SP KORTER
            </span>
            <span className="text-[10px] uppercase tracking-wider text-secondary font-semibold">
              • Service Providers • London
            </span>
          </div>
          <Link
            href="/stylist/claim"
            className="text-[11px] font-semibold text-secondary hover:text-primary transition-colors underline"
          >
            Claim / Manage Profile
          </Link>
        </div>

        {/* Marketplace Disclaimer & Content Notice */}
        <div className="rounded-xl border border-outline-variant/60 bg-surface-container/50 p-4 text-[11px] leading-relaxed text-on-surface-variant">
          <div className="flex items-center gap-1.5 font-semibold text-primary mb-1">
            <span className="material-symbols-outlined text-sm text-secondary">
              gavel
            </span>
            <span>Platform Disclaimer</span>
          </div>
          <p>
            SP Korter (Service Providers) is an independent introductory directory connecting clients with London hair and beauty artisans. SP Korter is not a salon, employer, contractor, or agent of any listed stylist. All services, treatments, and payments are arranged directly with independent professionals.
          </p>
          <div className="mt-2.5 pt-2 border-t border-outline-variant/40 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-semibold text-secondary">
            <Link href="/terms" className="hover:text-primary transition-colors underline">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-primary transition-colors underline">
              Privacy Policy
            </Link>
            <Link href="/takedown" className="hover:text-primary transition-colors underline">
              Request Profile Removal / Opt-Out
            </Link>
            <a
              href={`mailto:${CONTACT_EMAILS.general}`}
              className="hover:text-primary transition-colors underline"
            >
              Contact: {CONTACT_EMAILS.general}
            </a>
          </div>
        </div>

        {/* Bottom footer notice */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 text-[10px] text-outline">
          <p>SP Korter &bull; Service Providers</p>
          <p>Independent directory for London, UK.</p>
        </div>
      </div>
    </footer>
  );
}
