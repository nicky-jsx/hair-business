"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ProfileCreationForm } from "@/components/stylist/onboarding/ProfileCreationForm";
import { useAuth } from "@/context/AuthContext";

export default function StylistOnboardingPage() {
  const router = useRouter();
  const { ready, account } = useAuth();

  useEffect(() => {
    if (!ready) return;
    if (!account) {
      router.replace("/stylist/sign-up");
      return;
    }
    if (account.stylistId) {
      router.replace(`/stylists/${account.stylistId}`);
    }
  }, [ready, account, router]);

  if (!ready || !account || account.stylistId) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  return (
    <div className="px-5 pb-8 pt-6">
      <p className="mb-2 text-sm font-medium text-brand-600">
        Step 2 of 2
      </p>
      <h1 className="font-display text-2xl font-semibold text-gray-900">
        Create your profile
      </h1>
      <p className="mt-2 mb-6 text-sm text-gray-500">
        Hi {account.name.split(" ")[0]}, let&apos;s set up your stylist profile.
      </p>
      <ProfileCreationForm />
    </div>
  );
}
