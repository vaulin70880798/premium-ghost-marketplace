import { producers as seedProducers, profiles as seedProfiles, tracks as seedTracks } from "@/data/seed";
import { resolveArtworkUrl } from "@/lib/artwork";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import type { Track } from "@/types/domain";

type DbTrackRow = {
  id: string;
  title: string;
  slug: string;
  producer_id: string;
  genre: Track["genre"];
  bpm: number;
  musical_key: Track["musicalKey"];
  mood: Track["mood"];
  description: string | null;
  price: number;
  artwork_url: string | null;
  preview_url: string | null;
  has_stems: boolean;
  has_midi: boolean;
  has_master: boolean;
  has_unmastered: boolean;
  has_extended_mix: boolean;
  has_radio_edit: boolean;
  exclusivity_status: Track["exclusivityStatus"];
  duration_seconds: number;
  popularity: number | null;
  created_at: string;
  tags?: string[] | null;
};

function toTrack(row: DbTrackRow): Track {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    producerId: row.producer_id,
    genre: row.genre,
    bpm: row.bpm,
    musicalKey: row.musical_key,
    mood: row.mood,
    description: row.description ?? "",
    price: row.price,
    artworkUrl: resolveArtworkUrl(row.artwork_url, row.id),
    previewUrl: row.preview_url ?? "/previews/1.mp3",
    hasStems: row.has_stems,
    hasMidi: row.has_midi,
    hasMaster: row.has_master,
    hasUnmastered: row.has_unmastered,
    hasExtendedMix: row.has_extended_mix,
    hasRadioEdit: row.has_radio_edit,
    exclusivityStatus: row.exclusivity_status,
    durationSeconds: row.duration_seconds,
    tags: row.tags?.length ? row.tags : [row.genre, row.mood],
    popularity: row.popularity ?? 0,
    createdAt: row.created_at,
  };
}

function fallbackProducerMap(ids: string[]) {
  return Object.fromEntries(
    ids.map((id) => {
      const producer = seedProducers.find((item) => item.id === id);
      if (!producer) {
        return [id, "Verified Producer"];
      }

      const profile = seedProfiles.find((item) => item.id === producer.profileId);
      return [id, profile?.displayName ?? producer.artistName];
    }),
  );
}

export const trackRepository = {
  async list(): Promise<Track[]> {
    if (!hasSupabaseEnv()) {
      return seedTracks;
    }

    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return seedTracks;
    }

    const { data, error } = await supabase.from("tracks").select("*").order("created_at", { ascending: false });

    if (error || !data) {
      return seedTracks;
    }

    return (data as DbTrackRow[]).map(toTrack);
  },

  async getBySlug(slug: string): Promise<Track | null> {
    if (!hasSupabaseEnv()) {
      return seedTracks.find((track) => track.slug === slug) ?? null;
    }

    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return seedTracks.find((track) => track.slug === slug) ?? null;
    }

    const { data, error } = await supabase.from("tracks").select("*").eq("slug", slug).maybeSingle();

    if (error || !data) {
      return seedTracks.find((track) => track.slug === slug) ?? null;
    }

    return toTrack(data as DbTrackRow);
  },

  async getById(id: string): Promise<Track | null> {
    if (!hasSupabaseEnv()) {
      return seedTracks.find((track) => track.id === id) ?? null;
    }

    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return seedTracks.find((track) => track.id === id) ?? null;
    }

    const { data, error } = await supabase.from("tracks").select("*").eq("id", id).maybeSingle();

    if (error || !data) {
      return seedTracks.find((track) => track.id === id) ?? null;
    }

    return toTrack(data as DbTrackRow);
  },

  async getProducerNameMap(ids: string[]): Promise<Record<string, string>> {
    if (ids.length === 0) {
      return {};
    }

    if (!hasSupabaseEnv()) {
      return fallbackProducerMap(ids);
    }

    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return fallbackProducerMap(ids);
    }

    const { data, error } = await supabase.from("producers").select("id, artist_name, is_active").eq("is_active", true).in("id", ids);

    if (error || !data) {
      return fallbackProducerMap(ids);
    }

    const map = Object.fromEntries(data.map((row) => [row.id, row.artist_name]));
    for (const id of ids) {
      if (!map[id]) {
        map[id] = "Verified Producer";
      }
    }

    return map;
  },
};
