interface PlaceholderImageProps {
  name: string;
  /** Extra classes for the container (fills its parent by default). */
  className?: string;
  /** Extra classes for the initial letter (control size). */
  textClassName?: string;
}

// On-brand gradients, chosen deterministically so a given name always
// gets the same tile (adds a little variety across the grid).
const GRADIENTS = [
  "from-brand-100 to-brand-200",
  "from-secondary-container to-brand-100",
  "from-brand-50 to-surface-container-high",
  "from-surface-container to-brand-100",
];

function pickGradient(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return GRADIENTS[hash % GRADIENTS.length];
}

export function PlaceholderImage({
  name,
  className = "",
  textClassName = "text-3xl",
}: PlaceholderImageProps) {
  const clean = name.replace(/^@/, "").trim();
  const initial = (clean[0] ?? "?").toUpperCase();

  return (
    <div
      aria-hidden="true"
      className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${pickGradient(
        clean
      )} ${className}`}
    >
      <span className={`font-display font-semibold text-brand-700/60 ${textClassName}`}>
        {initial}
      </span>
    </div>
  );
}
