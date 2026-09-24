import type { Stylist, Specialty, Review, StylistFilters } from "@/types/stylist";
import { formatRegion } from "@/types/stylist";

// ──────────────────────────────────────────────────────────────
// Portfolio sets — every image is unique across all sets
// ──────────────────────────────────────────────────────────────

const portfolioSets = {
  braids: [
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1583001931096-959e9a1a6223?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1620331311520-246422fd82f9?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop",
  ],
  cuts: [
    "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1634449577050-15f4c093a3e0?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1595476108010-b4d1f102b1f1?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=600&h=600&fit=crop",
  ],
  color: [
    "https://images.unsplash.com/photo-1516975080664-ed2fc6a13737?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1617897903246-719242758050?w=600&h=600&fit=crop",
  ],
  silkPress: [
    "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1585747860019-8b29f9148fde?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=600&h=600&fit=crop",
  ],
  locs: [
    "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1611095560192-0d0acf283eb2?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1590540179852-2110a54f813a?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=600&h=600&fit=crop",
  ],
  wigs: [
    "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1611432579699-484f7990b127?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1613417750882-77156e23aaed?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1617049543792-8e2e4e2f2193?w=600&h=600&fit=crop",
  ],
  eyelashes: [
    "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1588387332759-2cf3739e7bab?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1583064839537-1b0996b2e8da?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1516914589923-f105f1535f88?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1597225176455-207d210ee12c?w=600&h=600&fit=crop",
  ],
};

// ──────────────────────────────────────────────────────────────
// Stylists
// ──────────────────────────────────────────────────────────────

export const stylists: Stylist[] = [
  {
    id: "1",
    name: "Amara Johnson",
    tagline: "Protective styles with precision",
    bio: "Specializing in knotless braids, loc maintenance, and natural hair care. Based in North London, I believe every client deserves a style that protects and celebrates their hair.",
    avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop&crop=face",
    coverImage: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=400&fit=crop",
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
    reviews: [
      { id: "r1a", reviewerName: "Shanice M.", rating: 5, comment: "Amara did my knotless braids perfectly — light, neat, and exactly the length I wanted. Will definitely be coming back!", createdAt: "2026-08-15T10:30:00Z" },
      { id: "r1b", reviewerName: "Priya K.", rating: 5, comment: "Arrived with very tangled natural hair and she was so patient with me. The wash and blowdry left my hair feeling amazing.", createdAt: "2026-07-22T14:00:00Z" },
      { id: "r1c", reviewerName: "Jade T.", rating: 4, comment: "Great cornrows. Took a little longer than expected but the result was flawless.", createdAt: "2026-06-10T09:00:00Z" },
    ],
    bookingUrl: null,
    verified: true,
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
    reviews: [
      { id: "r2a", reviewerName: "Daniel O.", rating: 5, comment: "Best fade I've ever had, hands down. Marcus really listens to what you want.", createdAt: "2026-08-20T16:00:00Z" },
      { id: "r2b", reviewerName: "Tyrell B.", rating: 5, comment: "Been going to Marcus for 3 years now. Consistent, clean, and always on time.", createdAt: "2026-08-01T11:00:00Z" },
      { id: "r2c", reviewerName: "Sam W.", rating: 4, comment: "Took my son for his first proper haircut. Marcus was brilliant with him — very patient and the cut looked great.", createdAt: "2026-07-18T13:30:00Z" },
    ],
    bookingUrl: null,
  },
  {
    id: "3",
    name: "Zara Williams",
    tagline: "Colour that turns heads",
    bio: "Vivid colours, balayage, and healthy colour transformations. I use premium products to keep your hair vibrant and strong from my salon in West London.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face",
    coverImage: "https://images.unsplash.com/photo-1516975080664-ed2fc6a13737?w=800&h=400&fit=crop",
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
    reviews: [
      { id: "r3a", reviewerName: "Lily J.", rating: 5, comment: "Zara transformed my hair from dark brown to honey blonde and it still feels healthy. She's an artist!", createdAt: "2026-08-28T10:00:00Z" },
      { id: "r3b", reviewerName: "Fatima A.", rating: 5, comment: "The balayage was stunning. Everyone asks me where I got it done. Already booked my next appointment.", createdAt: "2026-08-05T15:00:00Z" },
    ],
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
    featured: true,
    rating: 4.7,
    reviewCount: 156,
    services: [
      { name: "Silk Press", price: 50, duration: "1.5 hrs" },
      { name: "Blowout & Style", price: 40, duration: "1 hr" },
      { name: "Deep Condition Treatment", price: 35, duration: "45 mins" },
      { name: "Sew-In Extensions", price: 160, duration: "3 hrs" },
    ],
    portfolio: portfolioSets.silkPress,
    reviews: [
      { id: "r4a", reviewerName: "Tasha R.", rating: 5, comment: "The silk press was absolutely perfect. My hair was swinging and bouncy for over a week!", createdAt: "2026-08-12T09:30:00Z" },
      { id: "r4b", reviewerName: "Keisha L.", rating: 5, comment: "Destiny really knows natural hair. The deep condition brought my curls back to life.", createdAt: "2026-07-30T12:00:00Z" },
      { id: "r4c", reviewerName: "Nicole F.", rating: 4, comment: "Lovely blowout, very professional. The studio is really cute too.", createdAt: "2026-07-15T17:00:00Z" },
    ],
    bookingUrl: null,
  },
  {
    id: "5",
    name: "Jaylen Brooks",
    tagline: "Loc artist & retwist pro",
    bio: "From starter locs to mature maintenance, I help you grow and style your loc journey with patience and skill from my chair in East London.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    coverImage: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&h=400&fit=crop",
    region: "East",
    specialties: ["Locs", "Natural Hair"],
    yearsExperience: 7,
    priceRange: "££",
    featured: true,
    rating: 4.9,
    reviewCount: 94,
    services: [
      { name: "Loc Retwist", price: 70, duration: "2 hrs" },
      { name: "Starter Locs", price: 100, duration: "3 hrs" },
      { name: "Loc Style", price: 45, duration: "1 hr" },
      { name: "Loc Repair", price: 30, duration: "30 mins" },
    ],
    portfolio: portfolioSets.locs,
    reviews: [
      { id: "r5a", reviewerName: "Jerome D.", rating: 5, comment: "Jaylen started my locs 2 years ago and they look incredible. He genuinely cares about the journey.", createdAt: "2026-08-18T11:00:00Z" },
      { id: "r5b", reviewerName: "Ashley P.", rating: 5, comment: "Best retwist I've ever had. He's meticulous and takes his time to get it right.", createdAt: "2026-07-25T14:30:00Z" },
    ],
    bookingUrl: null,
  },
  {
    id: "6",
    name: "Keisha Patel",
    tagline: "Wig installs & custom units",
    bio: "Flawless wig installs, custom unit construction, and lace melting that looks completely natural. Based in North London.",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
    coverImage: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800&h=400&fit=crop",
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
    portfolio: portfolioSets.wigs,
    reviews: [
      { id: "r6a", reviewerName: "Bianca S.", rating: 5, comment: "The lace melt was *chef's kiss*. Nobody could tell it was a wig. Keisha is a magician.", createdAt: "2026-08-22T10:00:00Z" },
      { id: "r6b", reviewerName: "Chloe N.", rating: 5, comment: "My custom unit is absolutely gorgeous. Worth every penny.", createdAt: "2026-08-08T16:00:00Z" },
      { id: "r6c", reviewerName: "Dani M.", rating: 4, comment: "Good wig install, held up really well. Would recommend for glueless installs.", createdAt: "2026-07-12T11:30:00Z" },
    ],
    bookingUrl: null,
  },
  {
    id: "7",
    name: "Tiana Rivers",
    tagline: "Kids braids & teen styles",
    bio: "Gentle, patient, and creative styles for kids and teens. From simple cornrows to intricate patterns, serving families across South London.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face",
    coverImage: "https://images.unsplash.com/photo-1583001931096-959e9a1a6223?w=800&h=400&fit=crop",
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
    portfolio: [],
    reviews: [],
    bookingUrl: null,
    instagramUrl: "https://instagram.com/tianariversbraids",
    verified: false,
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
    reviews: [
      { id: "r8a", reviewerName: "Alex R.", rating: 5, comment: "Andre has a real eye for shape and style. The editorial cut he gave me got so many compliments at London Fashion Week.", createdAt: "2026-08-25T14:00:00Z" },
      { id: "r8b", reviewerName: "Jordan C.", rating: 5, comment: "Hands down the best stylist I've ever been to. Worth the premium prices.", createdAt: "2026-08-02T11:30:00Z" },
      { id: "r8c", reviewerName: "Maria L.", rating: 5, comment: "Got my hair coloured and cut for a wedding and I felt like a celebrity. Andre is incredibly talented.", createdAt: "2026-07-08T09:00:00Z" },
    ],
    bookingUrl: null,
  },
  {
    id: "9",
    name: "Naomi Clarke",
    tagline: "Lash artist & brow specialist",
    bio: "Certified lash technician offering classic, hybrid, and volume lash extensions plus brow lamination. Creating natural-looking enhancements from my South London beauty suite.",
    avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop&crop=face",
    coverImage: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&h=400&fit=crop",
    region: "South",
    specialties: ["Eyelashes"],
    yearsExperience: 6,
    priceRange: "££",
    featured: false,
    rating: 4.8,
    reviewCount: 115,
    services: [
      { name: "Classic Lash Full Set", price: 65, duration: "1.5 hrs" },
      { name: "Hybrid Lash Full Set", price: 80, duration: "2 hrs" },
      { name: "Volume Lash Full Set", price: 95, duration: "2.5 hrs" },
      { name: "Lash Infill", price: 40, duration: "1 hr" },
      { name: "Brow Lamination", price: 35, duration: "45 mins" },
    ],
    portfolio: portfolioSets.eyelashes,
    reviews: [
      { id: "r9a", reviewerName: "Sophie H.", rating: 5, comment: "Best lashes I've ever had! Naomi took so much care to match the style I wanted. Looked gorgeous for weeks.", createdAt: "2026-08-30T10:00:00Z" },
      { id: "r9b", reviewerName: "Aisha D.", rating: 5, comment: "The hybrid set was perfect — natural but glam at the same time. Naomi is so talented and friendly.", createdAt: "2026-08-14T15:00:00Z" },
      { id: "r9c", reviewerName: "Emma T.", rating: 4, comment: "Really happy with the brow lamination. Clean studio, great results.", createdAt: "2026-07-28T12:00:00Z" },
    ],
    bookingUrl: null,
  },
  {
    id: "10",
    name: "FS Hair UK",
    tagline: "Custom wig units & flawless lace installs",
    bio: "Curated directory profile. Based in Abbey Wood, South London, offering glueless wig installs, custom lace melting, and luxury styling.",
    avatar: null,
    coverImage: null,
    region: "South",
    specialties: ["Wigs"],
    yearsExperience: 4,
    priceRange: "£",
    featured: false,
    rating: 0,
    reviewCount: 0,
    services: [
      { name: "Glueless Wig Install", price: 30, duration: "1.5 hrs" },
      { name: "Lace Frontal Maintenance", price: 25, duration: "1 hr" },
    ],
    portfolio: [],
    bookingUrl: null,
    instagramUrl: "https://instagram.com/fshairuk",
    verified: false,
  },
];

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────

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
