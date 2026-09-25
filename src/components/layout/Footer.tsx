import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-outline-variant/40 bg-surface-container-lowest/80 px-5 pt-8 pb-28 text-on-surface-variant backdrop-blur-sm">
      <div className="space-y-4">
        {/* Brand header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="font-display text-sm font-bold tracking-tight text-primary">
              HAIR KORTER
            </span>
            <span className="text-[10px] uppercase tracking-wider text-secondary font-semibold">
              • London
            </span>
          </div>
          <Link
            href="/stylist/claim"
            className="text-[11px] font-semibold text-secondary hover:text-primary transition-colors underline"
          >
            Claim / Manage Profile
          </Link>
        </div>

        {/* Media & Copyright Notice */}
        <div className="rounded-xl border border-outline-variant/60 bg-surface-container/50 p-4 text-[11px] leading-relaxed text-on-surface-variant">
          <div className="flex items-center gap-1.5 font-semibold text-primary mb-1">
            <span className="material-symbols-outlined text-sm text-secondary">
              verified_user
            </span>
            <span>Content &amp; Image Notice</span>
          </div>
          <p>
            Hair Korter is an independent directory celebrating London hair and beauty artisans. All featured styling imagery, photos, and creative work remain the exclusive intellectual property and copyright of their respective creators and are credited to their official profiles. Hair Korter does not claim ownership of any third-party portfolio content.
          </p>
          <p className="mt-2 text-[11px] font-medium text-primary">
            Want to update, change, or remove a photo or listing? Direct message us on Instagram or submit via the profile claim portal for immediate removal.
          </p>
        </div>

        {/* Bottom copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 text-[10px] text-outline">
          <p>© {new Date().getFullYear()} Hair Korter. Curated for London.</p>
          <p>All creative media property of respective artists.</p>
        </div>
      </div>
    </footer>
  );
}
