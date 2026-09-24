"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/FormField";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { useAuth } from "@/context/AuthContext";
import { fetchStylistById } from "@/lib/stylists-db";
import { formatRegion, type Stylist } from "@/types/stylist";

function ClaimPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stylistId = searchParams.get("id");

  const { ready, account, profile, signUp, signIn, claimProfile } = useAuth();

  const [stylist, setStylist] = useState<Stylist | null>(null);
  const [loadingStylist, setLoadingStylist] = useState(true);

  const [authMode, setAuthMode] = useState<"signup" | "signin">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!stylistId) {
      setLoadingStylist(false);
      return;
    }

    fetchStylistById(stylistId).then((data) => {
      setStylist(data);
      if (data) {
        setName(data.name);
      }
      setLoadingStylist(false);
    });
  }, [stylistId]);

  if (!ready || loadingStylist) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-secondary border-t-primary" />
      </div>
    );
  }

  if (!stylistId || !stylist) {
    return (
      <div className="px-5 py-12 text-center">
        <span className="material-symbols-outlined mb-2 text-4xl text-outline">
          search_off
        </span>
        <h1 className="font-display text-2xl font-bold text-primary">
          Profile Not Found
        </h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          We couldn&apos;t find the stylist profile you are trying to claim.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-caps text-background"
        >
          Browse Directory
        </Link>
      </div>
    );
  }

  // Already claimed by current user
  if (account && account.stylistId === stylist.id) {
    return (
      <div className="px-5 py-12 text-center">
        <span className="material-symbols-outlined mb-2 text-4xl text-secondary">
          verified
        </span>
        <h1 className="font-display text-2xl font-bold text-primary">
          You Own This Profile
        </h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          You have already claimed and unlocked <strong>{stylist.name}</strong>.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href={`/stylists/${stylist.id}`}>
            <Button variant="secondary">View Public Profile</Button>
          </Link>
          <Link href="/stylist/dashboard">
            <Button variant="primary">Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  async function handleClaimExistingAccount() {
    if (!stylist) return;
    setError("");
    setSubmitting(true);
    const res = await claimProfile(stylist.id);
    setSubmitting(false);

    if (res.error) {
      setError(res.error);
      return;
    }

    router.push("/stylist/dashboard?claimed=true");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stylist) return;
    setError("");
    setSubmitting(true);

    if (authMode === "signup") {
      if (!name.trim() || !email.trim() || !password) {
        setError("Please complete all required fields.");
        setSubmitting(false);
        return;
      }

      const regResult = await signUp({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      if (regResult.error) {
        setError(regResult.error);
        setSubmitting(false);
        return;
      }
    } else {
      if (!email.trim() || !password) {
        setError("Please enter your email and password.");
        setSubmitting(false);
        return;
      }

      const signinResult = await signIn({
        email: email.trim().toLowerCase(),
        password,
      });

      if (signinResult.error) {
        setError(signinResult.error);
        setSubmitting(false);
        return;
      }
    }

    // Now claim the stylist profile
    const claimResult = await claimProfile(stylist.id);
    setSubmitting(false);

    if (claimResult.error) {
      setError(claimResult.error);
      return;
    }

    router.push("/stylist/dashboard?claimed=true");
  }

  const primarySpecialty = stylist.specialties?.[0] || formatRegion(stylist.region);

  return (
    <div className="px-5 py-8 max-w-lg mx-auto">
      {/* Listing Overview Card */}
      <div className="overflow-hidden rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-5 shadow-ambient mb-8">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface-container">
            {stylist.avatar ? (
              <img
                src={stylist.avatar}
                alt={stylist.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <PlaceholderImage
                name={stylist.name}
                variant="avatar"
                textClassName="text-xl"
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary-fixed/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-caps text-secondary">
              Curated Stylist Profile
            </span>
            <h2 className="mt-1 font-display text-lg font-bold text-primary break-words leading-snug">
              {stylist.name}
            </h2>
            <p className="text-xs text-on-surface-variant truncate">
              {formatRegion(stylist.region)} • {primarySpecialty}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-outline-variant/40 pt-3 text-center text-xs">
          <div className="rounded-lg bg-surface-container-low p-2">
            <span className="text-[10px] uppercase tracking-caps text-outline block">
              Starting Price
            </span>
            <span className="font-semibold text-primary">{stylist.priceRange}</span>
          </div>
          <div className="rounded-lg bg-surface-container-low p-2">
            <span className="text-[10px] uppercase tracking-caps text-outline block">
              Experience
            </span>
            <span className="font-semibold text-primary">
              {stylist.yearsExperience > 0 ? `${stylist.yearsExperience} yrs` : "Curated"}
            </span>
          </div>
        </div>
      </div>

      {/* Claim Benefits Section */}
      <div className="mb-8 space-y-3">
        <h3 className="font-display text-sm font-semibold uppercase tracking-caps text-secondary">
          What Unlocking Gives You
        </h3>
        <ul className="space-y-2.5 text-xs text-on-surface">
          <li className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-base text-secondary shrink-0">
              photo_library
            </span>
            <span>
              <strong>Upload your high-res portfolio:</strong> Showcase your best
              braids, cuts, wigs, or lash sets directly in the app.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-base text-secondary shrink-0">
              edit_note
            </span>
            <span>
              <strong>Full profile control:</strong> Update your bio, service
              offerings, pricing, and custom booking links anytime.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-base text-secondary shrink-0">
              verified
            </span>
            <span>
              <strong>Verified Specialist badge &amp; reviews:</strong> Collect
              5-star verified client feedback and elevate your ranking.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-base text-secondary shrink-0">
              calendar_month
            </span>
            <span>
              <strong>Direct client bookings:</strong> Release appointment dates,
              collect deposits, and fill your schedule.
            </span>
          </li>
        </ul>
      </div>

      {/* Action Container */}
      <div className="rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-6 shadow-ambient">
        {account ? (
          <div className="text-center space-y-4">
            <p className="text-sm text-on-surface">
              Signed in as <strong>{account.email}</strong>
            </p>
            <p className="text-xs text-on-surface-variant">
              Click below to immediately link and unlock <strong>{stylist.name}</strong> to your account.
            </p>

            {error && (
              <div className="rounded-xl bg-red-50 p-3 text-left text-xs text-red-600">
                {error}
              </div>
            )}

            <Button
              variant="primary"
              fullWidth
              size="lg"
              onClick={handleClaimExistingAccount}
              disabled={submitting}
            >
              {submitting ? "Claiming Profile…" : "Confirm Claim & Unlock Profile"}
            </Button>
          </div>
        ) : (
          <div>
            {/* Mode switch */}
            <div className="mb-6 flex rounded-xl bg-surface-container-low p-1">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signup");
                  setError("");
                }}
                className={`flex-1 rounded-lg py-2 text-xs font-semibold uppercase tracking-caps transition-colors ${
                  authMode === "signup"
                    ? "bg-surface-container-lowest text-primary shadow-sm"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                Create Account &amp; Claim
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signin");
                  setError("");
                }}
                className={`flex-1 rounded-lg py-2 text-xs font-semibold uppercase tracking-caps transition-colors ${
                  authMode === "signin"
                    ? "bg-surface-container-lowest text-primary shadow-sm"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                I Already Have An Account
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {authMode === "signup" && (
                <Input
                  label="Your Name or Brand"
                  name="name"
                  placeholder="e.g. Amara Johnson"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              )}

              <Input
                label="Email address"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="Choose a secure password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                disabled={submitting}
              >
                {submitting
                  ? "Unlocking Profile…"
                  : authMode === "signup"
                  ? "Unlock & Claim My Profile"
                  : "Sign In & Claim Profile"}
              </Button>
            </form>

            <p className="mt-4 text-center text-[11px] text-outline">
              By claiming this profile, you confirm you are the owner or authorized
              representative of this hair &amp; beauty business.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ClaimStylistPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-secondary border-t-primary" />
        </div>
      }
    >
      <ClaimPageContent />
    </Suspense>
  );
}
