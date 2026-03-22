import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { tracks as seedTracks, producers as seedProducers } from "@/data/seed";
import { getAuthState } from "@/lib/auth/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import type { Track } from "@/types/domain";

type AdminTrack = {
  id: string;
  title: string;
  slug: string;
  producerId: string;
  genre: string;
  bpm: number;
  musicalKey: string;
  mood: string;
  price: number;
  previewUrl: string | null;
  artworkUrl: string | null;
  packageUrl: string | null;
  exclusivityStatus: "available" | "sold";
  status: "draft" | "pending" | "published" | "rejected";
  createdAt: string;
};

type ProducerOption = {
  id: string;
  artistName: string;
};

interface CreateTrackBody {
  title?: string;
  producerId?: string;
  genre?: string;
  bpm?: number;
  musicalKey?: string;
  mood?: string;
  description?: string;
  price?: number;
  artworkUrl?: string;
  previewUrl?: string;
  packageUrl?: string;
  status?: "draft" | "pending" | "published" | "rejected";
  exclusivityStatus?: "available" | "sold";
  durationSeconds?: number;
  tags?: string[];
  hasStems?: boolean;
  hasMidi?: boolean;
  hasMaster?: boolean;
  hasUnmastered?: boolean;
  hasExtendedMix?: boolean;
  hasRadioEdit?: boolean;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function seedFallback() {
  const tracks: AdminTrack[] = seedTracks.map((track) => ({
    id: track.id,
    title: track.title,
    slug: track.slug,
    producerId: track.producerId,
    genre: track.genre,
    bpm: track.bpm,
    musicalKey: track.musicalKey,
    mood: track.mood,
    price: track.price,
    previewUrl: track.previewUrl,
    artworkUrl: track.artworkUrl,
    packageUrl: null,
    exclusivityStatus: track.exclusivityStatus,
    status: "published",
    createdAt: track.createdAt,
  }));

  const producers: ProducerOption[] = seedProducers.map((producer) => ({
    id: producer.id,
    artistName: producer.artistName,
  }));

  return { tracks, producers };
}

async function requireAdmin() {
  const auth = await getAuthState();

  if (!auth.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (auth.role !== "admin") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  return null;
}

export async function GET() {
  const authError = await requireAdmin();
  if (authError) {
    return authError;
  }

  if (!hasSupabaseEnv()) {
    return NextResponse.json({
      ...seedFallback(),
      mode: "seed",
      writable: false,
      message: "Supabase is not configured yet. Admin track editing is disabled.",
    });
  }

  const adminClient = createSupabaseAdminClient();

  const [{ data: tracksData, error: tracksError }, { data: producersData, error: producersError }] = await Promise.all([
    adminClient.from("tracks").select("*").order("created_at", { ascending: false }),
    adminClient.from("producers").select("id, artist_name").order("artist_name"),
  ]);

  if (tracksError || producersError) {
    return NextResponse.json(
      {
        error: tracksError?.message ?? producersError?.message ?? "Could not load tracks.",
      },
      { status: 400 },
    );
  }

  const tracks: AdminTrack[] = (tracksData ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    producerId: row.producer_id,
    genre: row.genre,
    bpm: row.bpm,
    musicalKey: row.musical_key,
    mood: row.mood,
    price: row.price,
    previewUrl: row.preview_url ?? null,
    artworkUrl: row.artwork_url ?? null,
    packageUrl: row.package_url ?? null,
    exclusivityStatus: row.exclusivity_status,
    status: row.status,
    createdAt: row.created_at,
  }));

  const producers: ProducerOption[] = (producersData ?? []).map((row) => ({
    id: row.id,
    artistName: row.artist_name,
  }));

  return NextResponse.json({ tracks, producers, mode: "supabase", writable: true });
}

export async function POST(request: Request) {
  const authError = await requireAdmin();
  if (authError) {
    return authError;
  }

  if (!hasSupabaseEnv()) {
    return NextResponse.json(
      {
        error: "Supabase is not configured yet. Track creation is disabled.",
      },
      { status: 400 },
    );
  }

  const body = (await request.json().catch(() => null)) as CreateTrackBody | null;

  const title = body?.title?.trim();
  const producerId = body?.producerId?.trim();
  const genre = body?.genre?.trim();
  const musicalKey = body?.musicalKey?.trim();
  const mood = body?.mood?.trim();
  const description = body?.description?.trim() ?? "";
  const artworkUrl = body?.artworkUrl?.trim() || null;
  const previewUrl = body?.previewUrl?.trim() || null;
  const packageUrl = body?.packageUrl?.trim() || null;
  const bpm = Number(body?.bpm);
  const price = Number(body?.price);
  const durationSeconds = Number(body?.durationSeconds);

  if (!title || !producerId || !genre || !musicalKey || !mood || !Number.isFinite(bpm) || !Number.isFinite(price)) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  if (bpm < 60 || bpm > 220) {
    return NextResponse.json({ error: "BPM must be between 60 and 220." }, { status: 400 });
  }

  if (price < 1) {
    return NextResponse.json({ error: "Price must be greater than 0." }, { status: 400 });
  }

  const adminClient = createSupabaseAdminClient();

  const baseSlug = slugify(title);
  const slug = `${baseSlug || "track"}-${randomUUID().slice(0, 6)}`;

  const { data, error } = await adminClient
    .from("tracks")
    .insert({
      title,
      slug,
      producer_id: producerId,
      genre,
      bpm,
      musical_key: musicalKey,
      mood,
      description,
      price,
      artwork_url: artworkUrl,
      preview_url: previewUrl,
      package_url: packageUrl,
      has_stems: body?.hasStems ?? true,
      has_midi: body?.hasMidi ?? true,
      has_master: body?.hasMaster ?? true,
      has_unmastered: body?.hasUnmastered ?? true,
      has_extended_mix: body?.hasExtendedMix ?? true,
      has_radio_edit: body?.hasRadioEdit ?? true,
      exclusivity_status: body?.exclusivityStatus ?? "available",
      status: body?.status ?? "draft",
      duration_seconds: Number.isFinite(durationSeconds) && durationSeconds > 0 ? durationSeconds : 180,
      tags: Array.isArray(body?.tags) ? body?.tags : [genre, mood],
    })
    .select("*")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Could not create track." }, { status: 400 });
  }

  const createdTrack: Track = {
    id: data.id,
    title: data.title,
    slug: data.slug,
    producerId: data.producer_id,
    genre: data.genre,
    bpm: data.bpm,
    musicalKey: data.musical_key,
    mood: data.mood,
    description: data.description ?? "",
    price: data.price,
    artworkUrl: data.artwork_url ?? "/artworks/1.jpg",
    previewUrl: data.preview_url ?? "/previews/1.mp3",
    hasStems: data.has_stems,
    hasMidi: data.has_midi,
    hasMaster: data.has_master,
    hasUnmastered: data.has_unmastered,
    hasExtendedMix: data.has_extended_mix,
    hasRadioEdit: data.has_radio_edit,
    exclusivityStatus: data.exclusivity_status,
    durationSeconds: data.duration_seconds,
    tags: data.tags ?? [data.genre, data.mood],
    popularity: data.popularity ?? 0,
    createdAt: data.created_at,
  };

  return NextResponse.json({ ok: true, track: createdTrack });
}
