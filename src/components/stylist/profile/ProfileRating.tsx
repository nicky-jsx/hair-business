interface ProfileRatingProps {
  rating: number;
  reviewCount: number;
  size?: "sm" | "md";
}

export function ProfileRating({
  rating,
  reviewCount,
  size = "md",
}: ProfileRatingProps) {
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div className={`flex items-center gap-1.5 ${textSize}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className={`text-amber-400 ${size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"}`}
      >
        <path
          fillRule="evenodd"
          d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z"
          clipRule="evenodd"
        />
      </svg>
      <span className="font-semibold text-gray-900">{rating.toFixed(1)}</span>
      <span className="text-gray-400">
        ({reviewCount} review{reviewCount !== 1 ? "s" : ""})
      </span>
    </div>
  );
}
