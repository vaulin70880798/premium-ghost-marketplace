import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";

import { TrackDetailClient } from "@/components/tracks/track-detail-client";
import { producers, profiles } from "@/data/seed";
import { trackRepository } from "@/lib/supabase/repositories";

export default async function TrackDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const track = await trackRepository.getBySlug(slug);

  if (!track) {
    notFound();
  }

  const allTracks = await trackRepository.list();
  const similarTracks = allTracks
    .filter((item) => item.id !== track.id && item.genre === track.genre && item.exclusivityStatus === "available")
    .slice(0, 3);

  const producerName =
    producers
      .map((producer) => {
        const profile = profiles.find((item) => item.id === producer.profileId);
        return [producer.id, profile?.displayName ?? producer.artistName] as const;
      })
      .find(([id]) => id === track.producerId)?.[1] ?? "Verified Producer";

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-sm text-zinc-500">
        <Link href="/tracks" className="hover:text-zinc-900">
          Tracks
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-zinc-900">{track.title}</span>
      </nav>

      <TrackDetailClient track={track} producerName={producerName} similarTracks={similarTracks} />
    </div>
  );
}
