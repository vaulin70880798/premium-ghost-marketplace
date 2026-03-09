import { tracks } from "@/data/seed";
import type { Track } from "@/types/domain";

// MVP repository surface. Replace internals with real Supabase calls when backend is connected.
export const trackRepository = {
  async list(): Promise<Track[]> {
    return tracks;
  },
};
