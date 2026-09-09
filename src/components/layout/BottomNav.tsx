"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Directory", icon: "explore" },
  { href: "/stylist/claim", label: "Claim Listing", icon: "verified" },
  { href: "/stylist/dashboard", label: "Stylists", icon: "storefront" },
];

export function BottomNav() {
  const pathname = usePathname();

  // Hide bottom nav on individual stylist profile pages where the sticky booking bar is shown
  if (pathname.startsWith("/stylists/")) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-lg -translate-x-1/2 bg-background/90 backdrop-blur-lg border-t border-outline-variant/30 safe-bottom">
      <div className="flex items-center justify-around px-4 h-16">
        {navItems.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/" || pathname === "/stylists"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex w-24 flex-col items-center justify-center pt-1 transition-colors ${
                active
                  ? "border-t-2 border-primary text-primary font-semibold"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] mb-0.5 ${active ? "fill" : ""}`}>
                {item.icon}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-caps">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
