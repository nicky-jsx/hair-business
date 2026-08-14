import Image from "next/image";

interface AvatarProps {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeStyles = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-14 w-14",
  xl: "h-20 w-20",
};

export function Avatar({ src, alt, size = "md", className = "" }: AvatarProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-full bg-gray-100 ring-2 ring-white ${sizeStyles[size]} ${className}`}
    >
      <Image src={src} alt={alt} fill className="object-cover" sizes="80px" />
    </div>
  );
}
