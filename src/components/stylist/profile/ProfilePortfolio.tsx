import Image from "next/image";

interface ProfilePortfolioProps {
  photos: string[];
  stylistName: string;
}

export function ProfilePortfolio({ photos, stylistName }: ProfilePortfolioProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {photos.map((photo, index) => (
        <div
          key={photo}
          className={`relative overflow-hidden rounded-md bg-surface-container ${
            index === 0 ? "col-span-2 aspect-[16/10]" : "aspect-square"
          }`}
        >
          <Image
            src={photo}
            alt={`${stylistName} portfolio ${index + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 512px) 50vw, 256px"
          />
        </div>
      ))}
    </div>
  );
}
