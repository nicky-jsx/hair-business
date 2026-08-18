"use client";

import { useRef, useState } from "react";
import { uploadProfileImage } from "@/lib/storage";

interface ImageUploaderProps {
  kind: "avatar" | "cover";
  value: string;
  pathPrefix: string;
  onChange: (url: string) => void;
  label?: string;
}

export function ImageUploader({
  kind,
  value,
  pathPrefix,
  onChange,
  label,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError("");
    setUploading(true);
    const result = await uploadProfileImage(pathPrefix, file, kind);
    setUploading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.url) onChange(result.url);
  };

  const isAvatar = kind === "avatar";

  return (
    <div>
      {label && (
        <p className="mb-2 text-sm font-medium text-gray-700">{label}</p>
      )}

      <div className={isAvatar ? "flex items-center gap-4" : ""}>
        {/* Preview */}
        <div
          className={
            isAvatar
              ? "relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-surface-container"
              : "relative aspect-[16/6] w-full overflow-hidden rounded-xl bg-surface-container"
          }
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt={isAvatar ? "Profile photo" : "Banner"}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-outline">
              <span className="material-symbols-outlined">
                {isAvatar ? "person" : "image"}
              </span>
            </div>
          )}

          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className={isAvatar ? "" : "mt-3 flex items-center gap-2"}>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-surface-container disabled:opacity-50"
          >
            {uploading ? "Uploading…" : value ? "Change" : "Upload"}
          </button>
          {value && !uploading && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="ml-2 text-sm font-medium text-on-surface-variant hover:text-red-500"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  );
}
