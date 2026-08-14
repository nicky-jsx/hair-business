import type { Stylist, StylistFilters, Specialty } from "@/types/stylist";
import { formatRegion } from "@/types/stylist";

const portfolioSets = {
  braids: [
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&h=600&fit=crop",
  ],
  cuts: [
    "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1634449577050-15f4c093a3e0?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1595476108010-b4d1f102b1f1?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=600&h=600&fit=crop",
  ],
  color: [
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1516975080664-ed2fc6a13737?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&h=600&fit=crop",
  ],
};

export const stylists: Stylist[] = [
  {
    id: "1",
    name: "Amara Johnson",
    tagline: "Protective styles with precision",
    bio: "Specializing in knotless braids, loc maintenance, and natural hair care. Based in North London, I believe every client deserves a style that protects and celebrates their hair.",
    avatar: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&h=400&fit=crop&crop=face",
    coverImage: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&h=400&fit=crop",
    region: "North",
    specialties: ["Braids", "Locs", "Natural Hair"],
    yearsExperience: 8,
    priceRange: "££",
    featured: true,
    rating: 4.9,
    reviewCount: 127,
    services: [
      { name: "Knotless Braids (medium)", price: 120, duration: "4–5 hrs" },
      { name: "Loc Retwist", price: 65, duration: "2 hrs" },
      { name: "Natural Hair Wash & Blowdry", price: 45, duration: "1 hr" },
      { name: "Cornrows", price: 55, duration: "1.5 hrs" },
    ],
    portfolio: portfolioSets.braids,
    bookingUrl: null,
  },
  {
    id: "2",
    name: "Marcus Chen",
    tagline: "Sharp cuts, clean fades",
    bio: "Barber-stylist hybrid with a focus on precision cuts and modern fades. Working from a studio in East London, whether you want a classic look or something fresh, I've got you covered.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    coverImage: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800&h=400&fit=crop",
    region: "East",
    specialties: ["Cuts", "Natural Hair"],
    yearsExperience: 12,
    priceRange: "££",
    featured: true,
    rating: 4.8,
    reviewCount: 203,
    services: [
      { name: "Skin Fade", price: 35, duration: "45 mins" },
      { name: "Shape Up & Beard Trim", price: 28, duration: "30 mins" },
      { name: "Scissor Cut", price: 40, duration: "1 hr" },
      { name: "Kids Cut (under 12)", price: 22, duration: "30 mins" },
    ],
    portfolio: portfolioSets.cuts,
    bookingUrl: null,
  },
  {
    id: "3",
    name: "Zara Williams",
    tagline: "Colour that turns heads",
    bio: "Vivid colours, balayage, and healthy colour transformations. I use premium products to keep your hair vibrant and strong from my salon in West London.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face",
    coverImage: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=400&fit=crop",
    region: "West",
    specialties: ["Color", "Silk Press", "Extensions"],
    yearsExperience: 6,
    priceRange: "£££",
    featured: true,
    rating: 5.0,
    reviewCount: 89,
    services: [
      { name: "Full Colour", price: 150, duration: "3 hrs" },
      { name: "Balayage", price: 200, duration: "4 hrs" },
      { name: "Silk Press", price: 55, duration: "1.5 hrs" },
      { name: "Extension Install", price: 180, duration: "3–4 hrs" },
    ],
    portfolio: portfolioSets.color,
    bookingUrl: null,
  },
  {
    id: "4",
    name: "Destiny Moore",
    tagline: "Silk presses & blowouts",
    bio: "Known for bone-straight silk presses and bouncy blowouts. I treat every head of hair with the care it deserves at my South London studio.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
    coverImage: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800&h=400&fit=crop",
    region: "South",
    specialties: ["Silk Press", "Natural Hair", "Extensions"],
    yearsExperience: 10,
    priceRange: "££",
    featured: false,
    rating: 4.7,
    reviewCount: 156,
    services: [
      { name: "Silk Press", price: 50, duration: "1.5 hrs" },
      { name: "Blowout & Style", price: 40, duration: "1 hr" },
      { name: "Deep Condition Treatment", price: 35, duration: "45 mins" },
      { name: "Sew-In Extensions", price: 160, duration: "3 hrs" },
    ],
    portfolio: portfolioSets.braids,
    bookingUrl: null,
  },
  {
    id: "5",
    name: "Jaylen Brooks",
    tagline: "Loc artist & retwist pro",
    bio: "From starter locs to mature maintenance, I help you grow and style your loc journey with patience and skill from my chair in East London.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    coverImage: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1f1?w=800&h=400&fit=crop",
    region: "East",
    specialties: ["Locs", "Natural Hair"],
    yearsExperience: 7,
    priceRange: "££",
    featured: false,
    rating: 4.9,
    reviewCount: 94,
    services: [
      { name: "Loc Retwist", price: 70, duration: "2 hrs" },
      { name: "Starter Locs", price: 100, duration: "3 hrs" },
      { name: "Loc Style", price: 45, duration: "1 hr" },
      { name: "Loc Repair", price: 30, duration: "30 mins" },
    ],
    portfolio: portfolioSets.cuts,
    bookingUrl: null,
  },
  {
    id: "6",
    name: "Keisha Patel",
    tagline: "Wig installs & custom units",
    bio: "Flawless wig installs, custom unit construction, and lace melting that looks completely natural. Based in North London.",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
    coverImage: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&h=400&fit=crop",
    region: "North",
    specialties: ["Wigs", "Extensions", "Braids"],
    yearsExperience: 5,
    priceRange: "£££",
    featured: false,
    rating: 4.8,
    reviewCount: 72,
    services: [
      { name: "Wig Install (glueless)", price: 80, duration: "1.5 hrs" },
      { name: "Custom Unit Construction", price: 250, duration: "1 week turnaround" },
      { name: "Lace Front Install", price: 100, duration: "2 hrs" },
      { name: "Wig Maintenance", price: 45, duration: "1 hr" },
    ],
    portfolio: portfolioSets.color,
    bookingUrl: null,
  },
  {
    id: "7",
    name: "Tiana Rivers",
    tagline: "Kids braids & teen styles",
    bio: "Gentle, patient, and creative styles for kids and teens. From simple cornrows to intricate patterns, serving families across South London.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face",
    coverImage: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=400&fit=crop",
    region: "South",
    specialties: ["Braids", "Natural Hair"],
    yearsExperience: 4,
    priceRange: "£",
    featured: false,
    rating: 4.6,
    reviewCount: 48,
    services: [
      { name: "Kids Braids", price: 40, duration: "1.5 hrs" },
      { name: "Teen Box Braids", price: 65, duration: "2.5 hrs" },
      { name: "Simple Cornrows", price: 30, duration: "1 hr" },
      { name: "Natural Hair Detangle", price: 25, duration: "45 mins" },
    ],
    portfolio: portfolioSets.braids,
    bookingUrl: null,
  },
  {
    id: "8",
    name: "Andre Foster",
    tagline: "Editorial cuts & styling",
    bio: "Fashion-forward cuts and editorial styling for those who want to stand out. Featured in multiple beauty campaigns, working from West London.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
    coverImage: "https://images.unsplash.com/photo-1634449577050-15f4c093a3e0?w=800&h=400&fit=crop",
    region: "West",
    specialties: ["Cuts", "Color", "Natural Hair"],
    yearsExperience: 15,
    priceRange: "£££",
    featured: true,
    rating: 4.9,
    reviewCount: 241,
    services: [
      { name: "Editorial Cut", price: 75, duration: "1 hr" },
      { name: "Creative Colour", price: 180, duration: "3 hrs" },
      { name: "Event Styling", price: 90, duration: "1.5 hrs" },
      { name: "Consultation", price: 25, duration: "30 mins" },
    ],
    portfolio: portfolioSets.cuts,
    bookingUrl: null,
  },
];

export function getStylistById(id: string): Stylist | undefined {
  return stylists.find((s) => s.id === id);
}

export function getFeaturedStylists(): Stylist[] {
  return stylists.filter((s) => s.featured);
}

export function getAllSpecialties(): Specialty[] {
  const set = new Set<Specialty>();
  stylists.forEach((s) => s.specialties.forEach((sp) => set.add(sp)));
  return Array.from(set).sort();
}

function getRatingThreshold(filter: string): number {
  if (filter === "5") return 5;
  if (filter === "4.5+") return 4.5;
  if (filter === "4+") return 4;
  return 0;
}

export function filterStylists(filters: StylistFilters): Stylist[] {
  const query = filters.query.trim().toLowerCase();

  return stylists.filter((stylist) => {
    const matchesSpecialty =
      !filters.specialty || stylist.specialties.includes(filters.specialty);

    const matchesRegion =
      !filters.region || stylist.region === filters.region;

    const matchesPrice =
      !filters.priceRange || stylist.priceRange === filters.priceRange;

    const matchesRating =
      !filters.rating || stylist.rating >= getRatingThreshold(filters.rating);

    const baseMatch = matchesSpecialty && matchesRegion && matchesPrice && matchesRating;

    if (!query) return baseMatch;

    const searchable = [
      stylist.name,
      stylist.tagline,
      stylist.region,
      formatRegion(stylist.region),
      ...stylist.specialties,
    ]
      .join(" ")
      .toLowerCase();

    return baseMatch && searchable.includes(query);
  });
}
