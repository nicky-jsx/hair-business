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
  placeholder = "Search stylists, regions, specialties…",
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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-5 w-5 text-gray-400"
        >
          <path
            fillRule="evenodd"
            d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
            clipRule="evenodd"
          />
        </svg>
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
        className="w-full rounded-2xl border border-gray-200 bg-white py-3.5 pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm transition-shadow focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100"
      />
    </form>
  );
}
