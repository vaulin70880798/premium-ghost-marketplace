"use client";

import { useMemo } from "react";

import { useAppState } from "@/components/providers/app-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeading } from "@/components/shared/section-heading";
import { TrackCard } from "@/components/tracks/track-card";
import { tracks, producers, profiles } from "@/data/seed";

export default function FavoritesPage() {
  const { favorites } = useAppState();

  const producerById = useMemo(
    () =>
      Object.fromEntries(
        producers.map((producer) => {
          const profile = profiles.find((item) => item.id === producer.profileId);
          return [producer.id, profile?.displayName ?? producer.artistName];
        }),
      ),
    [],
  );

  const favoriteTracks = useMemo(() => tracks.filter((track) => favorites.includes(track.id)), [favorites]);

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Saved"
        title="Your Favorite Tracks"
        description="Keep potential releases organized and return to them quickly before exclusives are sold."
      />

      {favoriteTracks.length === 0 ? (
        <EmptyState
          title="No favorites yet"
          description="Save tracks while browsing and build your shortlist for purchase."
          ctaLabel="Browse Tracks"
          ctaHref="/tracks"
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {favoriteTracks.map((track) => (
            <TrackCard key={track.id} track={track} producerName={producerById[track.producerId] ?? "Unknown Producer"} />
          ))}
        </div>
      )}
    </div>
  );
}
