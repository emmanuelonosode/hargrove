export type PropertyType = "residential" | "commercial" | "land" | "condo" | "townhouse";
export type ListingType = "for-sale" | "for-rent" | "for-lease";
export type PropertyStatus = "available" | "under-contract" | "sold" | "rented";

export interface PropertyImage {
  id: string;
  url: string;
  caption?: string;
  isPrimary: boolean;
}

export interface Property {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: PropertyType;
  listingType: ListingType;
  status: PropertyStatus;
  price: number;
  priceLabel?: string; // e.g. "/mo" for rentals
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  lotSize?: number;
  yearBuilt?: number;
  address: string;
  city: string;
  state: string;
  zip: string;
  latitude?: number;
  longitude?: number;
  images: PropertyImage[];
  amenities: string[];
  isFeatured: boolean;
  isPublished: boolean;
  agentId: string;
  createdAt: string;
  updatedAt: string;
  garage?: number;
  stories?: number;
  neighborhood?: string;
  virtualTourUrl?: string;
}

export interface Agent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string;
  title: string;
  bio: string;
  licenseNumber: string;
  specialties: string[];
  languages: string[];
  totalSales: number;
  yearsExperience: number;
  activeListings: number;
  socialLinks?: {
    linkedin?: string;
    instagram?: string;
  };
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  avatar?: string;
  rating: number;
  text: string;
  transactionType: string;
  date: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  category: string;
  tags: string[];
  publishedAt: string;
  readTime: number;
}

export interface LeadFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  interestType: "buy" | "rent" | "invest" | "sell";
  budget?: string;
  message?: string;
  propertyId?: string;
}

export interface SearchFilters {
  query?: string;
  listingType?: ListingType | "all";
  propertyType?: PropertyType | "all";
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  city?: string;
  state?: string;
}
