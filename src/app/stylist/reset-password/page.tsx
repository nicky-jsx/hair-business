"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/FormField";
import { resetPasswordWithToken } from "@/lib/auth-db";

function ResetPasswordContent() {
  const token = useSearchParams().get("token");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  // No token: explain how to get a reset link (issued by the SP Korter team).
  if (!token) {
    return (
      <div className="px-5 pb-8 pt-6">
        <p className="mb-2 text-sm font-medium text-brand-600">For stylists</p>
        <h1 className="font-display text-2xl font-semibold text-gray-900">
          Forgot your password?
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          DM us on Instagram or email us from the address on your account and
          we&apos;ll send you a secure, single-use reset link (valid for 24
          hours).
        </p>
        <Link
          href="/stylist/sign-in"
          className="mt-6 inline-flex rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-caps text-background"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="px-5 pb-8 pt-6">
        <h1 className="font-display text-2xl font-semibold text-gray-900">
          Password updated
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          You&apos;ve been signed out on all devices. Sign in with your new
          password.
        </p>
        <Link
          href="/stylist/sign-in"
          className="mt-6 inline-flex rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-caps text-background"
        >
          Sign in
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");
    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }
    setLoading(true);
    const result = await resetPasswordWithToken(token!, password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setDone(true);
  }

  return (
    <div className="px-5 pb-8 pt-6">
      <p className="mb-2 text-sm font-medium text-brand-600">For stylists</p>
      <h1 className="font-display text-2xl font-semibold text-gray-900">
        Choose a new password
      </h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}
        <Input
          label="New password"
          name="password"
          type="password"
          minLength={8}
          maxLength={72}
          required
          autoComplete="new-password"
        />
        <Input
          label="Confirm new password"
          name="confirm"
          type="password"
          minLength={8}
          maxLength={72}
          required
          autoComplete="new-password"
        />
        <Button type="submit" fullWidth size="lg" disabled={loading}>
          {loading ? "Saving..." : "Update password"}
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}
