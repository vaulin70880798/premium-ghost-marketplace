"use client";

import { Download, PencilLine, RotateCcw, Save, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  description: string;
  price: number;
  previewUrl: string | null;
  artworkUrl: string | null;
  packageUrl: string | null;
  exclusivityStatus: "available" | "sold";
  status: "draft" | "pending" | "published" | "rejected";
  createdAt: string;
};

type TracksResponsePayload = {
  tracks?: AdminTrack[];
  writable?: boolean;
  error?: string;
  message?: string;
};

type TrackEditForm = {
  title: string;
  genre: string;
  bpm: number;
  musicalKey: string;
  mood: string;
  description: string;
  price: number;
  previewUrl: string;
  packageUrl: string;
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

function toEditForm(track: AdminTrack): TrackEditForm {
  return {
    title: track.title,
    genre: track.genre,
    bpm: track.bpm,
    musicalKey: track.musicalKey,
    mood: track.mood,
    description: track.description ?? "",
    price: track.price,
    previewUrl: track.previewUrl ?? "",
    packageUrl: track.packageUrl ?? "",
  };
}

export function ManageTracksPanel() {
  const [tracks, setTracks] = useState<AdminTrack[]>([]);
  const [writable, setWritable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const [editingTrackId, setEditingTrackId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<TrackEditForm>({
    title: "",
    genre: "Melodic Techno",
    bpm: 124,
    musicalKey: "A minor",
    mood: "Atmospheric",
    description: "",
    price: 990,
    previewUrl: "",
    packageUrl: "",
  });

  const applyPayload = (payload: TracksResponsePayload) => {
    if (payload.message) {
      toast.info(payload.message);
    }

    setTracks(payload.tracks ?? []);
    setWritable(Boolean(payload.writable));
  };

  const loadData = async () => {
    setIsLoading(true);

    const response = await fetch("/api/admin/tracks", { method: "GET" });
    const payload = (await response.json().catch(() => null)) as TracksResponsePayload | null;

    setIsLoading(false);

    if (!response.ok || !payload) {
      toast.error(payload?.error ?? "Could not load admin tracks.");
      if (response.status === 401 || response.status === 403) {
        window.location.assign("/auth/sign-in");
      }
      return;
    }

    applyPayload(payload);
  };

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      const response = await fetch("/api/admin/tracks", { method: "GET" });
      const payload = (await response.json().catch(() => null)) as TracksResponsePayload | null;

      if (!mounted) {
        return;
      }

      setIsLoading(false);

      if (!response.ok || !payload) {
        toast.error(payload?.error ?? "Could not load admin tracks.");
        if (response.status === 401 || response.status === 403) {
          window.location.assign("/auth/sign-in");
        }
        return;
      }

      applyPayload(payload);
    };

    void initialize();

    return () => {
      mounted = false;
    };
  }, []);

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

    if (editingTrackId === track.id) {
      setEditingTrackId(null);
    }

    toast.success(track.status === "rejected" ? "Song restored to draft." : "Song archived.");
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

    toast.success(`Song moved to ${nextStatus}.`);
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

    toast.success(`Song marked as ${next}.`);
    await loadData();
  };

  const startEdit = (track: AdminTrack) => {
    setEditingTrackId(track.id);
    setEditForm(toEditForm(track));
  };

  const cancelEdit = () => {
    setEditingTrackId(null);
  };

  const saveEdit = async (trackId: string) => {
    setIsSavingEdit(true);

    const response = await fetch(`/api/admin/tracks/${trackId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: editForm.title,
        genre: editForm.genre,
        bpm: Number(editForm.bpm),
        musicalKey: editForm.musicalKey,
        mood: editForm.mood,
        description: editForm.description,
        price: Number(editForm.price),
        previewUrl: editForm.previewUrl,
        packageUrl: editForm.packageUrl,
      }),
    });

    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    setIsSavingEdit(false);

    if (!response.ok) {
      toast.error(payload?.error ?? "Could not save song changes.");
      return;
    }

    toast.success("Song updated.");
    setEditingTrackId(null);
    await loadData();
  };

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-[0_16px_48px_rgba(12,20,38,0.06)]">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900">Manage Existing Songs</h2>
        <Badge>{writable ? "Live DB" : "Read-only demo"}</Badge>
      </div>

      <p className="mt-2 text-sm text-zinc-600">Edit metadata, switch availability, publish/draft, and archive or restore songs.</p>

      {isLoading ? <p className="mt-4 text-sm text-zinc-500">Loading songs...</p> : null}

      {!isLoading ? (
        <div className="mt-4 space-y-3">
          {tracks.length === 0 ? <p className="text-sm text-zinc-500">No songs found.</p> : null}

          {tracks.map((track) => {
            const isEditing = editingTrackId === track.id;

            return (
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

                {isEditing ? (
                  <div className="mt-4 space-y-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="space-y-1.5 text-sm">
                        <span className="text-zinc-700">Title</span>
                        <Input
                          value={editForm.title}
                          onChange={(event) => setEditForm((current) => ({ ...current, title: event.target.value }))}
                        />
                      </label>

                      <label className="space-y-1.5 text-sm">
                        <span className="text-zinc-700">Genre</span>
                        <select
                          value={editForm.genre}
                          onChange={(event) => setEditForm((current) => ({ ...current, genre: event.target.value }))}
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
                          value={editForm.mood}
                          onChange={(event) => setEditForm((current) => ({ ...current, mood: event.target.value }))}
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
                        <span className="text-zinc-700">Musical Key</span>
                        <select
                          value={editForm.musicalKey}
                          onChange={(event) =>
                            setEditForm((current) => ({
                              ...current,
                              musicalKey: event.target.value,
                            }))
                          }
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
                        <span className="text-zinc-700">BPM</span>
                        <Input
                          type="number"
                          min={60}
                          max={220}
                          value={editForm.bpm}
                          onChange={(event) =>
                            setEditForm((current) => ({ ...current, bpm: Number(event.target.value) || current.bpm }))
                          }
                        />
                      </label>

                      <label className="space-y-1.5 text-sm">
                        <span className="text-zinc-700">Price (USD)</span>
                        <Input
                          type="number"
                          min={1}
                          value={editForm.price}
                          onChange={(event) =>
                            setEditForm((current) => ({ ...current, price: Number(event.target.value) || current.price }))
                          }
                        />
                      </label>

                      <label className="space-y-1.5 text-sm">
                        <span className="text-zinc-700">Preview URL</span>
                        <Input
                          value={editForm.previewUrl}
                          onChange={(event) => setEditForm((current) => ({ ...current, previewUrl: event.target.value }))}
                        />
                      </label>

                      <label className="space-y-1.5 text-sm">
                        <span className="text-zinc-700">Package URL</span>
                        <Input
                          value={editForm.packageUrl}
                          onChange={(event) => setEditForm((current) => ({ ...current, packageUrl: event.target.value }))}
                        />
                      </label>
                    </div>

                    <label className="space-y-1.5 text-sm">
                      <span className="text-zinc-700">Description</span>
                      <Textarea
                        value={editForm.description}
                        onChange={(event) =>
                          setEditForm((current) => ({
                            ...current,
                            description: event.target.value,
                          }))
                        }
                      />
                    </label>

                    <div className="flex flex-wrap gap-2">
                      <Button type="button" size="sm" onClick={() => void saveEdit(track.id)} disabled={isSavingEdit}>
                        <Save className="mr-1 h-3.5 w-3.5" />
                        {isSavingEdit ? "Saving..." : "Save Changes"}
                      </Button>

                      <Button type="button" variant="outline" size="sm" onClick={cancelEdit}>
                        <X className="mr-1 h-3.5 w-3.5" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    href={track.previewUrl ?? "#"}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium ${
                      track.previewUrl
                        ? "border-zinc-200 text-zinc-700"
                        : "cursor-not-allowed border-zinc-100 text-zinc-400"
                    }`}
                    onClick={(event) => {
                      if (!track.previewUrl) {
                        event.preventDefault();
                      }
                    }}
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

                  <button
                    type="button"
                    onClick={() => startEdit(track)}
                    className="inline-flex items-center rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700"
                  >
                    <PencilLine className="mr-1 h-3.5 w-3.5" />
                    Edit Metadata
                  </button>

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
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
