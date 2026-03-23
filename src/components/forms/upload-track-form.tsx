"use client";

import Link from "next/link";
import { UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

const deliverables = ["WAV", "Stems", "MIDI", "Master", "Unmastered", "Extended Mix", "Radio Edit"];
const genreOptions = ["Melodic Techno", "Tech House", "Afro House", "Deep House", "Progressive House", "Drum & Bass", "Garage", "Other"];
const moodOptions = ["Euphoric", "Dark", "Hypnotic", "Atmospheric", "Groovy", "Cinematic", "Emotional"];
const keyOptions = ["A minor", "B minor", "C minor", "D minor", "E minor", "F minor", "G minor", "F# minor", "C# minor", "D# minor", "A major", "G major"];

const IMAGE_MAX_BYTES = 2 * 1024 * 1024;
const PREVIEW_MAX_BYTES = 20 * 1024 * 1024;
const AUDIO_MAX_BYTES = 50 * 1024 * 1024;
const ZIP_MAX_BYTES = 50 * 1024 * 1024;

type UploadFileState = {
  artworkFile: File | null;
  previewFile: File | null;
  packageZipFile: File | null;
  fullWavFile: File | null;
  fullMp3File: File | null;
  stemsZipFile: File | null;
  midiFile: File | null;
};

type ProducerOption = {
  id: string;
  artistName: string;
};

const initialFiles: UploadFileState = {
  artworkFile: null,
  previewFile: null,
  packageZipFile: null,
  fullWavFile: null,
  fullMp3File: null,
  stemsZipFile: null,
  midiFile: null,
};

function hasExtension(file: File, extensions: string[]) {
  const extension = file.name.split(".").at(-1)?.toLowerCase() ?? "";
  return extensions.includes(extension);
}

async function extractApiError(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    return payload?.error ?? null;
  }

  const text = await response.text().catch(() => "");
  if (response.status === 413) {
    return "Upload is too large for this request. Please try again with smaller files.";
  }

  return text.trim().slice(0, 180) || null;
}

export function UploadTrackForm() {
  const router = useRouter();
  const [producers, setProducers] = useState<ProducerOption[]>([]);
  const [isLoadingProducers, setIsLoadingProducers] = useState(true);
  const [isWritable, setIsWritable] = useState(true);

  const [title, setTitle] = useState("");
  const [producerId, setProducerId] = useState("");
  const [genre, setGenre] = useState("Melodic Techno");
  const [bpm, setBpm] = useState(124);
  const [musicalKey, setMusicalKey] = useState("A minor");
  const [mood, setMood] = useState("Atmospheric");
  const [price, setPrice] = useState(990);
  const [durationSeconds, setDurationSeconds] = useState(180);
  const [tags, setTags] = useState("Festival, Cinematic, Peak-time");
  const [description, setDescription] = useState("");

  const [selectedDeliverables, setSelectedDeliverables] = useState<string[]>(["WAV", "Stems", "Master"]);
  const [exclusiveSale, setExclusiveSale] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [files, setFiles] = useState<UploadFileState>(initialFiles);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      const response = await fetch("/api/admin/tracks", { method: "GET" });
      const payload = (await response.json().catch(() => null)) as
        | {
            producers?: ProducerOption[];
            writable?: boolean;
            error?: string;
            message?: string;
          }
        | null;

      if (!mounted) {
        return;
      }

      setIsLoadingProducers(false);

      if (!response.ok || !payload) {
        toast.error(payload?.error ?? "Could not load producers.");
        if (response.status === 401 || response.status === 403) {
          router.push("/auth/sign-in");
        }
        return;
      }

      if (payload.message) {
        toast.info(payload.message);
      }

      const loadedProducers = payload.producers ?? [];
      setProducers(loadedProducers);
      setIsWritable(Boolean(payload.writable));
      setProducerId(loadedProducers[0]?.id ?? "");
    };

    void run();

    return () => {
      mounted = false;
    };
  }, [router]);

  const producerSelectDisabled = isLoadingProducers || producers.length === 0 || !isWritable;
  const hasRequiredCoreFiles = Boolean(files.artworkFile && files.previewFile);
  const hasFullSongFile = Boolean(files.fullWavFile || files.fullMp3File);

  const submitDisabled = useMemo(() => {
    return isSubmitting || !isWritable || producerSelectDisabled;
  }, [isSubmitting, isWritable, producerSelectDisabled]);

  const submissionHint = useMemo(() => {
    if (!isWritable) {
      return "Upload is disabled until Supabase admin environment is configured.";
    }

    if (producerSelectDisabled) {
      if (isLoadingProducers) {
        return "Loading producers...";
      }
      return "No active producer is available. Add or restore a producer first.";
    }

    if (!title.trim()) {
      return "Enter track title.";
    }

    if (!description.trim()) {
      return "Add track description.";
    }

    if (!hasRequiredCoreFiles) {
      return "Artwork and preview are required.";
    }

    if (!hasFullSongFile) {
      return "Full song file is required (WAV or MP3).";
    }

    if (!agreed) {
      return "Accept upload and licensing terms to continue.";
    }

    return "Ready to upload.";
  }, [agreed, description, hasFullSongFile, hasRequiredCoreFiles, isLoadingProducers, isWritable, producerSelectDisabled, title]);

  const toggleDeliverable = (item: string) => {
    setSelectedDeliverables((current) =>
      current.includes(item) ? current.filter((value) => value !== item) : [...current, item],
    );
  };

  const validateGenericFile = (file: File, options: { maxBytes: number; mime: string[]; extensions: string[]; label: string }) => {
    if (file.size > options.maxBytes) {
      return `${options.label} exceeds size limit.`;
    }

    if (!options.mime.includes(file.type) && !hasExtension(file, options.extensions)) {
      return `${options.label} has unsupported format.`;
    }

    return null;
  };

  const onFileChange = (key: keyof UploadFileState, file: File | null) => {
    if (!file) {
      setFiles((current) => ({ ...current, [key]: null }));
      return;
    }

    if (key === "artworkFile") {
      const genericError = validateGenericFile(file, {
        maxBytes: IMAGE_MAX_BYTES,
        mime: ["image/jpeg", "image/png", "image/webp"],
        extensions: ["jpg", "jpeg", "png", "webp"],
        label: "Artwork",
      });

      if (genericError) {
        toast.error(genericError);
        return;
      }
    }

    if (key === "previewFile") {
      const error = validateGenericFile(file, {
        maxBytes: PREVIEW_MAX_BYTES,
        mime: ["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav"],
        extensions: ["mp3", "wav"],
        label: "Preview file",
      });

      if (error) {
        toast.error(error);
        return;
      }
    }

    if (key === "packageZipFile" || key === "stemsZipFile") {
      const error = validateGenericFile(file, {
        maxBytes: ZIP_MAX_BYTES,
        mime: ["application/zip", "application/x-zip-compressed", "application/octet-stream"],
        extensions: ["zip"],
        label: key === "packageZipFile" ? "Package ZIP" : "Stems ZIP",
      });

      if (error) {
        toast.error(error);
        return;
      }
    }

    if (key === "fullWavFile") {
      const error = validateGenericFile(file, {
        maxBytes: AUDIO_MAX_BYTES,
        mime: ["audio/wav", "audio/x-wav", "audio/aiff", "audio/x-aiff"],
        extensions: ["wav", "aif", "aiff"],
        label: "Full WAV/AIFF",
      });

      if (error) {
        toast.error(error);
        return;
      }
    }

    if (key === "fullMp3File") {
      const error = validateGenericFile(file, {
        maxBytes: AUDIO_MAX_BYTES,
        mime: ["audio/mpeg", "audio/mp3"],
        extensions: ["mp3"],
        label: "Full MP3",
      });

      if (error) {
        toast.error(error);
        return;
      }
    }

    if (key === "midiFile") {
      const error = validateGenericFile(file, {
        maxBytes: 10 * 1024 * 1024,
        mime: ["audio/midi", "audio/x-midi", "application/octet-stream"],
        extensions: ["mid", "midi"],
        label: "MIDI",
      });

      if (error) {
        toast.error(error);
        return;
      }
    }

    setFiles((current) => ({ ...current, [key]: file }));
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim()) {
      toast.error("Track title is required.");
      return;
    }

    if (!description.trim()) {
      toast.error("Track description is required.");
      return;
    }

    if (!agreed) {
      toast.error("Please accept terms before submitting.");
      return;
    }

    if (!hasRequiredCoreFiles) {
      toast.error("Artwork and preview are required.");
      return;
    }

    if (!hasFullSongFile) {
      toast.error("Full song file is required (WAV or MP3).");
      return;
    }

    if (!producerId) {
      toast.error("Please select producer.");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      toast.error("Supabase client is unavailable.");
      return;
    }

    setIsSubmitting(true);

    const uploadEntries = (Object.entries(files) as Array<[keyof UploadFileState, File | null]>).filter(
      (entry): entry is [keyof UploadFileState, File] => Boolean(entry[1]),
    );

    const signResponse = await fetch("/api/admin/upload-track", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: title.trim(),
        files: uploadEntries.map(([field, file]) => ({
          field,
          fileName: file.name,
          contentType: file.type,
          sizeBytes: file.size,
        })),
      }),
    });

    const signPayload = (await signResponse.json().catch(() => null)) as
      | {
          ok?: boolean;
          uploads?: Partial<Record<keyof UploadFileState, { path: string; token: string; publicUrl: string }>>;
          error?: string;
        }
      | null;

    if (!signResponse.ok || !signPayload?.uploads) {
      const errorMessage = signPayload?.error ?? (await extractApiError(signResponse)) ?? "Could not prepare file upload.";
      setIsSubmitting(false);
      toast.error(errorMessage);
      if (signResponse.status === 401 || signResponse.status === 403) {
        router.push("/auth/sign-in");
      }
      return;
    }

    const uploadedPaths: Partial<Record<keyof UploadFileState, string>> = {};

    for (const [field, file] of uploadEntries) {
      const target = signPayload.uploads[field];
      if (!target) {
        setIsSubmitting(false);
        toast.error(`Missing signed upload target for ${field}.`);
        return;
      }

      const { error } = await supabase.storage
        .from("track-files")
        .uploadToSignedUrl(target.path, target.token, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || undefined,
        });

      if (error) {
        setIsSubmitting(false);
        toast.error(`${field} upload failed: ${error.message}`);
        return;
      }

      uploadedPaths[field] = target.path;
    }

    const finalizeResponse = await fetch("/api/admin/upload-track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: title.trim(),
        producerId,
        genre: genre.trim(),
        bpm,
        musicalKey: musicalKey.trim(),
        mood: mood.trim(),
        description: description.trim(),
        price,
        durationSeconds,
        tags: tags.trim(),
        exclusiveSale,
        hasStems: selectedDeliverables.includes("Stems"),
        hasMidi: selectedDeliverables.includes("MIDI"),
        hasMaster: selectedDeliverables.includes("Master") || selectedDeliverables.includes("WAV"),
        hasUnmastered: selectedDeliverables.includes("Unmastered"),
        hasExtendedMix: selectedDeliverables.includes("Extended Mix"),
        hasRadioEdit: selectedDeliverables.includes("Radio Edit"),
        uploadedPaths,
      }),
    });

    const payload = (await finalizeResponse.json().catch(() => null)) as
      | { ok?: boolean; slug?: string; warning?: string; error?: string }
      | null;

    setIsSubmitting(false);

    if (!finalizeResponse.ok || !payload) {
      const errorMessage = payload?.error ?? (await extractApiError(finalizeResponse)) ?? "Upload failed.";
      toast.error(errorMessage);
      if (finalizeResponse.status === 401 || finalizeResponse.status === 403) {
        router.push("/auth/sign-in");
      }
      return;
    }

    if (payload.warning) {
      toast.warning(payload.warning);
    } else {
      toast.success("Track uploaded successfully.");
    }

    setTitle("");
    setDescription("");
    setTags("Festival, Cinematic, Peak-time");
    setFiles(initialFiles);
    setSelectedDeliverables(["WAV", "Stems", "Master"]);
    setExclusiveSale(true);
    setAgreed(false);

    if (payload.slug) {
      router.push(`/tracks/${payload.slug}`);
      router.refresh();
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {!isWritable ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Upload is disabled until Supabase admin environment is configured.
        </div>
      ) : null}

      {producers.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
          No active producers found. Create or restore producers in{" "}
          <Link href="/admin" className="underline">
            Admin Team Controls
          </Link>
          .
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2">
        <Field label="Track title" required>
          <Input placeholder="e.g. Aurora Protocol" required value={title} onChange={(event) => setTitle(event.target.value)} />
        </Field>

        <Field label="Producer" required>
          <select
            value={producerId}
            onChange={(event) => setProducerId(event.target.value)}
            className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
            disabled={producerSelectDisabled}
            required
          >
            {isLoadingProducers ? <option>Loading producers...</option> : null}
            {!isLoadingProducers && producers.length === 0 ? <option>No producers available</option> : null}
            {producers.map((producer) => (
              <option key={producer.id} value={producer.id}>
                {producer.artistName}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Genre" required>
          <select
            value={genre}
            onChange={(event) => setGenre(event.target.value)}
            className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
            required
          >
            {genreOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>

        <Field label="BPM" required>
          <Input type="number" min={60} max={220} required value={bpm} onChange={(event) => setBpm(Number(event.target.value))} />
        </Field>

        <Field label="Musical key" required>
          <select
            value={musicalKey}
            onChange={(event) => setMusicalKey(event.target.value)}
            className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
            required
          >
            {keyOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Mood" required>
          <select
            value={mood}
            onChange={(event) => setMood(event.target.value)}
            className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
            required
          >
            {moodOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Price (USD)" required>
          <Input type="number" min={1} required value={price} onChange={(event) => setPrice(Number(event.target.value))} />
        </Field>

        <Field label="Duration (seconds)">
          <Input
            type="number"
            min={30}
            value={durationSeconds}
            onChange={(event) => setDurationSeconds(Number(event.target.value))}
          />
        </Field>
      </section>

      <Field label="Tags (comma separated)">
        <Input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="Festival, Cinematic, Peak-time" />
      </Field>

      <Field label="Description" required>
        <Textarea
          required
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Describe arrangement highlights, drop energy, and intended use context."
        />
      </Field>

      <section className="space-y-3 rounded-3xl border border-zinc-200 bg-zinc-50 p-5">
        <p className="text-sm font-semibold text-zinc-900">Included files</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {deliverables.map((item) => (
            <Checkbox
              key={item}
              checked={selectedDeliverables.includes(item)}
              onChange={() => toggleDeliverable(item)}
              label={item}
            />
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="md:col-span-2 xl:col-span-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs text-zinc-700">
          Required uploads: <span className="font-semibold">Artwork</span>, <span className="font-semibold">Preview</span>, and{" "}
          <span className="font-semibold">Full Song (WAV or MP3)</span>. Package ZIP is optional.
        </div>

        <UploadDropzone
          title="Artwork"
          required
          hint="JPG/PNG/WEBP · up to 2MB"
          file={files.artworkFile}
          accept=".jpg,.jpeg,.png,.webp"
          onFileChange={(file) => onFileChange("artworkFile", file)}
        />

        <UploadDropzone
          title="Preview"
          required
          hint="MP3/WAV · up to 20MB"
          file={files.previewFile}
          accept=".mp3,.wav"
          onFileChange={(file) => onFileChange("previewFile", file)}
        />

        <UploadDropzone
          title="Main Package ZIP"
          hint="Optional bundle with delivery assets · up to 50MB"
          file={files.packageZipFile}
          accept=".zip"
          onFileChange={(file) => onFileChange("packageZipFile", file)}
        />

        <UploadDropzone
          title="Full WAV/AIFF"
          hint="Required if Full MP3 is not provided · up to 50MB"
          file={files.fullWavFile}
          accept=".wav,.aif,.aiff"
          onFileChange={(file) => onFileChange("fullWavFile", file)}
        />

        <UploadDropzone
          title="Full MP3"
          hint="Required if Full WAV is not provided · up to 50MB"
          file={files.fullMp3File}
          accept=".mp3"
          onFileChange={(file) => onFileChange("fullMp3File", file)}
        />

        <UploadDropzone
          title="Stems ZIP / MIDI"
          hint="Optional stems ZIP · up to 50MB"
          file={files.stemsZipFile}
          accept=".zip"
          onFileChange={(file) => onFileChange("stemsZipFile", file)}
        />

        <UploadDropzone
          title="MIDI File"
          hint="Optional .mid / .midi"
          file={files.midiFile}
          accept=".mid,.midi"
          onFileChange={(file) => onFileChange("midiFile", file)}
        />
      </section>

      <section className="grid gap-3 rounded-3xl border border-zinc-200 bg-white p-5 sm:grid-cols-2">
        <Checkbox checked={exclusiveSale} onChange={setExclusiveSale} label="Exclusive one-time sale" />
        <Checkbox checked={agreed} onChange={setAgreed} label="I agree to upload and licensing terms" />
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={submitDisabled}>
          {isSubmitting ? "Uploading..." : "Upload Track"}
        </Button>
        <p className="text-xs text-zinc-500">{submissionHint}</p>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-zinc-700">
        {label}
        {required ? <span className="ml-1 text-indigo-600">*</span> : null}
      </span>
      {children}
    </label>
  );
}

function UploadDropzone({
  title,
  hint,
  required = false,
  accept,
  file,
  onFileChange,
}: {
  title: string;
  hint: string;
  required?: boolean;
  accept: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <label
      className={`group flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed bg-white p-6 text-center transition hover:border-indigo-300 hover:bg-indigo-50/40 ${
        isDragging ? "border-indigo-400 bg-indigo-50/50" : "border-zinc-300"
      }`}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        setIsDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        const droppedFile = event.dataTransfer.files?.[0] ?? null;
        onFileChange(droppedFile);
      }}
    >
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 group-hover:bg-indigo-100 group-hover:text-indigo-600">
        <UploadCloud className="h-5 w-5" />
      </span>
      <span className="mt-3 text-sm font-semibold text-zinc-900">
        {title}
        {required ? <span className="ml-1 text-indigo-600">*</span> : null}
      </span>
      <span className="mt-1 text-xs text-zinc-500">{hint}</span>
      <span className="mt-2 line-clamp-1 text-xs font-medium text-zinc-700">{file ? file.name : "Choose file"}</span>
      <span className="mt-1 text-[11px] text-zinc-500">Drag file here or click to upload</span>
      {file ? (
        <button
          type="button"
          className="mt-3 rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 hover:border-zinc-300"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onFileChange(null);
          }}
        >
          Remove file
        </button>
      ) : null}
      <input
        type="file"
        className="sr-only"
        accept={accept}
        onChange={(event) => {
          const pickedFile = event.target.files?.[0] ?? null;
          onFileChange(pickedFile);
        }}
      />
    </label>
  );
}
