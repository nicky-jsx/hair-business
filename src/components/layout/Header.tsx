import Link from "next/link";
import { StylistNavLink } from "@/components/layout/StylistNavLink";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-100/80 bg-surface/90 backdrop-blur-md safe-top">
      <div className="flex items-center justify-between px-5 py-4">
        <Link href="/" className="group flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
            S
          </span>
          <span className="font-display text-xl font-semibold tracking-tight text-gray-900">
            Strand
          </span>
        </Link>
        <StylistNavLink />
      </div>
    </header>
  );
}
