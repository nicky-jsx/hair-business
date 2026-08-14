interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "brand" | "muted";
  className?: string;
}

const variantStyles = {
  default: "bg-gray-100 text-gray-700",
  brand: "bg-brand-50 text-brand-700",
  muted: "bg-surface-muted text-gray-600",
};

export function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
