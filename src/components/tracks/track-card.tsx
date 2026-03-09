"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Music4 } from "lucide-react";
import { toast } from "sonner";

import { useAppState } from "@/components/providers/app-provider";
import { AudioPreview } from "@/components/tracks/audio-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { genreArtworkTones } from "@/lib/constants";
import { cn, formatCurrency } from "@/lib/utils";
import type { Track } from "@/types/domain";

interface TrackCardProps {
  track: Track;
  producerName: string;
  mode?: "grid" | "list";
}

export function TrackCard({ track, producerName, mode = "grid" }: TrackCardProps) {
  const { isFavorite, toggleFavorite } = useAppState();
  const favorited = isFavorite(track.id);

  const body = (
    <>
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border border-white/70 bg-gradient-to-br p-5",
          genreArtworkTones[track.genre],
          mode === "list" ? "h-full min-h-40" : "h-40",
        )}
      >
        <div className="absolute right-4 top-4 rounded-full bg-white/80 px-2 py-1 text-[10px] font-semibold tracking-wide text-zinc-700">
          {track.genre}
        </div>
        <div className="absolute bottom-4 left-4 flex items-center gap-2 text-zinc-700">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/80">
            <Music4 className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs font-medium text-zinc-700">Exclusive Master</p>
            <p className="text-xs text-zinc-500">{track.bpm} BPM · {track.musicalKey}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-zinc-950">{track.title}</h3>
            <p className="text-sm text-zinc-600">by {producerName}</p>
          </div>
          <p className="text-base font-semibold text-zinc-950">{formatCurrency(track.price)}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {track.tags.slice(0, 2).map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
          <Badge>{track.mood}</Badge>
          {track.hasStems ? <Badge>Stems</Badge> : null}
        </div>

        <AudioPreview previewUrl={track.previewUrl} duration={track.durationSeconds} />

        <div className="flex items-center gap-2">
          <Button asChild className="flex-1">
            <Link href={`/tracks/${track.slug}`}>View Details</Link>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              toggleFavorite(track.id);
              toast.success(favorited ? "Removed from favorites" : "Saved to favorites");
            }}
            aria-label={favorited ? "Remove favorite" : "Save favorite"}
          >
            <Heart className={cn("h-4 w-4", favorited && "fill-zinc-900 text-zinc-900")} />
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn(
        "overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-[0_20px_60px_rgba(12,20,38,0.08)]",
        mode === "list" && "md:grid md:grid-cols-[260px_1fr]",
      )}
    >
      {body}
    </motion.article>
  );
}
