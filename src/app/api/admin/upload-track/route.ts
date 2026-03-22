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

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function getFileExtension(file: File) {
  const parts = file.name.split(".");
  const extension = parts.length > 1 ? parts.at(-1)?.toLowerCase() : undefined;
  return extension && /^[a-z0-9]+$/.test(extension) ? extension : "bin";
}

function getFile(formData: FormData, key: string) {
  const value = formData.get(key);
  if (!value || typeof value === "string") {
    return null;
  }

  return value;
}

function parseBoolean(value: FormDataEntryValue | null, fallback = false) {
  if (typeof value !== "string") {
    return fallback;
  }

  return value === "true" || value === "1" || value === "on";
}

function parseNumber(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return Number.NaN;
  }

  return Number(value);
}

function validateFile(file: File | null, options: { label: string; required: boolean; maxBytes: number; allowedMime: Set<string>; allowedExtensions: string[] }) {
  if (!file) {
    if (options.required) {
      return `${options.label} is required.`;
    }

    return null;
  }

  const extension = getFileExtension(file);

  if (file.size > options.maxBytes) {
    return `${options.label} exceeds the size limit.`;
  }

  if (!options.allowedMime.has(file.type) && !options.allowedExtensions.includes(extension)) {
    return `${options.label} has unsupported format.`;
  }

  return null;
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

async function uploadFile(adminClient: ReturnType<typeof createSupabaseAdminClient>, file: File, folder: string, slug: string) {
  const extension = getFileExtension(file);
  const path = `${folder}/${new Date().toISOString().slice(0, 10)}/${slug}-${randomUUID().slice(0, 8)}.${extension}`;
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  const { error } = await adminClient.storage.from(STORAGE_BUCKET).upload(path, fileBuffer, {
    cacheControl: "3600",
    contentType: file.type || undefined,
    upsert: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = adminClient.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return {
    path,
    publicUrl: data.publicUrl,
  };
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

export async function POST(request: Request) {
  const authError = await requireAdmin();
  if (authError) {
    return authError;
  }

  if (!hasSupabaseAdminEnv()) {
    return NextResponse.json({ error: "Supabase admin environment is missing." }, { status: 400 });
  }

  const formData = await request.formData();

  const title = typeof formData.get("title") === "string" ? String(formData.get("title")).trim() : "";
  const producerId = typeof formData.get("producerId") === "string" ? String(formData.get("producerId")).trim() : "";
  const genre = typeof formData.get("genre") === "string" ? String(formData.get("genre")).trim() : "";
  const musicalKey = typeof formData.get("musicalKey") === "string" ? String(formData.get("musicalKey")).trim() : "";
  const mood = typeof formData.get("mood") === "string" ? String(formData.get("mood")).trim() : "";
  const description = typeof formData.get("description") === "string" ? String(formData.get("description")).trim() : "";
  const tagsValue = typeof formData.get("tags") === "string" ? String(formData.get("tags")).trim() : "";
  const tags = tagsValue.length > 0 ? tagsValue.split(",").map((item) => item.trim()).filter(Boolean).slice(0, 8) : [];
  const bpm = parseNumber(formData.get("bpm"));
  const price = parseNumber(formData.get("price"));
  const durationSeconds = parseNumber(formData.get("durationSeconds"));

  const hasStems = parseBoolean(formData.get("hasStems"), true);
  const hasMidi = parseBoolean(formData.get("hasMidi"), true);
  const hasMaster = parseBoolean(formData.get("hasMaster"), true);
  const hasUnmastered = parseBoolean(formData.get("hasUnmastered"), true);
  const hasExtendedMix = parseBoolean(formData.get("hasExtendedMix"), true);
  const hasRadioEdit = parseBoolean(formData.get("hasRadioEdit"), true);
  const exclusiveSale = parseBoolean(formData.get("exclusiveSale"), true);

  if (!title || !producerId || !genre || !musicalKey || !mood || !description || !Number.isFinite(bpm) || !Number.isFinite(price)) {
    return NextResponse.json({ error: "Missing required metadata fields." }, { status: 400 });
  }

  if (bpm < 60 || bpm > 220) {
    return NextResponse.json({ error: "BPM must be between 60 and 220." }, { status: 400 });
  }

  if (price < 1) {
    return NextResponse.json({ error: "Price must be greater than 0." }, { status: 400 });
  }

  const artworkFile = getFile(formData, "artworkFile");
  const previewFile = getFile(formData, "previewFile");
  const packageZipFile = getFile(formData, "packageZipFile");
  const fullWavFile = getFile(formData, "fullWavFile");
  const fullMp3File = getFile(formData, "fullMp3File");
  const stemsZipFile = getFile(formData, "stemsZipFile");
  const midiFile = getFile(formData, "midiFile");

  const validationErrors = [
    validateFile(artworkFile, {
      label: "Artwork",
      required: true,
      maxBytes: MAX_IMAGE_BYTES,
      allowedMime: ALLOWED_IMAGE_MIME,
      allowedExtensions: ["jpg", "jpeg", "png", "webp"],
    }),
    validateFile(previewFile, {
      label: "Preview file",
      required: true,
      maxBytes: MAX_PREVIEW_BYTES,
      allowedMime: ALLOWED_PREVIEW_MIME,
      allowedExtensions: ["mp3", "wav"],
    }),
    validateFile(packageZipFile, {
      label: "Package ZIP",
      required: true,
      maxBytes: MAX_ZIP_BYTES,
      allowedMime: ALLOWED_ZIP_MIME,
      allowedExtensions: ["zip"],
    }),
    validateFile(fullWavFile, {
      label: "Full WAV/AIFF",
      required: false,
      maxBytes: MAX_AUDIO_BYTES,
      allowedMime: ALLOWED_AUDIO_MIME,
      allowedExtensions: ["wav", "aif", "aiff"],
    }),
    validateFile(fullMp3File, {
      label: "Full MP3",
      required: false,
      maxBytes: MAX_AUDIO_BYTES,
      allowedMime: ALLOWED_AUDIO_MIME,
      allowedExtensions: ["mp3"],
    }),
    validateFile(stemsZipFile, {
      label: "Stems ZIP",
      required: false,
      maxBytes: MAX_ZIP_BYTES,
      allowedMime: ALLOWED_ZIP_MIME,
      allowedExtensions: ["zip"],
    }),
    validateFile(midiFile, {
      label: "MIDI file",
      required: false,
      maxBytes: 10 * 1024 * 1024,
      allowedMime: new Set(["audio/midi", "audio/x-midi", "application/octet-stream"]),
      allowedExtensions: ["mid", "midi"],
    }),
  ].filter(Boolean);

  if (validationErrors.length > 0) {
    return NextResponse.json({ error: validationErrors[0] }, { status: 400 });
  }

  const adminClient = createSupabaseAdminClient();

  const { data: producerData, error: producerError } = await adminClient
    .from("producers")
    .select("id, is_active")
    .eq("id", producerId)
    .maybeSingle();

  if (producerError || !producerData) {
    return NextResponse.json({ error: "Selected producer does not exist." }, { status: 400 });
  }

  if (producerData.is_active === false) {
    return NextResponse.json({ error: "Selected producer is inactive. Restore producer first." }, { status: 400 });
  }

  const slugBase = slugify(title) || "track";
  const slug = `${slugBase}-${randomUUID().slice(0, 6)}`;

  try {
    await ensureBucket(adminClient);

    const [artworkUpload, previewUpload, packageUpload, wavUpload, mp3Upload, stemsUpload, midiUpload] = await Promise.all([
      uploadFile(adminClient, artworkFile!, "artwork", slug),
      uploadFile(adminClient, previewFile!, "preview", slug),
      uploadFile(adminClient, packageZipFile!, "package", slug),
      fullWavFile ? uploadFile(adminClient, fullWavFile, "audio/full-wav", slug) : Promise.resolve(null),
      fullMp3File ? uploadFile(adminClient, fullMp3File, "audio/full-mp3", slug) : Promise.resolve(null),
      stemsZipFile ? uploadFile(adminClient, stemsZipFile, "stems", slug) : Promise.resolve(null),
      midiFile ? uploadFile(adminClient, midiFile, "midi", slug) : Promise.resolve(null),
    ]);

    const { data: createdTrack, error: createTrackError } = await adminClient
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
        artwork_url: artworkUpload.publicUrl,
        preview_url: previewUpload.publicUrl,
        package_url: packageUpload.publicUrl,
        has_stems: hasStems,
        has_midi: hasMidi || Boolean(midiUpload),
        has_master: hasMaster || Boolean(wavUpload || mp3Upload),
        has_unmastered: hasUnmastered,
        has_extended_mix: hasExtendedMix,
        has_radio_edit: hasRadioEdit,
        exclusivity_status: exclusiveSale ? "available" : "sold",
        status: "published",
        duration_seconds: Number.isFinite(durationSeconds) && durationSeconds > 0 ? durationSeconds : 180,
        tags: tags.length > 0 ? tags : [genre, mood],
      })
      .select("id, slug")
      .single();

    if (createTrackError || !createdTrack) {
      return NextResponse.json({ error: createTrackError?.message ?? "Could not create track record." }, { status: 400 });
    }

    const trackFilesPayload = [
      { track_id: createdTrack.id, file_type: "Artwork", included: true, storage_path: artworkUpload.path },
      { track_id: createdTrack.id, file_type: "Preview", included: true, storage_path: previewUpload.path },
      { track_id: createdTrack.id, file_type: "Package ZIP", included: true, storage_path: packageUpload.path },
      wavUpload ? { track_id: createdTrack.id, file_type: "Full WAV", included: true, storage_path: wavUpload.path } : null,
      mp3Upload ? { track_id: createdTrack.id, file_type: "Full MP3", included: true, storage_path: mp3Upload.path } : null,
      stemsUpload ? { track_id: createdTrack.id, file_type: "Stems ZIP", included: true, storage_path: stemsUpload.path } : null,
      midiUpload ? { track_id: createdTrack.id, file_type: "MIDI", included: true, storage_path: midiUpload.path } : null,
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
        package: packageUpload.publicUrl,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Upload failed.",
      },
      { status: 500 },
    );
  }
}
