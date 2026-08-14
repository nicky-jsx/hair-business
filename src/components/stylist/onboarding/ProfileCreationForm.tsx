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

const ALL_SPECIALTIES: Specialty[] = ["Braids", "Wigs"];

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&h=400&fit=crop&crop=face";
const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&h=400&fit=crop";
const DEFAULT_PORTFOLIO = [
  "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&h=600&fit=crop",
];

const STEPS = ["About you", "Services & booking", "Photos"];

function derivePriceRange(services: Service[]): "£" | "££" | "£££" {
  if (services.length === 0) return "££";
  const avg = services.reduce((sum, s) => sum + s.price, 0) / services.length;
  if (avg < 40) return "£";
  if (avg < 100) return "££";
  return "£££";
}

export function ProfileCreationForm() {
  const router = useRouter();
  const { account, createProfile } = useStylistStore();
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");

  const [tagline, setTagline] = useState("");
  const [bio, setBio] = useState("");
  const [region, setRegion] = useState<Region | null>(null);
  const [yearsExperience, setYearsExperience] = useState("");
  const [specialties, setSpecialties] = useState<Specialty[]>([]);

  const [services, setServices] = useState<Service[]>([
    { name: "", price: 0, duration: "" },
  ]);
  const [bookingUrl, setBookingUrl] = useState("");

  const [avatar, setAvatar] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [portfolioUrls, setPortfolioUrls] = useState("");

  function toggleSpecialty(specialty: Specialty | null) {
    if (!specialty) {
      setSpecialties([]);
      return;
    }
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

  function handleNext(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (step === 0) {
      if (!tagline.trim() || !bio.trim() || !region || !yearsExperience) {
        setError("Please fill in all required fields.");
        return;
      }
      if (specialties.length === 0) {
        setError("Select at least one specialty.");
        return;
      }
      setStep(1);
      return;
    }

    if (step === 1) {
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
      setStep(2);
      return;
    }

    if (!account) {
      setError("You must be signed in to create a profile.");
      return;
    }

    const validServices = services.filter(
      (s) => s.name.trim() && s.price > 0 && s.duration.trim()
    );

    const portfolio = portfolioUrls
      .split("\n")
      .map((url) => url.trim())
      .filter(Boolean);

    const stylist: Stylist = {
      id: `user-${crypto.randomUUID()}`,
      name: account.name,
      tagline: tagline.trim(),
      bio: bio.trim(),
      avatar: avatar.trim() || DEFAULT_AVATAR,
      coverImage: coverImage.trim() || DEFAULT_COVER,
      region: region!,
      specialties,
      yearsExperience: parseInt(yearsExperience, 10),
      priceRange: derivePriceRange(validServices),
      featured: false,
      rating: 0,
      reviewCount: 0,
      services: validServices,
      portfolio: portfolio.length > 0 ? portfolio : DEFAULT_PORTFOLIO,
      bookingUrl: normaliseBookingUrl(bookingUrl),
    };

    createProfile(stylist);
    router.push(`/stylists/${stylist.id}`);
  }

  return (
    <div>
      {/* Progress */}
      <div className="mb-6 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 flex-col items-center gap-1">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                i <= step
                  ? "bg-brand-600 text-white"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`text-[10px] font-medium ${
                i <= step ? "text-brand-600" : "text-gray-400"
              }`}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={handleNext} className="space-y-5">
        {error && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {step === 0 && (
          <>
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
              placeholder="Tell clients about your experience and style…"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              required
            />
            <Select
              label="Region"
              name="region"
              value={region ?? ""}
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
              placeholder="5"
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
          </>
        )}

        {step === 1 && (
          <>
            <p className="text-sm text-gray-500">
              Add the services you offer with prices. You can always update these
              later.
            </p>
            {services.map((service, index) => (
              <div
                key={index}
                className="space-y-3 rounded-2xl border border-gray-100 bg-white p-4"
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
                  onChange={(e) =>
                    updateService(index, "name", e.target.value)
                  }
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
                      updateService(index, "price", parseInt(e.target.value, 10) || 0)
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
            <Button type="button" variant="secondary" fullWidth onClick={addService}>
              + Add another service
            </Button>

            <div className="border-t border-gray-100 pt-5">
              <Input
                label="External booking link"
                name="bookingUrl"
                type="url"
                placeholder="https://book.fresha.com/your-salon"
                value={bookingUrl}
                onChange={(e) => setBookingUrl(e.target.value)}
              />
              <p className="mt-1.5 text-xs text-gray-400">
                Optional. Link to Square, Fresha, Calendly, or your own booking
                page. Clients will use this when they tap Book Now.
              </p>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <p className="text-sm text-gray-500">
              Add photo URLs for your profile. Leave blank to use defaults — you
              can update these anytime.
            </p>
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
          </>
        )}

        <div className="flex gap-3 pt-2">
          {step > 0 && (
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setStep((s) => s - 1)}
            >
              Back
            </Button>
          )}
          <Button type="submit" className="flex-1" size="lg">
            {step < 2 ? "Continue" : "Publish profile"}
          </Button>
        </div>
      </form>
    </div>
  );
}
