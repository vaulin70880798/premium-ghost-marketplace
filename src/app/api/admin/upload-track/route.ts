import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { getAuthState } from "@/lib/auth/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminEnv } from "@/lib/supabase/config";

export const runtime = "nodejs";

const STORAGE_BUCKET = "track-files";
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const MAX_PREVIEW_BYTES = 20 * 1024 * 1024;
const MAX_AUDIO_BYTES = 50 * 1024 * 1024;
const MAX_ZIP_BYTES = 50 * 1024 * 1024;

const ALLOWED_IMAGE_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_PREVIEW_MIME = new Set(["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav"]);
const ALLOWED_AUDIO_MIME = new Set(["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/aiff", "audio/x-aiff"]);
const ALLOWED_ZIP_MIME = new Set(["application/zip", "application/x-zip-compressed", "application/octet-stream"]);
const ALLOWED_MIDI_MIME = new Set(["audio/midi", "audio/x-midi", "application/octet-stream"]);

type UploadField =
  | "artworkFile"
  | "previewFile"
  | "packageZipFile"
  | "fullWavFile"
  | "fullMp3File"
  | "stemsZipFile"
  | "midiFile";

type UploadRule = {
  label: string;
  required: boolean;
  maxBytes: number;
  folder: string;
  allowedMime: Set<string>;
  allowedExtensions: string[];
};

const uploadRules: Record<UploadField, UploadRule> = {
  artworkFile: {
    label: "Artwork",
    required: true,
    maxBytes: MAX_IMAGE_BYTES,
    folder: "artwork",
    allowedMime: ALLOWED_IMAGE_MIME,
    allowedExtensions: ["jpg", "jpeg", "png", "webp"],
  },
  previewFile: {
    label: "Preview file",
    required: true,
    maxBytes: MAX_PREVIEW_BYTES,
    folder: "preview",
    allowedMime: ALLOWED_PREVIEW_MIME,
    allowedExtensions: ["mp3", "wav"],
  },
  packageZipFile: {
    label: "Package ZIP",
    required: false,
    maxBytes: MAX_ZIP_BYTES,
    folder: "package",
    allowedMime: ALLOWED_ZIP_MIME,
    allowedExtensions: ["zip"],
  },
  fullWavFile: {
    label: "Full WAV/AIFF",
    required: false,
    maxBytes: MAX_AUDIO_BYTES,
    folder: "audio/full-wav",
    allowedMime: ALLOWED_AUDIO_MIME,
    allowedExtensions: ["wav", "aif", "aiff"],
  },
  fullMp3File: {
    label: "Full MP3",
    required: false,
    maxBytes: MAX_AUDIO_BYTES,
    folder: "audio/full-mp3",
    allowedMime: ALLOWED_AUDIO_MIME,
    allowedExtensions: ["mp3"],
  },
  stemsZipFile: {
    label: "Stems ZIP",
    required: false,
    maxBytes: MAX_ZIP_BYTES,
    folder: "stems",
    allowedMime: ALLOWED_ZIP_MIME,
    allowedExtensions: ["zip"],
  },
  midiFile: {
    label: "MIDI file",
    required: false,
    maxBytes: 10 * 1024 * 1024,
    folder: "midi",
    allowedMime: ALLOWED_MIDI_MIME,
    allowedExtensions: ["mid", "midi"],
  },
};

interface UploadSignFileBody {
  field?: UploadField;
  fileName?: string;
  contentType?: string;
  sizeBytes?: number;
}

interface UploadSignBody {
  title?: string;
  files?: UploadSignFileBody[];
}

interface UploadFinalizeBody {
  title?: string;
  producerId?: string;
  genre?: string;
  bpm?: number | string;
  musicalKey?: string;
  mood?: string;
  description?: string;
  price?: number | string;
  durationSeconds?: number | string;
  tags?: string;
  hasStems?: boolean | string;
  hasMidi?: boolean | string;
  hasMaster?: boolean | string;
  hasUnmastered?: boolean | string;
  hasExtendedMix?: boolean | string;
  hasRadioEdit?: boolean | string;
  exclusiveSale?: boolean | string;
  uploadedPaths?: Partial<Record<UploadField, string>>;
}

type UploadedAsset = {
  path: string;
  publicUrl: string;
};

type UploadedAssets = Partial<Record<UploadField, UploadedAsset>>;

type ParsedMetadata = {
  title: string;
  producerId: string;
  genre: string;
  bpm: number;
  musicalKey: string;
  mood: string;
  description: string;
  tags: string[];
  price: number;
  durationSeconds: number;
  hasStems: boolean;
  hasMidi: boolean;
  hasMaster: boolean;
  hasUnmastered: boolean;
  hasExtendedMix: boolean;
  hasRadioEdit: boolean;
  exclusiveSale: boolean;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function isUploadField(value: string): value is UploadField {
  return value in uploadRules;
}

function getFileExtension(fileName: string) {
  const extension = fileName.split(".").at(-1)?.toLowerCase() ?? "";
  return /^[a-z0-9]+$/.test(extension) ? extension : "bin";
}

function parseBoolean(value: unknown, fallback = false) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value !== "string") {
    return fallback;
  }

  return value === "true" || value === "1" || value === "on";
}

function parseNumber(value: unknown) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    return Number(value);
  }

  return Number.NaN;
}

function validateFileMeta(
  field: UploadField,
  fileName: string,
  contentType: string | undefined,
  sizeBytes: number | undefined,
) {
  const rule = uploadRules[field];
  const extension = getFileExtension(fileName);

  if (typeof sizeBytes === "number" && sizeBytes > rule.maxBytes) {
    return `${rule.label} exceeds the size limit.`;
  }

  if (
    (contentType && !rule.allowedMime.has(contentType)) &&
    !rule.allowedExtensions.includes(extension)
  ) {
    return `${rule.label} has unsupported format.`;
  }

  if (!rule.allowedExtensions.includes(extension) && (!contentType || !rule.allowedMime.has(contentType))) {
    return `${rule.label} has unsupported format.`;
  }

  return null;
}

function parseMetadataFromBody(body: UploadFinalizeBody): ParsedMetadata | { error: string } {
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const producerId = typeof body.producerId === "string" ? body.producerId.trim() : "";
  const genre = typeof body.genre === "string" ? body.genre.trim() : "";
  const musicalKey = typeof body.musicalKey === "string" ? body.musicalKey.trim() : "";
  const mood = typeof body.mood === "string" ? body.mood.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const tagsValue = typeof body.tags === "string" ? body.tags.trim() : "";
  const tags = tagsValue.length > 0 ? tagsValue.split(",").map((item) => item.trim()).filter(Boolean).slice(0, 8) : [];
  const bpm = parseNumber(body.bpm);
  const price = parseNumber(body.price);
  const durationSeconds = parseNumber(body.durationSeconds);

  const hasStems = parseBoolean(body.hasStems, true);
  const hasMidi = parseBoolean(body.hasMidi, true);
  const hasMaster = parseBoolean(body.hasMaster, true);
  const hasUnmastered = parseBoolean(body.hasUnmastered, true);
  const hasExtendedMix = parseBoolean(body.hasExtendedMix, true);
  const hasRadioEdit = parseBoolean(body.hasRadioEdit, true);
  const exclusiveSale = parseBoolean(body.exclusiveSale, true);

  if (!title || !producerId || !genre || !musicalKey || !mood || !description || !Number.isFinite(bpm) || !Number.isFinite(price)) {
    return { error: "Missing required metadata fields." };
  }

  if (bpm < 60 || bpm > 220) {
    return { error: "BPM must be between 60 and 220." };
  }

  if (price < 1) {
    return { error: "Price must be greater than 0." };
  }

  return {
    title,
    producerId,
    genre,
    bpm,
    musicalKey,
    mood,
    description,
    tags,
    price,
    durationSeconds: Number.isFinite(durationSeconds) && durationSeconds > 0 ? durationSeconds : 180,
    hasStems,
    hasMidi,
    hasMaster,
    hasUnmastered,
    hasExtendedMix,
    hasRadioEdit,
    exclusiveSale,
  };
}

function getStoragePath(field: UploadField, fileName: string, slugBase: string) {
  const extension = getFileExtension(fileName);
  const dateKey = new Date().toISOString().slice(0, 10);
  const safeBase = slugify(slugBase) || "track";
  const uniqueKey = randomUUID().slice(0, 8);
  const folder = uploadRules[field].folder;

  return `${folder}/${dateKey}/${safeBase}-${uniqueKey}.${extension}`;
}

async function ensureBucket(adminClient: ReturnType<typeof createSupabaseAdminClient>) {
  const { data, error } = await adminClient.storage.getBucket(STORAGE_BUCKET);
  if (data && !error) {
    return;
  }

  const { error: createError } = await adminClient.storage.createBucket(STORAGE_BUCKET, {
    public: true,
    fileSizeLimit: "50MB",
  });

  if (createError && !createError.message.toLowerCase().includes("already exists")) {
    throw new Error(createError.message);
  }
}

async function verifyProducer(adminClient: ReturnType<typeof createSupabaseAdminClient>, producerId: string) {
  const { data: producerData, error: producerError } = await adminClient
    .from("producers")
    .select("id, is_active")
    .eq("id", producerId)
    .maybeSingle();

  if (producerError || !producerData) {
    return { ok: false as const, error: "Selected producer does not exist." };
  }

  if (producerData.is_active === false) {
    return { ok: false as const, error: "Selected producer is inactive. Restore producer first." };
  }

  return { ok: true as const };
}

function getPublicUrl(adminClient: ReturnType<typeof createSupabaseAdminClient>, path: string) {
  const { data } = adminClient.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

async function createTrackWithAssets(
  adminClient: ReturnType<typeof createSupabaseAdminClient>,
  metadata: ParsedMetadata,
  uploadedAssets: UploadedAssets,
) {
  const artworkUpload = uploadedAssets.artworkFile;
  const previewUpload = uploadedAssets.previewFile;
  const packageUpload = uploadedAssets.packageZipFile;
  const fullSongUpload = uploadedAssets.fullWavFile ?? uploadedAssets.fullMp3File;

  if (!artworkUpload || !previewUpload || !fullSongUpload) {
    return NextResponse.json({ error: "Artwork, preview, and full song file (WAV or MP3) are required." }, { status: 400 });
  }

  const slugBase = slugify(metadata.title) || "track";
  const slug = `${slugBase}-${randomUUID().slice(0, 6)}`;

  const { data: createdTrack, error: createTrackError } = await adminClient
    .from("tracks")
    .insert({
      title: metadata.title,
      slug,
      producer_id: metadata.producerId,
      genre: metadata.genre,
      bpm: metadata.bpm,
      musical_key: metadata.musicalKey,
      mood: metadata.mood,
      description: metadata.description,
      price: metadata.price,
      artwork_url: artworkUpload.publicUrl,
      preview_url: previewUpload.publicUrl,
      package_url: packageUpload?.publicUrl ?? null,
      has_stems: metadata.hasStems,
      has_midi: metadata.hasMidi || Boolean(uploadedAssets.midiFile),
      has_master: metadata.hasMaster || Boolean(uploadedAssets.fullWavFile || uploadedAssets.fullMp3File),
      has_unmastered: metadata.hasUnmastered,
      has_extended_mix: metadata.hasExtendedMix,
      has_radio_edit: metadata.hasRadioEdit,
      exclusivity_status: metadata.exclusiveSale ? "available" : "sold",
      status: "published",
      duration_seconds: metadata.durationSeconds,
      tags: metadata.tags.length > 0 ? metadata.tags : [metadata.genre, metadata.mood],
    })
    .select("id, slug")
    .single();

  if (createTrackError || !createdTrack) {
    return NextResponse.json({ error: createTrackError?.message ?? "Could not create track record." }, { status: 400 });
  }

  const trackFilesPayload = [
    { track_id: createdTrack.id, file_type: "Artwork", included: true, storage_path: artworkUpload.path },
    { track_id: createdTrack.id, file_type: "Preview", included: true, storage_path: previewUpload.path },
    packageUpload ? { track_id: createdTrack.id, file_type: "Package ZIP", included: true, storage_path: packageUpload.path } : null,
    uploadedAssets.fullWavFile ? { track_id: createdTrack.id, file_type: "Full WAV", included: true, storage_path: uploadedAssets.fullWavFile.path } : null,
    uploadedAssets.fullMp3File ? { track_id: createdTrack.id, file_type: "Full MP3", included: true, storage_path: uploadedAssets.fullMp3File.path } : null,
    uploadedAssets.stemsZipFile ? { track_id: createdTrack.id, file_type: "Stems ZIP", included: true, storage_path: uploadedAssets.stemsZipFile.path } : null,
    uploadedAssets.midiFile ? { track_id: createdTrack.id, file_type: "MIDI", included: true, storage_path: uploadedAssets.midiFile.path } : null,
  ].filter(Boolean);

  if (trackFilesPayload.length > 0) {
    const { error: trackFilesError } = await adminClient.from("track_files").insert(trackFilesPayload);
    if (trackFilesError) {
      return NextResponse.json(
        {
          ok: true,
          warning: `Track created, but some file metadata rows failed: ${trackFilesError.message}`,
          slug: createdTrack.slug,
        },
        { status: 200 },
      );
    }
  }

  return NextResponse.json({
    ok: true,
    slug: createdTrack.slug,
    files: {
      artwork: artworkUpload.publicUrl,
      preview: previewUpload.publicUrl,
      package: packageUpload?.publicUrl ?? null,
    },
  });
}

async function requireAdmin() {
  const auth = await getAuthState();

  if (!auth.user) {
    return NextResponse.json({ error: "Admin session expired. Please sign in again." }, { status: 401 });
  }

  if (auth.role !== "admin") {
    return NextResponse.json(
      {
        error: `Only admins can upload tracks. Current role: ${auth.role}.`,
      },
      { status: 403 },
    );
  }

  return null;
}

export async function PUT(request: Request) {
  const authError = await requireAdmin();
  if (authError) {
    return authError;
  }

  if (!hasSupabaseAdminEnv()) {
    return NextResponse.json({ error: "Supabase admin environment is missing." }, { status: 400 });
  }

  const body = (await request.json().catch(() => null)) as UploadSignBody | null;
  const files = Array.isArray(body?.files) ? body.files : [];
  const title = typeof body?.title === "string" ? body.title : "track";

  if (files.length === 0) {
    return NextResponse.json({ error: "No files provided for signed upload preparation." }, { status: 400 });
  }

  const adminClient = createSupabaseAdminClient();
  await ensureBucket(adminClient);

  const uploads: Partial<Record<UploadField, { path: string; token: string; publicUrl: string }>> = {};

  for (const file of files) {
    if (!file?.field || !file?.fileName || !isUploadField(file.field)) {
      return NextResponse.json({ error: "Invalid upload field payload." }, { status: 400 });
    }

    const validationError = validateFileMeta(file.field, file.fileName, file.contentType, file.sizeBytes);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const path = getStoragePath(file.field, file.fileName, `${title}-${file.field}`);
    const { data, error } = await adminClient.storage.from(STORAGE_BUCKET).createSignedUploadUrl(path);

    if (error || !data) {
      return NextResponse.json({ error: error?.message ?? "Could not create signed upload URL." }, { status: 400 });
    }

    uploads[file.field] = {
      path,
      token: data.token,
      publicUrl: getPublicUrl(adminClient, path),
    };
  }

  return NextResponse.json({ ok: true, bucket: STORAGE_BUCKET, uploads });
}

export async function POST(request: Request) {
  const authError = await requireAdmin();
  if (authError) {
    return authError;
  }

  if (!hasSupabaseAdminEnv()) {
    return NextResponse.json({ error: "Supabase admin environment is missing." }, { status: 400 });
  }

  const body = (await request.json().catch(() => null)) as UploadFinalizeBody | null;
  if (!body) {
    return NextResponse.json({ error: "Invalid upload payload." }, { status: 400 });
  }

  const metadataResult = parseMetadataFromBody(body);
  if ("error" in metadataResult) {
    return NextResponse.json({ error: metadataResult.error }, { status: 400 });
  }

  const uploadedPaths = body.uploadedPaths ?? {};
  const hasFullSongUpload = Boolean(uploadedPaths.fullWavFile || uploadedPaths.fullMp3File);
  if (!uploadedPaths.artworkFile || !uploadedPaths.previewFile || !hasFullSongUpload) {
    return NextResponse.json(
      { error: "Artwork, preview, and full song upload (WAV or MP3) are required." },
      { status: 400 },
    );
  }

  const adminClient = createSupabaseAdminClient();
  const producerCheck = await verifyProducer(adminClient, metadataResult.producerId);
  if (!producerCheck.ok) {
    return NextResponse.json({ error: producerCheck.error }, { status: 400 });
  }

  const uploadedAssets: UploadedAssets = {};

  (Object.keys(uploadedPaths) as UploadField[]).forEach((field) => {
    const path = uploadedPaths[field];
    if (!path || !isUploadField(field)) {
      return;
    }
    uploadedAssets[field] = {
      path,
      publicUrl: getPublicUrl(adminClient, path),
    };
  });

  return createTrackWithAssets(adminClient, metadataResult, uploadedAssets);
}
