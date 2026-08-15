"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export function StylistNavLink() {
  const { ready, account } = useAuth();

  if (!ready) return null;

  const href = account?.stylistId
    ? "/stylist/dashboard"
    : account
      ? "/stylist/onboarding"
      : "/stylist/sign-in";

  const label = account ? "Dashboard" : "Stylist login";

  return (
    <Link
      href={href}
      className="rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-100"
    >
      {label}
    </Link>
  );
}
