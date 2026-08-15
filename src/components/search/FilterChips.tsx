"use client";

interface FilterChipsProps<T extends string> {
  label: string;
  options: readonly T[];
  selected: T | null;
  onSelect: (value: T | null) => void;
}

export function FilterChips<T extends string>({
  label,
  options,
  selected,
  onSelect,
}: FilterChipsProps<T>) {
  return (
    <div className="flex items-center gap-2">
      <span className="shrink-0 text-xs font-medium text-gray-400">{label}</span>
      <div className="flex gap-1.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onSelect(selected === option ? null : option)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all ${
              selected === option
                ? "bg-brand-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
