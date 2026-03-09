import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";

import { TrackDetailClient } from "@/components/tracks/track-detail-client";
import { getProducerProfile, getSimilarTracks, getTrackBySlug } from "@/data/queries";

export default async function TrackDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const track = getTrackBySlug(slug);

  if (!track) {
    notFound();
  }

  const producerProfile = getProducerProfile(track.producerId);
  const similarTracks = getSimilarTracks(track, 3);

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-sm text-zinc-500">
        <Link href="/tracks" className="hover:text-zinc-900">
          Tracks
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-zinc-900">{track.title}</span>
      </nav>

      <TrackDetailClient
        track={track}
        producerName={producerProfile?.profile.displayName ?? "Unknown Producer"}
        similarTracks={similarTracks}
      />
    </div>
  );
}
