"use client";

import Link from "next/link";
import { Heart, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { useAppState } from "@/components/providers/app-provider";
import { AudioPreview } from "@/components/tracks/audio-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { genreArtworkTones } from "@/lib/constants";
import { cn, formatCurrency, formatDuration } from "@/lib/utils";
import type { Track } from "@/types/domain";

export function TrackDetailClient({
  track,
  producerName,
  similarTracks,
}: {
  track: Track;
  producerName: string;
  similarTracks: Track[];
}) {
  const { isFavorite, toggleFavorite } = useAppState();
  const favorited = isFavorite(track.id);
  const artworkUrl = track.artworkUrl?.trim() ?? "";
  const hasArtwork = artworkUrl.length > 0;
  const artworkBackground = hasArtwork
    ? {
        backgroundImage: `url("${artworkUrl.replace(/"/g, '\\"')}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : undefined;

  const includedFiles = [
    { label: "WAV", included: true },
    { label: "Stems", included: track.hasStems },
    { label: "MIDI", included: track.hasMidi },
    { label: "Master", included: track.hasMaster },
    { label: "Unmastered", included: track.hasUnmastered },
    { label: "Extended Mix", included: track.hasExtendedMix },
    { label: "Radio Edit", included: track.hasRadioEdit },
  ];

  return (
    <div className="space-y-10">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5 rounded-3xl border border-zinc-200 bg-white p-6 shadow-[0_20px_60px_rgba(12,20,38,0.06)]">
          <div
            className={cn(
              "relative h-72 rounded-3xl bg-gradient-to-br",
              hasArtwork ? "bg-zinc-900" : genreArtworkTones[track.genre],
            )}
            style={artworkBackground}
          >
            <div className="absolute bottom-6 left-6 space-y-1">
              <p className={cn("text-xs uppercase tracking-[0.18em]", hasArtwork ? "text-white/80" : "text-zinc-500")}>
                Exclusive Release
              </p>
              <h1 className={cn("text-4xl font-semibold tracking-tight", hasArtwork ? "text-white" : "text-zinc-900")}>{track.title}</h1>
              <p className={cn("text-sm", hasArtwork ? "text-white/90" : "text-zinc-600")}>Produced by {producerName}</p>
            </div>
          </div>

          <AudioPreview previewUrl={track.previewUrl} duration={track.durationSeconds} variant="full" />

          <p className="text-sm leading-relaxed text-zinc-600">{track.description}</p>

          <div className="grid gap-3 sm:grid-cols-3">
            <MetadataItem label="BPM" value={String(track.bpm)} />
            <MetadataItem label="Key" value={track.musicalKey} />
            <MetadataItem label="Genre" value={track.genre} />
            <MetadataItem label="Mood" value={track.mood} />
            <MetadataItem label="Length" value={formatDuration(track.durationSeconds)} />
            <MetadataItem label="Status" value={track.exclusivityStatus === "available" ? "Available" : "Sold"} />
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-[0_20px_60px_rgba(12,20,38,0.06)]">
            <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Price</p>
            <p className="mt-1 text-4xl font-semibold text-zinc-950">{formatCurrency(track.price)}</p>
            <p className="mt-2 text-sm text-zinc-600">One-time purchase. Track is permanently removed after sale.</p>

            <div className="mt-5 flex gap-2">
              <Button asChild className="flex-1" disabled={track.exclusivityStatus === "sold"}>
                <Link href={`/checkout/${track.id}`}>{track.exclusivityStatus === "sold" ? "Already Sold" : "Buy Exclusive"}</Link>
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  toggleFavorite(track.id);
                  toast.success(favorited ? "Removed from favorites" : "Saved to favorites");
                }}
              >
                <Heart className={cn("h-4 w-4", favorited && "fill-zinc-900 text-zinc-900")} />
              </Button>
            </div>

            <div className="mt-5 rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-600">
              <div className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 text-indigo-600" />
                <p>
                  Rights transfer is included in checkout confirmation. You receive full commercial rights and
                  distribution authority.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-[0_20px_60px_rgba(12,20,38,0.06)]">
            <p className="text-sm font-semibold text-zinc-900">Included Files</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {includedFiles.map((item) => (
                <Badge key={item.label} className={item.included ? "" : "opacity-50"}>
                  {item.label}
                </Badge>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-zinc-950">Similar Available Tracks</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {similarTracks.length === 0 ? (
            <p className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">No similar tracks found.</p>
          ) : (
            similarTracks.map((item) => (
              <Link
                key={item.id}
                href={`/tracks/${item.slug}`}
                className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-[0_10px_40px_rgba(12,20,38,0.06)] transition hover:-translate-y-0.5"
              >
                <div
                  className={cn(
                    "mb-3 h-28 rounded-2xl bg-gradient-to-br",
                    item.artworkUrl?.trim() ? "bg-zinc-900" : genreArtworkTones[item.genre],
                  )}
                  style={
                    item.artworkUrl?.trim()
                      ? {
                          backgroundImage: `url("${item.artworkUrl.trim().replace(/"/g, '\\"')}")`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                      : undefined
                  }
                />
                <p className="text-sm text-zinc-500">{item.genre}</p>
                <p className="mt-1 text-lg font-semibold text-zinc-900">{item.title}</p>
                <p className="mt-2 text-sm text-zinc-600">
                  {item.bpm} BPM · {item.musicalKey}
                </p>
                <p className="mt-3 text-sm font-semibold text-zinc-900">{formatCurrency(item.price)}</p>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function MetadataItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
      <p className="text-[11px] uppercase tracking-[0.14em] text-zinc-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-zinc-900">{value}</p>
    </div>
  );
}
