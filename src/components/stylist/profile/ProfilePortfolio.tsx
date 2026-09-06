import Image from "next/image";
import { normaliseInstagramUrl } from "@/types/stylist";

interface ProfilePortfolioProps {
  photos: string[];
  stylistName: string;
  instagramUrl?: string | null;
}

export function ProfilePortfolio({
  photos,
  stylistName,
  instagramUrl,
}: ProfilePortfolioProps) {
  if (photos.length === 0) {
    const igUrl = normaliseInstagramUrl(instagramUrl);
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-outline-variant bg-surface-container-low px-6 py-10 text-center">
        <span className="material-symbols-outlined mb-2 text-3xl text-outline">
          photo_library
        </span>
        <p className="text-sm font-medium text-on-surface">No portfolio yet</p>
        <p className="mt-1 max-w-xs text-[13px] text-on-surface-variant">
          {igUrl
            ? "See their latest work over on Instagram while they get set up here."
            : "This professional hasn't added their portfolio yet."}
        </p>
        {igUrl && (
          <a
            href={igUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-[13px] font-semibold text-background transition-opacity hover:opacity-90"
          >
            <span className="material-symbols-outlined text-base">
              open_in_new
            </span>
            View portfolio on Instagram
          </a>
        )}
      </div>
    );
  }

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
