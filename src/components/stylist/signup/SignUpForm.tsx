"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/FormField";
import { useAuth } from "@/context/AuthContext";

export function SignUpForm() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const name = form.get("name") as string;
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    if (password.length < 8 || password.length > 72) {
      setError("Password must be 8–72 characters");
      setLoading(false);
      return;
    }

    const result = await signUp({ name, email, password });
    
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push("/stylist/onboarding");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-800">Something went wrong</p>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <Input
        label="Full name"
        name="name"
        type="text"
        placeholder="Your name"
        required
        autoComplete="name"
      />

      <Input
        label="Email"
        name="email"
        type="email"
        placeholder="you@example.com"
        required
        autoComplete="email"
      />

      <Input
        label="Password"
        name="password"
        type="password"
        placeholder="At least 6 characters"
        required
        autoComplete="new-password"
      />

      <p className="text-[11px] text-on-surface-variant leading-relaxed">
        By creating an account, you agree to our{" "}
        <Link href="/terms" className="text-secondary font-semibold underline">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-secondary font-semibold underline">
          Privacy Policy
        </Link>
        , and confirm you own the rights to all portfolio media you upload.
      </p>

      <Button type="submit" fullWidth size="lg" disabled={loading}>
        {loading ? "Creating account..." : "Create account"}
      </Button>


      <p className="text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link
          href="/stylist/sign-in"
          className="font-medium text-brand-600 hover:text-brand-700"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
