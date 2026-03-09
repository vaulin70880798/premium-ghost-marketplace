export type UserRole = "buyer" | "producer" | "admin";

export type Genre =
  | "Afro House"
  | "Melodic Techno"
  | "Tech House"
  | "Deep House"
  | "Progressive House"
  | "Drum & Bass"
  | "Garage";

export type Mood =
  | "Euphoric"
  | "Dark"
  | "Hypnotic"
  | "Atmospheric"
  | "Groovy"
  | "Cinematic"
  | "Emotional";

export type MusicalKey =
  | "A minor"
  | "B minor"
  | "C minor"
  | "D minor"
  | "E minor"
  | "F minor"
  | "G minor"
  | "F# minor"
  | "C# minor"
  | "D# minor"
  | "A major"
  | "G major";

export type SortOption = "newest" | "price-low" | "price-high" | "popular";

export interface User {
  id: string;
  email: string;
  role: UserRole;
}

export interface Profile {
  id: string;
  userId: string;
  displayName: string;
  bio: string;
  avatarUrl?: string;
  country: string;
}

export interface Producer {
  id: string;
  profileId: string;
  artistName: string;
  genres: Genre[];
  rating: number;
  totalSales: number;
  responseTime: string;
}

export interface Track {
  id: string;
  title: string;
  slug: string;
  producerId: string;
  genre: Genre;
  bpm: number;
  musicalKey: MusicalKey;
  mood: Mood;
  description: string;
  price: number;
  artworkUrl: string;
  previewUrl: string;
  hasStems: boolean;
  hasMidi: boolean;
  hasMaster: boolean;
  hasUnmastered: boolean;
  hasExtendedMix: boolean;
  hasRadioEdit: boolean;
  exclusivityStatus: "available" | "sold";
  durationSeconds: number;
  tags: string[];
  popularity: number;
  createdAt: string;
}

export interface TrackFile {
  id: string;
  trackId: string;
  fileType: "WAV" | "Stems" | "MIDI" | "Master" | "Unmastered" | "Extended Mix" | "Radio Edit";
  included: boolean;
}

export interface Favorite {
  id: string;
  userId: string;
  trackId: string;
  createdAt: string;
}

export interface Order {
  id: string;
  buyerId: string;
  total: number;
  status: "paid" | "processing" | "refunded";
  createdAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  trackId: string;
  price: number;
}

export interface ServiceRequest {
  id: string;
  buyerId: string;
  service: string;
  genre: Genre;
  budgetRange: string;
  status: "submitted" | "in_review" | "accepted" | "completed";
  notes: string;
  createdAt: string;
}

export interface Review {
  id: string;
  profileId: string;
  producerId: string;
  rating: number;
  text: string;
}

export interface BrowseFilters {
  query: string;
  genres: Genre[];
  moods: Mood[];
  keys: MusicalKey[];
  minBpm: number;
  maxBpm: number;
  minPrice: number;
  maxPrice: number;
  stemsOnly: boolean;
  exclusivesOnly: boolean;
  sort: SortOption;
}
