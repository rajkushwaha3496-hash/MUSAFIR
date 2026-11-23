export type DestinationRegion =
  | 'All'
  | 'Indian Wonders & Temples'
  | 'Mountains'
  | 'Tropical & Coastal'
  | 'Iconic Cities';

export type IndiaRegion =
  | 'All'
  | 'North'
  | 'South'
  | 'East'
  | 'West'
  | 'Central'
  | 'Northeast';

export type IndiaCategory =
  | 'All'
  | 'Mountains'
  | 'Beaches'
  | 'Waterfalls'
  | 'Lakes'
  | 'Forts'
  | 'Heritage'
  | 'Temples'
  | 'Wildlife'
  | 'Adventure'
  | 'Spiritual'
  | 'Hidden Gems';

export type VerificationStatus = 'Verified' | 'Needs Review' | 'Unverified';

export type BudgetTier =
  | 'all'
  | 'under-500'
  | '500-1000'
  | '1000-2000'
  | '2000-3500'
  | '3500-5000'
  | 'custom';

export type TravelMode =
  | 'Train'
  | 'Bus'
  | 'Shared transport'
  | 'Local public transport'
  | 'Walking';

export type SortOption =
  | 'best-match'
  | 'cheapest'
  | 'shortest-distance'
  | 'most-popular';

export interface PlacePhoto {
  id: string;
  title: string;
  imageUrl: string;
  description: string;
}

export interface MusafirDestination {
  id: string;
  name: string;
  country: string;
  regionCategory: Exclude<DestinationRegion, 'All'>;
  startingPriceInr: number;
  bestSeason: string;
  idealDuration: string;
  imageUrl: string;
  tagline: string;
  easyDescription: string;
  highlights: string[];
  gallery: PlacePhoto[];
}

export interface CommonsPhoto {
  id: string;
  title: string;
  caption: string;
  imageUrl: string;
  thumbUrl: string;
  photographer: string;
  sourceUrl: string;
  license: string;
}

export interface TransportOption {
  mode: TravelMode;
  note: string;
}

export interface DestinationBudget {
  stayPerNightInr: number;
  foodPerDayInr: number;
  localTransportPerDayInr: number;
  entryFeeInr: number;
  entryFeeNote: string;
  estimatedDailyStudentCostInr: number;
  isEstimate: boolean;
}

export interface StudentBudgetBreakdown {
  roundTripTransportInr: number;
  stayTotalInr: number;
  foodTotalInr: number;
  localTransportTotalInr: number;
  sightseeingEntryInr: number;
  emergencyReserveInr: number;
  groupTotalInr: number;
  perPersonTotalInr: number;
  nights: number;
  days: number;
  travelers: number;
  isEstimate: boolean;
}

export interface IndiaDestination {
  id: string;
  slug: string;
  name: string;
  state: string;
  district: string;
  region: Exclude<IndiaRegion, 'All'>;
  category: Exclude<IndiaCategory, 'All'>;
  tags: string[];
  lat: number;
  lon: number;
  description: string;
  whyFamous: string;
  historySpeciality: string;
  thingsToDo: string[];
  suggestedItinerary: string[];
  bestSeason: string;
  weatherNotes: string;
  idealDuration: string;
  recommendedDays: number;
  nearbyAttractions: string[];
  budget: DestinationBudget;
  howToReach: string;
  transportOptions: TransportOption[];
  hostelSuggestions: string[];
  localFood: string[];
  safetyInfo: string;
  accessibilityInfo: string;
  officialTourismUrl: string;
  wikipediaUrl: string | null;
  verificationStatus: VerificationStatus;
  lastVerifiedDate: string | null;
  studentFriendly: boolean;
  weekendTrip: boolean;
  oneDayTrip: boolean;
  groupTrip: boolean;
  popularityScore: number;
  coverPhoto: CommonsPhoto | null;
  gallery: CommonsPhoto[];
  // Optional computed fields returned by search/detail endpoints
  distanceKm?: number | null;
  estimatedBreakdown?: StudentBudgetBreakdown;
}

export interface DestinationsReportStats {
  totalDestinations: number;
  statesAndUTsCovered: number;
  totalPhotographs: number;
  completeGalleries: number;
  partialGalleries: number;
  missingPhotos: number;
  completeDescriptions: number;
  verifiedCount: number;
  needsReviewCount: number;
  unverifiedCount: number;
}

export interface TravelPackage {
  id: string;
  destinationId: string;
  title: string;
  locationLabel: string;
  duration: string;
  days: number;
  pricePerGuestInr: number;
  rating: number;
  reviewCount: number;
  description: string;
  imageUrl: string;
  inclusions: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  tripTaken: string;
  rating: number;
  quote: string;
  avatarUrl: string;
}

export interface BookingRecord {
  id: string;
  destinationName: string;
  packageTitle: string;
  checkIn: string;
  checkOut: string;
  travelers: number;
  totalPriceInr: number;
  guestName: string;
  guestEmail: string;
  createdAt: string;
}

export interface UserSession {
  name: string;
  email: string;
}
