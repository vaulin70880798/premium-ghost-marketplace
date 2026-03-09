"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/utils";

const DEFAULT_PREVIEW_LENGTH = 30;

export function AudioPreview({
  previewUrl,
  duration,
  variant = "compact",
}: {
  previewUrl: string;
  duration: number;
  variant?: "compact" | "full";
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [previewLength, setPreviewLength] = useState(DEFAULT_PREVIEW_LENGTH);

  useEffect(() => {
    const audio = new Audio(previewUrl);
    audio.preload = "metadata";
    audioRef.current = audio;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const onLoadedMetadata = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setPreviewLength(Math.floor(audio.duration));
      } else {
        setPreviewLength(DEFAULT_PREVIEW_LENGTH);
      }
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);

    return () => {
      audio.pause();
      audio.currentTime = 0;
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audioRef.current = null;
      setIsPlaying(false);
      setCurrentTime(0);
      setPreviewLength(DEFAULT_PREVIEW_LENGTH);
    };
  }, [previewUrl]);

  const progressWidth = useMemo(() => {
    if (!previewLength) {
      return "0%";
    }

    return `${Math.min((currentTime / previewLength) * 100, 100)}%`;
  }, [currentTime, previewLength]);

  const onToggle = async () => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (isPlaying) {
      audio.pause();
      return;
    }

    try {
      await audio.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <Button variant="outline" size={variant === "full" ? "default" : "sm"} className="rounded-full" onClick={onToggle}>
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          <span className="ml-1">{isPlaying ? "Pause" : "Preview"}</span>
        </Button>
        <p className="text-xs text-zinc-500">
          {formatDuration(Math.floor(currentTime))} / {formatDuration(previewLength)} · full length{" "}
          {formatDuration(duration)}
        </p>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-zinc-200">
        <div className="absolute inset-y-0 left-0 rounded-full bg-indigo-500 transition-all" style={{ width: progressWidth }} />
      </div>
    </div>
  );
}
