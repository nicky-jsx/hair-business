"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ProfileEditForm } from "@/components/stylist/edit/ProfileEditForm";
import { useAuth } from "@/context/AuthContext";

export default function StylistEditPage() {
  const router = useRouter();
  const { ready, account, profile } = useAuth();

  useEffect(() => {
    if (!ready) return;
    if (!account) {
      router.replace("/stylist/sign-in");
      return;
    }
    if (!account.stylistId) {
      router.replace("/stylist/onboarding");
    }
  }, [ready, account, router]);

  if (!ready || !account || !account.stylistId) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  return (
    <div className="px-5 pb-8 pt-6">
      <p className="mb-2 text-sm font-medium text-brand-600">Edit profile</p>
      <h1 className="font-display text-2xl font-semibold text-gray-900">
        Update your profile
      </h1>
      <p className="mt-2 mb-6 text-sm text-gray-500">
        Make changes to your services, photos, and booking link.
      </p>
      <ProfileEditForm profile={profile} />
    </div>
  );
}
