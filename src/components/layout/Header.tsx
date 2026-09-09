import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-outline-variant/30 safe-top">
      <div className="flex items-center justify-between px-6 h-16">
        <Link
          href="/"
          className="flex items-center gap-2 text-primary transition-opacity hover:opacity-90"
        >
          <span className="material-symbols-outlined text-xl text-secondary">
            content_cut
          </span>
          <span className="font-display text-xl font-bold uppercase tracking-tight text-primary">
            Hair Korter
          </span>
        </Link>

        <Link
          href="/stylist/claim"
          className="inline-flex items-center gap-1.5 rounded-full bg-secondary-fixed/50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-caps text-primary border border-secondary/25 hover:bg-secondary-fixed transition-all"
        >
          <span className="material-symbols-outlined text-[15px] text-secondary">
            verified
          </span>
          <span>Claim Listing</span>
        </Link>
      </div>
    </header>
  );
}
