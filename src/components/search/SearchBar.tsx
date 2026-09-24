"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

interface SearchBarProps {
  defaultValue?: string;
  placeholder?: string;
  autoFocus?: boolean;
  onSearch?: (query: string) => void;
  navigateOnSubmit?: boolean;
}

export function SearchBar({
  defaultValue = "",
  placeholder = "Search professionals, regions, specialties…",
  autoFocus = false,
  onSearch,
  navigateOnSubmit = false,
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const router = useRouter();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();

    if (navigateOnSubmit) {
      const params = trimmed ? `?q=${encodeURIComponent(trimmed)}` : "";
      router.push(`/stylists${params}`);
      return;
    }

    onSearch?.(trimmed);
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
        <span className="material-symbols-outlined text-outline">search</span>
      </div>
      <input
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          if (!navigateOnSubmit) onSearch?.(e.target.value);
        }}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full rounded-md border-none bg-surface-container-low py-4 pl-12 pr-4 text-base text-on-surface placeholder:text-on-surface-variant shadow-ambient transition-colors focus:bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-secondary"
      />
    </form>
  );
}
