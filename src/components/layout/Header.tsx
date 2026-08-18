import Link from "next/link";
import { StylistNavLink } from "@/components/layout/StylistNavLink";

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md safe-top">
      <div className="flex items-center justify-between px-6 h-16">
        <Link
          href="/stylists"
          aria-label="Search"
          className="text-primary transition-colors hover:text-secondary"
        >
          <span className="material-symbols-outlined">search</span>
        </Link>

        <Link
          href="/"
          className="font-display text-2xl font-bold uppercase tracking-tight text-primary"
        >
          Strand
        </Link>

        <StylistNavLink />
      </div>
    </header>
  );
}
