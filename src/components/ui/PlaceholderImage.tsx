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

export function PlaceholderImage({
  name,
  className = "",
  textClassName = "text-3xl",
  variant = "card",
  subtitle,
}: PlaceholderImageProps) {
  const clean = name.replace(/^@/, "").trim();
  const initial = (clean[0] ?? "K").toUpperCase();
  const palette = pickPalette(clean);

  if (variant === "avatar") {
    return (
      <div
        aria-hidden="true"
        className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br ${palette.bg} ${className}`}
      >
        <div className={`flex h-4/5 w-4/5 items-center justify-center rounded-full border ${palette.seal}`}>
          <span className={`font-display italic font-semibold ${palette.accent} ${textClassName}`}>
            {initial}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br ${palette.bg} p-6 select-none ${className}`}
    >
      {/* Editorial geometric watermark rings */}
      <div className={`absolute -right-12 -top-12 h-44 w-44 rounded-full border border-dashed ${palette.border} opacity-40`} />
      <div className={`absolute -bottom-10 -left-10 h-36 w-36 rounded-full border ${palette.border} opacity-30`} />

      {/* Directory Seal Emblem */}
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className={`mb-3 flex h-16 w-16 items-center justify-center rounded-full border ${palette.seal} bg-black/20 backdrop-blur-sm shadow-inner`}>
          <span className={`font-display font-medium italic ${palette.accent} ${textClassName}`}>
            {initial}
          </span>
        </div>

        <span className="font-display text-sm tracking-wide text-[#fbf9f8] font-medium max-w-[85%] truncate">
          {clean}
        </span>

        {subtitle ? (
          <span className="mt-1 text-[11px] uppercase tracking-caps text-[#bcac93]">
            {subtitle}
          </span>
        ) : (
          <span className="mt-1 text-[10px] uppercase tracking-widest text-[#a8a49c]/80">
            London Directory
          </span>
        )}
      </div>

      {/* Bottom Directory Tag */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between border-t border-white/10 pt-2 text-[10px] uppercase tracking-caps text-white/50">
        <span>Hair Korter</span>
        <span>Curated</span>
      </div>
    </div>
  );
}
