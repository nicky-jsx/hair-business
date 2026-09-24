interface PlaceholderImageProps {
  name: string;
  /** Extra classes for the container (fills its parent by default). */
  className?: string;
  /** Extra classes for the initial letter (control size). */
  textClassName?: string;
  /** Presentation context: "card" for directory tiles, "cover" for wide headers, "avatar" for compact circles */
  variant?: "avatar" | "card" | "cover";
  /** Optional specialty or category to display on card/cover variants */
  subtitle?: string;
}

const PALETTES = [
  {
    bg: "from-[#24211e] via-[#322c25] to-[#1c1a17]",
    accent: "text-[#d7cebf]",
    border: "border-[#82704b]/30",
    badge: "bg-[#82704b]/20 text-[#e9e4dc]",
    seal: "border-[#bcac93]/20",
  },
  {
    bg: "from-[#2d2822] via-[#3c352c] to-[#201c18]",
    accent: "text-[#e5dcce]",
    border: "border-[#bcac93]/25",
    badge: "bg-[#bcac93]/20 text-[#f5f3f0]",
    seal: "border-[#e5dcce]/20",
  },
  {
    bg: "from-[#1f2124] via-[#2a2c30] to-[#16171a]",
    accent: "text-[#d0d3d4]",
    border: "border-[#747878]/30",
    badge: "bg-[#747878]/20 text-[#f5f3f0]",
    seal: "border-[#d0d3d4]/20",
  },
  {
    bg: "from-[#291f1d] via-[#3a2c29] to-[#1a1413]",
    accent: "text-[#e8d5cf]",
    border: "border-[#9e8a67]/30",
    badge: "bg-[#9e8a67]/20 text-[#fdfbf7]",
    seal: "border-[#e8d5cf]/20",
  },
];

function pickPalette(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return PALETTES[hash % PALETTES.length];
}

function getPlaceholderTitleStyle(name: string): string {
  const hasSpaces = name.includes(" ");
  const len = name.length;

  if (!hasSpaces) {
    // Single-word names/handles: keep together on one line, scale text so no letters trail
    if (len <= 9) return "text-xs sm:text-sm tracking-normal whitespace-nowrap";
    if (len <= 13) return "text-[11px] sm:text-xs tracking-tight whitespace-nowrap";
    if (len <= 17) return "text-[10px] sm:text-[11px] tracking-tight whitespace-nowrap";
    return "text-[9px] sm:text-[10px] tracking-tighter whitespace-nowrap";
  }

  // Multi-word names: break strictly between whole words with balanced lines
  if (len <= 16) return "text-xs sm:text-sm leading-snug break-normal [text-wrap:balance]";
  return "text-[11px] sm:text-xs leading-tight break-normal [text-wrap:balance]";
}

export function PlaceholderImage({
  name,
  className = "",
  variant = "card",
  subtitle,
}: PlaceholderImageProps) {
  const clean = name.replace(/^@/, "").trim();
  const palette = pickPalette(clean);
  const titleStyle = getPlaceholderTitleStyle(clean);

  if (variant === "avatar") {
    return (
      <div
        aria-hidden="true"
        className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br ${palette.bg} ${className}`}
      >
        <span className="material-symbols-outlined text-2xl text-white/40">
          person
        </span>
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br ${palette.bg} px-2.5 py-4 select-none ${className}`}
    >
      {/* Directory Atelier Information */}
      <div className="relative z-10 flex flex-col items-center text-center w-full px-1">
        <span className={`font-display font-bold text-[#fbf9f8] max-w-full text-center ${titleStyle}`}>
          {clean}
        </span>

        {subtitle ? (
          <span className="mt-1 text-[10px] sm:text-[11px] uppercase tracking-caps text-[#bcac93] font-medium truncate max-w-full">
            {subtitle}
          </span>
        ) : (
          <span className="mt-1 text-[9px] sm:text-[10px] uppercase tracking-widest text-[#a8a49c]/80">
            London Directory
          </span>
        )}
      </div>

      {/* Bottom Directory Tag */}
      <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between border-t border-white/10 pt-1 text-[9px] uppercase tracking-caps text-white/50">
        <span>Hair Korter</span>
        <span>Curated</span>
      </div>
    </div>
  );
}
