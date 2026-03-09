import Link from "next/link";

import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { producers, profiles, tracks } from "@/data/seed";

export default function ProducersPage() {
  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Producers"
        title="Verified Ghost Producers"
        description="Explore experienced studio partners with proven sales, ratings, and response times."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {producers.map((producer) => {
          const profile = profiles.find((item) => item.id === producer.profileId);
          const listings = tracks.filter((track) => track.producerId === producer.id).length;

          return (
            <article key={producer.id} className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-[0_16px_48px_rgba(12,20,38,0.06)]">
              <h2 className="text-xl font-semibold text-zinc-950">{producer.artistName}</h2>
              <p className="mt-1 text-sm text-zinc-600">{profile?.bio}</p>
              <p className="mt-3 text-sm text-zinc-500">{profile?.country}</p>
              <div className="mt-4 space-y-1 text-sm text-zinc-600">
                <p>Genres: {producer.genres.join(" · ")}</p>
                <p>{listings} active listings</p>
                <p>{producer.totalSales} total sales</p>
                <p>Response time {producer.responseTime}</p>
              </div>
            </article>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <Link href="/tracks">Browse Tracks</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/services">Request Custom Production</Link>
        </Button>
      </div>
    </div>
  );
}
