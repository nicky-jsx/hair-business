export interface StylistAccount {
  id: string;
  email: string;
  name: string;
  password: string;
  stylistId: string | null;
  createdAt: string;
}

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface ProfileCreationInput {
  tagline: string;
  bio: string;
  region: string;
  yearsExperience: number;
  specialties: string[];
  services: { name: string; price: number; duration: string }[];
  avatar: string;
  coverImage: string;
  portfolio: string[];
  priceRange: string;
}
