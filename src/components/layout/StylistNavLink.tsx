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

  return (
    <Link
      href={href}
      aria-label={account ? "Dashboard" : "Stylist login"}
      className="text-primary transition-colors hover:text-secondary"
    >
      <span className="material-symbols-outlined">
        {account ? "dashboard" : "person"}
      </span>
    </Link>
  );
}
