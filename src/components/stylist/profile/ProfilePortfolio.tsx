import Image from "next/image";

interface ProfilePortfolioProps {
  photos: string[];
  stylistName: string;
}

export function ProfilePortfolio({ photos, stylistName }: ProfilePortfolioProps) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
        Portfolio
      </h2>
      <div className="grid grid-cols-2 gap-2">
        {photos.map((photo, index) => (
          <div
            key={photo}
            className={`relative overflow-hidden rounded-xl bg-gray-100 ${
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
    </section>
  );
}
