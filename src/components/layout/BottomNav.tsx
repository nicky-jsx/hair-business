"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Discover", icon: "explore" },
  { href: "/stylists", label: "Browse", icon: "search" },
  { href: "/stylist/sign-in", label: "Stylists", icon: "person" },
];

export function BottomNav() {
  const pathname = usePathname();

  // Hide bottom nav on profile pages and stylist portal for cleaner layout
  if (
    (pathname.startsWith("/stylists/") && pathname !== "/stylists") ||
    pathname.startsWith("/stylist/")
  ) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-lg -translate-x-1/2 bg-background/90 backdrop-blur-lg safe-bottom">
      <div className="flex items-center justify-around px-4 h-20">
        {navItems.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex w-16 flex-col items-center justify-center pt-2 transition-colors ${
                active
                  ? "border-t-2 border-primary text-primary"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              <span className={`material-symbols-outlined mb-1 ${active ? "fill" : ""}`}>
                {item.icon}
              </span>
              <span className="text-[12px] font-semibold uppercase tracking-caps">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
