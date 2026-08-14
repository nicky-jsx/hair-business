"use client";

interface BookNowButtonProps {
  stylistName: string;
  bookingUrl?: string | null;
  fullWidth?: boolean;
  className?: string;
}

export function BookNowButton({
  stylistName,
  bookingUrl,
  fullWidth = false,
  className = "",
}: BookNowButtonProps) {
  const baseStyles = `inline-flex items-center justify-center rounded-xl bg-brand-600 px-6 py-3 text-base font-medium text-white shadow-sm transition-all duration-150 hover:bg-brand-700 active:bg-brand-800 ${fullWidth ? "w-full" : ""} ${className}`;

  if (bookingUrl) {
    return (
      <a
        href={bookingUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={baseStyles}
      >
        Book Now
      </a>
    );
  }

  function handleClick() {
    alert(`${stylistName} hasn't added a booking link yet.`);
  }

  return (
    <button type="button" onClick={handleClick} className={baseStyles}>
      Book Now
    </button>
  );
}
