"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/FormField";
import { useStylistStore } from "@/context/StylistStoreProvider";

export function SignUpForm() {
  const router = useRouter();
  const { signUp } = useStylistStore();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const name = form.get("name") as string;
    const email = form.get("email") as string;
    const password = form.get("password") as string;
    const confirm = form.get("confirm") as string;

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    const result = signUp({ name, email, password });
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
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
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

      <Input
        label="Confirm password"
        name="confirm"
        type="password"
        placeholder="Repeat your password"
        required
        autoComplete="new-password"
      />

      <Button type="submit" fullWidth size="lg" disabled={loading}>
        {loading ? "Creating account…" : "Create account"}
      </Button>

      <p className="text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link
          href="/stylist/dashboard"
          className="font-medium text-brand-600 hover:text-brand-700"
        >
          Go to dashboard
        </Link>
      </p>
    </form>
  );
}
