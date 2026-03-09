import { genres, moods, musicalKeys, orderItems, orders, producers, profiles, serviceRequests, tracks } from "@/data/seed";
import type { BrowseFilters, Producer, Profile, SortOption, Track } from "@/types/domain";

export const defaultBrowseFilters: BrowseFilters = {
  query: "",
  genres: [],
  moods: [],
  keys: [],
  minBpm: 110,
  maxBpm: 140,
  minPrice: 500,
  maxPrice: 2000,
  stemsOnly: false,
  exclusivesOnly: true,
  sort: "newest",
};

export function getTracks(): Track[] {
  return tracks;
}

export function getTrackBySlug(slug: string): Track | undefined {
  return tracks.find((item) => item.slug === slug);
}

export function getTrackById(id: string): Track | undefined {
  return tracks.find((item) => item.id === id);
}

export function getProducerById(id: string): Producer | undefined {
  return producers.find((item) => item.id === id);
}

export function getProfileById(id: string): Profile | undefined {
  return profiles.find((item) => item.id === id);
}

export function getProducerProfile(producerId: string): { producer: Producer; profile: Profile } | undefined {
  const producer = getProducerById(producerId);
  if (!producer) {
    return undefined;
  }

  const profile = getProfileById(producer.profileId);
  if (!profile) {
    return undefined;
  }

  return { producer, profile };
}

export function filterTracks(filters: BrowseFilters, input: Track[] = tracks): Track[] {
  const filtered = input.filter((item) => {
    const query = filters.query.trim().toLowerCase();
    const queryMatch =
      query.length === 0 ||
      item.title.toLowerCase().includes(query) ||
      item.tags.some((tag) => tag.toLowerCase().includes(query)) ||
      item.genre.toLowerCase().includes(query);

    const genreMatch = filters.genres.length === 0 || filters.genres.includes(item.genre);
    const moodMatch = filters.moods.length === 0 || filters.moods.includes(item.mood);
    const keyMatch = filters.keys.length === 0 || filters.keys.includes(item.musicalKey);
    const bpmMatch = item.bpm >= filters.minBpm && item.bpm <= filters.maxBpm;
    const priceMatch = item.price >= filters.minPrice && item.price <= filters.maxPrice;
    const stemsMatch = !filters.stemsOnly || item.hasStems;
    const exclusiveMatch = !filters.exclusivesOnly || item.exclusivityStatus === "available";

    return queryMatch && genreMatch && moodMatch && keyMatch && bpmMatch && priceMatch && stemsMatch && exclusiveMatch;
  });

  return sortTracks(filtered, filters.sort);
}

export function sortTracks(input: Track[], sort: SortOption): Track[] {
  const sorted = [...input];

  if (sort === "newest") {
    sorted.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }

  if (sort === "price-low") {
    sorted.sort((a, b) => a.price - b.price);
  }

  if (sort === "price-high") {
    sorted.sort((a, b) => b.price - a.price);
  }

  if (sort === "popular") {
    sorted.sort((a, b) => b.popularity - a.popularity);
  }

  return sorted;
}

export function getSimilarTracks(track: Track, limit = 3): Track[] {
  return tracks
    .filter((item) => item.id !== track.id && item.genre === track.genre && item.exclusivityStatus === "available")
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, limit);
}

export function getFeaturedTracks(limit = 4): Track[] {
  return [...tracks]
    .filter((item) => item.exclusivityStatus === "available")
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, limit);
}

export function getNewestTracks(limit = 4): Track[] {
  return [...tracks].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, limit);
}

export function getBuyerDashboardData() {
  const recentOrders = [...orders].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  const purchasedTrackIds = orderItems.map((item) => item.trackId);
  const purchasedTracks = tracks.filter((item) => purchasedTrackIds.includes(item.id));

  return {
    accountName: "Lena K",
    activeOrders: recentOrders.filter((order) => order.status !== "refunded").length,
    totalSpent: recentOrders.reduce((sum, order) => sum + order.total, 0),
    purchasedTracks,
    recentOrders,
    serviceRequests,
  };
}

export function getProducerDashboardData() {
  const producerTracks = tracks.filter((item) => item.producerId === "pro_001");
  const sold = producerTracks.filter((item) => item.exclusivityStatus === "sold").length;

  return {
    producerName: "Arden Vale",
    listedTracks: producerTracks,
    totalSales: 87,
    conversionRate: "9.4%",
    monthlyEarnings: "$7,420",
    sold,
    avgResponse: "5h 24m",
    pendingOrders: 3,
  };
}

export function getFilterCollections() {
  return { genres, moods, musicalKeys };
}
