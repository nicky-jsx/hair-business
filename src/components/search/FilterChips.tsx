"use client";

interface FilterChipsProps<T extends string> {
  options: readonly T[];
  selected: T | null;
  onSelect: (value: T | null) => void;
  allLabel?: string;
}

export function FilterChips<T extends string>({
  options,
  selected,
  onSelect,
  allLabel = "All",
}: FilterChipsProps<T>) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <button
        onClick={() => onSelect(null)}
        className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
          selected === null
            ? "bg-brand-600 text-white shadow-sm"
            : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
        }`}
      >
        {allLabel}
      </button>
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onSelect(selected === option ? null : option)}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
            selected === option
              ? "bg-brand-600 text-white shadow-sm"
              : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
