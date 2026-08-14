"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookingLinkForm } from "@/components/stylist/dashboard/BookingLinkForm";
import { Button } from "@/components/ui/Button";
import { useStylistStore } from "@/context/StylistStoreProvider";
import { formatRegion } from "@/types/stylist";

export default function StylistDashboardPage() {
  const router = useRouter();
  const { ready, account, signOut, getStylistById } = useStylistStore();

  if (!ready) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  if (!account) {
    return (
      <div className="px-5 pb-8 pt-6 text-center">
        <h1 className="font-display text-2xl font-semibold text-gray-900">
          Stylist dashboard
        </h1>
        <p className="mt-2 mb-6 text-sm text-gray-500">
          Sign up to list your business on Strand.
        </p>
        <Link href="/stylist/sign-up">
          <Button size="lg">Create account</Button>
        </Link>
      </div>
    );
  }

  const profile = account.stylistId
    ? getStylistById(account.stylistId)
    : undefined;

  return (
    <div className="px-5 pb-8 pt-6">
      <p className="mb-2 text-sm font-medium text-brand-600">Your dashboard</p>
      <h1 className="font-display text-2xl font-semibold text-gray-900">
        Welcome, {account.name.split(" ")[0]}
      </h1>

      {profile ? (
        <div className="mt-6 space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-card">
            <p className="text-sm font-medium text-gray-500">Your profile</p>
            <p className="mt-1 font-semibold text-gray-900">{profile.name}</p>
            <p className="text-sm text-brand-600">{profile.tagline}</p>
            <p className="mt-1 text-xs text-gray-400">
              {formatRegion(profile.region)}
            </p>
            <div className="mt-4 flex gap-2">
              <Link href={`/stylists/${profile.id}`} className="flex-1">
                <Button variant="primary" fullWidth size="sm">
                  View profile
                </Button>
              </Link>
            </div>
          </div>

          <BookingLinkForm profile={profile} />

          <p className="text-xs text-gray-400">
            Signed in as {account.email}
          </p>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl bg-surface-muted p-5">
          <h2 className="font-semibold text-gray-900">Complete your profile</h2>
          <p className="mt-1 mb-4 text-sm text-gray-500">
            You haven&apos;t set up your stylist profile yet. It only takes a
            few minutes.
          </p>
          <Link href="/stylist/onboarding">
            <Button fullWidth>Create profile</Button>
          </Link>
        </div>
      )}

      <button
        onClick={() => {
          signOut();
          router.push("/");
        }}
        className="mt-6 w-full text-center text-sm text-gray-400 hover:text-gray-600"
      >
        Sign out
      </button>
    </div>
  );
}
