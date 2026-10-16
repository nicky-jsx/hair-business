"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

// Two-step, typed confirmation so an account can't be deleted by accident.
export function DeleteAccountSection({ hasProfile }: { hasProfile: boolean }) {
  const router = useRouter();
  const { deleteAccount } = useAuth();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setError("");
    setBusy(true);
    const result = await deleteAccount();
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push("/");
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 w-full text-center text-xs text-gray-400 underline hover:text-red-600"
      >
        Delete my account
      </button>
    );
  }

  return (
    <div className="mt-6 rounded-xl border border-red-200 bg-red-50/60 p-4">
      <h2 className="text-sm font-semibold text-red-700">Delete your account</h2>
      <p className="mt-1 text-xs leading-relaxed text-red-700/80">
        This permanently deletes your account
        {hasProfile
          ? ", your public profile, services, portfolio, reviews and booking history"
          : ""}
        . This cannot be undone. You must cancel any upcoming confirmed bookings
        first.
      </p>
      <label
        htmlFor="delete-confirm"
        className="mt-3 block text-xs font-medium text-red-700"
      >
        Type DELETE to confirm
      </label>
      <input
        id="delete-confirm"
        name="delete-confirm"
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
        autoComplete="off"
        className="mt-1 w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-300"
      />
      {error && (
        <p role="alert" className="mt-2 text-xs text-red-700">
          {error}
        </p>
      )}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setConfirmText("");
            setError("");
          }}
          className="flex-1 rounded-lg border border-gray-200 bg-white py-2 text-sm font-medium text-gray-700"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={busy || confirmText !== "DELETE"}
          className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
        >
          {busy ? "Deleting…" : "Delete forever"}
        </button>
      </div>
    </div>
  );
}
