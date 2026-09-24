import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-outline-variant/30 safe-top">
      <div className="flex items-center justify-between px-4 sm:px-6 h-16">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-primary transition-opacity hover:opacity-90"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#24211e] text-[#fbf9f8] shadow-xs">
            <span className="material-symbols-outlined text-[17px] text-[#e4cb96]">
              content_cut
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-display text-lg font-bold uppercase tracking-[0.15em] text-primary leading-none">
              Hair Korter
            </span>
            <span className="text-[9px] uppercase tracking-[0.12em] font-medium text-secondary mt-0.5 whitespace-nowrap">
              Hair &amp; Beauty Directory
            </span>
          </div>
        </Link>

        <Link
          href="/stylist/claim"
          className="inline-flex items-center gap-1.5 rounded-full bg-[#24211e] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-caps text-[#fbf9f8] border border-[#82704b]/40 shadow-xs hover:bg-black hover:border-[#82704b] transition-all"
        >
          <span className="material-symbols-outlined text-[14px] text-[#e4cb96]">
            verified
          </span>
          <span>Claim Profile</span>
        </Link>
      </div>
    </header>
  );
}
