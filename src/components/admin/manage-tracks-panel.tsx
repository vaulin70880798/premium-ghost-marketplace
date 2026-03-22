"use client";

import { Download, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";

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

type TracksResponsePayload = {
  tracks?: AdminTrack[];
  producers?: ProducerOption[];
  writable?: boolean;
  error?: string;
  message?: string;
};

const genreOptions = [
  "Melodic Techno",
  "Tech House",
  "Afro House",
  "Deep House",
  "Progressive House",
  "Drum & Bass",
  "Garage",
  "Other",
];
const moodOptions = ["Euphoric", "Dark", "Hypnotic", "Atmospheric", "Groovy", "Cinematic", "Emotional"];
const keyOptions = [
  "A minor",
  "B minor",
  "C minor",
  "D minor",
  "E minor",
  "F minor",
  "G minor",
  "F# minor",
  "C# minor",
  "D# minor",
  "A major",
  "G major",
];

export function ManageTracksPanel() {
  const [tracks, setTracks] = useState<AdminTrack[]>([]);
  const [producers, setProducers] = useState<ProducerOption[]>([]);
  const [writable, setWritable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [producerId, setProducerId] = useState("");
  const [genre, setGenre] = useState("Melodic Techno");
  const [bpm, setBpm] = useState(124);
  const [musicalKey, setMusicalKey] = useState("A minor");
  const [mood, setMood] = useState("Atmospheric");
  const [price, setPrice] = useState(990);
  const [previewUrl, setPreviewUrl] = useState("");
  const [packageUrl, setPackageUrl] = useState("");

  const applyPayload = (payload: TracksResponsePayload) => {
    if (payload.message) {
      toast.info(payload.message);
    }

    const nextProducers = payload.producers ?? [];
    setTracks(payload.tracks ?? []);
    setProducers(nextProducers);
    setWritable(Boolean(payload.writable));

    if (nextProducers.length > 0) {
      setProducerId((current) => current || nextProducers[0].id);
    }
  };

  const loadData = async () => {
    setIsLoading(true);

    const response = await fetch("/api/admin/tracks", { method: "GET" });
    const payload = (await response.json().catch(() => null)) as TracksResponsePayload | null;

    setIsLoading(false);

    if (!response.ok || !payload) {
      toast.error(payload?.error ?? "Could not load admin tracks.");
      return;
    }

    applyPayload(payload);
  };

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      const response = await fetch("/api/admin/tracks", { method: "GET" });
      const payload = (await response.json().catch(() => null)) as TracksResponsePayload | null;

      if (!isMounted) {
        return;
      }

      setIsLoading(false);

      if (!response.ok || !payload) {
        toast.error(payload?.error ?? "Could not load admin tracks.");
        return;
      }

      applyPayload(payload);
    };

    void initialize();

    return () => {
      isMounted = false;
    };
  }, []);

  const createTrack = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!producerId) {
      toast.error("Please select producer.");
      return;
    }

    setIsSubmitting(true);

    const response = await fetch("/api/admin/tracks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        producerId,
        genre,
        bpm,
        musicalKey,
        mood,
        price,
        previewUrl,
        packageUrl,
        status: "published",
        exclusivityStatus: "available",
        durationSeconds: 180,
      }),
    });

    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    setIsSubmitting(false);

    if (!response.ok) {
      toast.error(payload?.error ?? "Could not create track.");
      return;
    }

    toast.success("Track created.");
    setTitle("");
    setPreviewUrl("");
    setPackageUrl("");
    await loadData();
  };

  const toggleArchivedState = async (track: AdminTrack) => {
    const response =
      track.status === "rejected"
        ? await fetch(`/api/admin/tracks/${track.id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "draft" }),
          })
        : await fetch(`/api/admin/tracks/${track.id}`, { method: "DELETE" });
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;

    if (!response.ok) {
      toast.error(payload?.error ?? "Could not update archive status.");
      return;
    }

    toast.success(track.status === "rejected" ? "Track restored to draft." : "Track archived.");
    await loadData();
  };

  const toggleStatus = async (track: AdminTrack) => {
    const nextStatus = track.status === "published" ? "draft" : "published";

    const response = await fetch(`/api/admin/tracks/${track.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: nextStatus }),
    });

    const payload = (await response.json().catch(() => null)) as { error?: string } | null;

    if (!response.ok) {
      toast.error(payload?.error ?? "Could not update status.");
      return;
    }

    toast.success(`Track moved to ${nextStatus}.`);
    await loadData();
  };

  const toggleExclusivity = async (track: AdminTrack) => {
    const next = track.exclusivityStatus === "available" ? "sold" : "available";

    const response = await fetch(`/api/admin/tracks/${track.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ exclusivityStatus: next }),
    });

    const payload = (await response.json().catch(() => null)) as { error?: string } | null;

    if (!response.ok) {
      toast.error(payload?.error ?? "Could not update exclusivity.");
      return;
    }

    toast.success(`Track marked as ${next}.`);
    await loadData();
  };

  return (
    <section className="space-y-6">
      <form onSubmit={createTrack} className="space-y-4 rounded-3xl border border-zinc-200 bg-white p-5 shadow-[0_16px_48px_rgba(12,20,38,0.06)]">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">Add Track (Admin Only)</h2>
          <Badge>{writable ? "Live DB" : "Read-only demo"}</Badge>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1.5 text-sm">
            <span className="text-zinc-700">Track title</span>
            <Input required value={title} onChange={(event) => setTitle(event.target.value)} disabled={!writable} />
          </label>

          <label className="space-y-1.5 text-sm">
            <span className="text-zinc-700">Producer</span>
            <select
              value={producerId}
              onChange={(event) => setProducerId(event.target.value)}
              disabled={!writable}
              className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm"
            >
              {producers.map((producer) => (
                <option key={producer.id} value={producer.id}>
                  {producer.artistName}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5 text-sm">
            <span className="text-zinc-700">Genre</span>
            <select
              value={genre}
              onChange={(event) => setGenre(event.target.value)}
              disabled={!writable}
              className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm"
            >
              {genreOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5 text-sm">
            <span className="text-zinc-700">Mood</span>
            <select
              value={mood}
              onChange={(event) => setMood(event.target.value)}
              disabled={!writable}
              className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm"
            >
              {moodOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5 text-sm">
            <span className="text-zinc-700">BPM</span>
            <Input type="number" required value={bpm} onChange={(event) => setBpm(Number(event.target.value))} disabled={!writable} />
          </label>

          <label className="space-y-1.5 text-sm">
            <span className="text-zinc-700">Musical key</span>
            <select
              value={musicalKey}
              onChange={(event) => setMusicalKey(event.target.value)}
              disabled={!writable}
              className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm"
            >
              {keyOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5 text-sm">
            <span className="text-zinc-700">Price (USD)</span>
            <Input type="number" required value={price} onChange={(event) => setPrice(Number(event.target.value))} disabled={!writable} />
          </label>

          <label className="space-y-1.5 text-sm">
            <span className="text-zinc-700">Preview URL</span>
            <Input value={previewUrl} onChange={(event) => setPreviewUrl(event.target.value)} disabled={!writable} />
          </label>

          <label className="space-y-1.5 text-sm md:col-span-2">
            <span className="text-zinc-700">Package URL (ZIP / storage link)</span>
            <Input value={packageUrl} onChange={(event) => setPackageUrl(event.target.value)} disabled={!writable} />
          </label>
        </div>

        <Button type="submit" disabled={!writable || isSubmitting}>
          <Plus className="mr-2 h-4 w-4" />
          {isSubmitting ? "Adding..." : "Add Track"}
        </Button>
      </form>

      <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-[0_16px_48px_rgba(12,20,38,0.06)]">
        <h2 className="text-lg font-semibold text-zinc-900">Track Management</h2>

        {isLoading ? <p className="mt-3 text-sm text-zinc-500">Loading tracks...</p> : null}

        {!isLoading ? (
          <div className="mt-4 space-y-3">
            {tracks.map((track) => (
              <article key={track.id} className="rounded-2xl border border-zinc-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">{track.title}</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {track.genre} · {track.bpm} BPM · {track.musicalKey}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">{formatCurrency(track.price)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge>{track.status}</Badge>
                    <Badge>{track.exclusivityStatus}</Badge>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    href={track.previewUrl ?? "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700"
                  >
                    <Download className="mr-1 h-3.5 w-3.5" />
                    Preview
                  </a>

                  <a
                    href={track.packageUrl ?? "#"}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium ${
                      track.packageUrl
                        ? "border-zinc-200 text-zinc-700"
                        : "cursor-not-allowed border-zinc-100 text-zinc-400"
                    }`}
                    onClick={(event) => {
                      if (!track.packageUrl) {
                        event.preventDefault();
                      }
                    }}
                  >
                    <Download className="mr-1 h-3.5 w-3.5" />
                    Package
                  </a>

                  {track.status !== "rejected" ? (
                    <button
                      type="button"
                      onClick={() => void toggleStatus(track)}
                      className="rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700"
                    >
                      {track.status === "published" ? "Move to Draft" : "Publish"}
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => void toggleExclusivity(track)}
                    className="rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700"
                  >
                    {track.exclusivityStatus === "available" ? "Mark Sold" : "Mark Available"}
                  </button>

                  <button
                    type="button"
                    onClick={() => void toggleArchivedState(track)}
                    className="inline-flex items-center rounded-full border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600"
                  >
                    {track.status === "rejected" ? (
                      <RotateCcw className="mr-1 h-3.5 w-3.5" />
                    ) : (
                      <Trash2 className="mr-1 h-3.5 w-3.5" />
                    )}
                    {track.status === "rejected" ? "Restore" : "Archive"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
