"use client";

import { Button } from "@/components/ui/Button";

interface BookNowButtonProps {
  stylistName: string;
  fullWidth?: boolean;
  className?: string;
}

export function BookNowButton({
  stylistName,
  fullWidth = false,
  className = "",
}: BookNowButtonProps) {
  function handleClick() {
    alert(`Booking with ${stylistName} is coming soon!`);
  }

  return (
    <Button
      variant="primary"
      size="lg"
      fullWidth={fullWidth}
      className={className}
      onClick={handleClick}
    >
      Book Now
    </Button>
  );
}
