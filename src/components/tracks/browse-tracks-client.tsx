"use client";

import { AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeading } from "@/components/shared/section-heading";
import { TrackCard } from "@/components/tracks/track-card";
import { TrackFilters } from "@/components/tracks/track-filters";
import { defaultBrowseFilters, filterTracks } from "@/data/queries";
import type { BrowseFilters, Genre, Mood, MusicalKey, Track } from "@/types/domain";

interface BrowseTracksClientProps {
  tracks: Track[];
  producerById: Record<string, string>;
  filterCollections: {
    genres: Genre[];
    moods: Mood[];
    musicalKeys: MusicalKey[];
  };
}

export function BrowseTracksClient({ tracks, producerById, filterCollections }: BrowseTracksClientProps) {
  const [filters, setFilters] = useState<BrowseFilters>(defaultBrowseFilters);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredTracks = useMemo(() => filterTracks(filters, tracks), [filters, tracks]);

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Marketplace"
        title="Browse Exclusive Tracks"
        description="Search, filter, and secure one-of-one productions with instant rights transfer after checkout."
      />

      <TrackFilters
        filters={filters}
        genres={filterCollections.genres}
        moods={filterCollections.moods}
        keys={filterCollections.musicalKeys}
        onFiltersChange={setFilters}
        onReset={() => setFilters(defaultBrowseFilters)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-600">
          Showing <span className="font-semibold text-zinc-900">{filteredTracks.length}</span> results
        </p>
      </div>

      {filteredTracks.length === 0 ? (
        <EmptyState
          title="No tracks match this filter set"
          description="Adjust genre, mood, BPM, or price filters to discover more available exclusives."
          ctaLabel="Reset Filters"
          ctaHref="/tracks"
        />
      ) : (
        <AnimatePresence mode="popLayout">
          <div className={viewMode === "grid" ? "grid gap-5 sm:grid-cols-2 xl:grid-cols-3" : "space-y-4"}>
            {filteredTracks.map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                producerName={producerById[track.producerId] ?? "Unknown Producer"}
                mode={viewMode}
              />
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
