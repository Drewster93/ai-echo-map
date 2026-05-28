export interface GoogleReview {
  rating: number;
  hasOwnerResponse: boolean;
}

export interface GooglePlacesLocation {
  name: string;
  address: string;
  phone: string | null;
  website: string | null;
  latitude: number;
  longitude: number;
  rating: number | null;
  reviewCount: number;
  businessStatus: string;
  primaryCategory: string;
  allCategories: string[];
  openingHours: { day: string; hours: string }[] | null;
  googleMapsUri: string;
  placeId: string;
  photosCount: number;
  googleReviews: GoogleReview[];
}
