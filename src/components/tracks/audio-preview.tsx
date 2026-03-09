"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/utils";

const PREVIEW_LENGTH = 30;

export function AudioPreview({
  trackId,
  duration,
  variant = "compact",
}: {
  trackId: string;
  duration: number;
  variant?: "compact" | "full";
}) {
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!playingTrack) {
      return;
    }

    const timer = window.setInterval(() => {
      setProgress((current) => {
        if (current >= PREVIEW_LENGTH) {
          setPlayingTrack(null);
          return 0;
        }

        return current + 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [playingTrack]);

  const isPlaying = playingTrack === trackId;
  const progressWidth = useMemo(() => `${(progress / PREVIEW_LENGTH) * 100}%`, [progress]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size={variant === "full" ? "default" : "sm"}
          className="rounded-full"
          onClick={() => {
            if (isPlaying) {
              setPlayingTrack(null);
              return;
            }

            setProgress(0);
            setPlayingTrack(trackId);
          }}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          <span className="ml-1">{isPlaying ? "Pause" : "Preview"}</span>
        </Button>
        <p className="text-xs text-zinc-500">30 sec preview · full length {formatDuration(duration)}</p>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-zinc-200">
        <div className="absolute inset-y-0 left-0 rounded-full bg-indigo-500 transition-all" style={{ width: progressWidth }} />
      </div>
    </div>
  );
}
