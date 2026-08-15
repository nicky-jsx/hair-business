"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/FormField";
import { useStylistStore } from "@/context/StylistStoreProvider";
import {
  isValidBookingUrl,
  normaliseBookingUrl,
  REGIONS,
  type Region,
  type Service,
  type Specialty,
  type Stylist,
} from "@/types/stylist";

const ALL_SPECIALTIES: Specialty[] = ["Braids", "Wigs", "Locs", "Eyelashes"];

function derivePriceRange(services: Service[]): "£" | "££" | "£££" {
  if (services.length === 0) return "££";
  const avg = services.reduce((sum, s) => sum + s.price, 0) / services.length;
  if (avg < 40) return "£";
  if (avg < 100) return "££";
  return "£££";
}

interface ProfileEditFormProps {
  profile: Stylist;
}

export function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const router = useRouter();
  const { updateProfile } = useStylistStore();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [tagline, setTagline] = useState(profile.tagline);
  const [bio, setBio] = useState(profile.bio);
  const [region, setRegion] = useState<Region>(profile.region);
  const [yearsExperience, setYearsExperience] = useState(
    String(profile.yearsExperience)
  );
  const [specialties, setSpecialties] = useState<Specialty[]>(
    profile.specialties
  );

  const [services, setServices] = useState<Service[]>(profile.services);
  const [bookingUrl, setBookingUrl] = useState(profile.bookingUrl ?? "");

  const [avatar, setAvatar] = useState(profile.avatar);
  const [coverImage, setCoverImage] = useState(profile.coverImage);
  const [portfolioUrls, setPortfolioUrls] = useState(
    profile.portfolio.join("\n")
  );

  function toggleSpecialty(specialty: Specialty) {
    setSpecialties((prev) =>
      prev.includes(specialty)
        ? prev.filter((s) => s !== specialty)
        : [...prev, specialty]
    );
  }

  function updateService(
    index: number,
    field: keyof Service,
    value: string | number
  ) {
    setServices((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  }

  function addService() {
    setServices((prev) => [...prev, { name: "", price: 0, duration: "" }]);
  }

  function removeService(index: number) {
    setServices((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!tagline.trim() || !bio.trim() || !region || !yearsExperience) {
      setError("Please fill in all required fields.");
      return;
    }

    if (specialties.length === 0) {
      setError("Select at least one specialty.");
      return;
    }

    const validServices = services.filter(
      (s) => s.name.trim() && s.price > 0 && s.duration.trim()
    );

    if (validServices.length === 0) {
      setError("Add at least one complete service.");
      return;
    }

    if (!isValidBookingUrl(bookingUrl)) {
      setError("Please enter a valid booking URL.");
      return;
    }

    const portfolio = portfolioUrls
      .split("\n")
      .map((url) => url.trim())
      .filter(Boolean);

    const updated: Stylist = {
      ...profile,
      tagline: tagline.trim(),
      bio: bio.trim(),
      region,
      yearsExperience: parseInt(yearsExperience, 10),
      specialties,
      priceRange: derivePriceRange(validServices),
      services: validServices,
      avatar: avatar.trim() || profile.avatar,
      coverImage: coverImage.trim() || profile.coverImage,
      portfolio: portfolio.length > 0 ? portfolio : profile.portfolio,
      bookingUrl: normaliseBookingUrl(bookingUrl),
    };

    updateProfile(updated);
    setSuccess(true);
    setTimeout(() => router.push("/stylist/dashboard"), 1000);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
          Profile updated! Redirecting…
        </div>
      )}

      <div className="rounded-2xl border border-gray-100 bg-white p-4">
        <h2 className="mb-4 font-semibold text-gray-900">Basic info</h2>
        <div className="space-y-4">
          <Input
            label="Tagline"
            name="tagline"
            placeholder="e.g. Protective styles with precision"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            required
          />
          <Textarea
            label="Bio"
            name="bio"
            placeholder="Tell clients about your experience…"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            required
          />
          <Select
            label="Region"
            name="region"
            value={region}
            onChange={(e) => setRegion(e.target.value as Region)}
            options={REGIONS.map((r) => ({
              value: r,
              label: `${r} London`,
            }))}
            required
          />
          <Input
            label="Years of experience"
            name="yearsExperience"
            type="number"
            min={0}
            max={50}
            value={yearsExperience}
            onChange={(e) => setYearsExperience(e.target.value)}
            required
          />
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">
              Specialties <span className="text-brand-600">*</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {ALL_SPECIALTIES.map((specialty) => {
                const selected = specialties.includes(specialty);
                return (
                  <button
                    key={specialty}
                    type="button"
                    onClick={() => toggleSpecialty(specialty)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                      selected
                        ? "bg-brand-600 text-white shadow-sm"
                        : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {specialty}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-4">
        <h2 className="mb-4 font-semibold text-gray-900">Services & prices</h2>
        <div className="space-y-4">
          {services.map((service, index) => (
            <div
              key={index}
              className="space-y-3 rounded-xl border border-gray-100 bg-surface-muted p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Service {index + 1}
                </span>
                {services.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeService(index)}
                    className="text-xs text-red-500 hover:text-red-600"
                  >
                    Remove
                  </button>
                )}
              </div>
              <Input
                label="Service name"
                name={`service-name-${index}`}
                placeholder="e.g. Knotless Braids"
                value={service.name}
                onChange={(e) => updateService(index, "name", e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Price (£)"
                  name={`service-price-${index}`}
                  type="number"
                  min={0}
                  placeholder="80"
                  value={service.price || ""}
                  onChange={(e) =>
                    updateService(
                      index,
                      "price",
                      parseInt(e.target.value, 10) || 0
                    )
                  }
                />
                <Input
                  label="Duration"
                  name={`service-duration-${index}`}
                  placeholder="2 hrs"
                  value={service.duration}
                  onChange={(e) =>
                    updateService(index, "duration", e.target.value)
                  }
                />
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={addService}
          >
            + Add another service
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-4">
        <h2 className="mb-4 font-semibold text-gray-900">Booking link</h2>
        <Input
          label="External booking URL"
          name="bookingUrl"
          type="url"
          placeholder="https://book.fresha.com/your-salon"
          value={bookingUrl}
          onChange={(e) => setBookingUrl(e.target.value)}
        />
        <p className="mt-1.5 text-xs text-gray-400">
          Link to Square, Fresha, Calendly, or your own booking page.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-4">
        <h2 className="mb-4 font-semibold text-gray-900">Photos</h2>
        <div className="space-y-4">
          <Input
            label="Profile photo URL"
            name="avatar"
            type="url"
            placeholder="https://…"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
          />
          <Input
            label="Cover photo URL"
            name="coverImage"
            type="url"
            placeholder="https://…"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
          />
          <Textarea
            label="Portfolio photo URLs"
            name="portfolio"
            placeholder="One URL per line"
            value={portfolioUrls}
            onChange={(e) => setPortfolioUrls(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button type="submit" className="flex-1" size="lg">
          Save changes
        </Button>
      </div>
    </form>
  );
}
