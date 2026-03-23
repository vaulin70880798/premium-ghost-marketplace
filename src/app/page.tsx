import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

import { Reveal } from "@/components/shared/reveal";
import { SectionHeading } from "@/components/shared/section-heading";
import { TrackCard } from "@/components/tracks/track-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  benefitBullets,
  categoryPills,
  producers,
  profiles,
  testimonials,
} from "@/data/seed";
import { getFeaturedTracks, getNewestTracks } from "@/data/queries";
import { genreArtworkTones } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const featuredTracks = getFeaturedTracks(3);
  const newestTracks = getNewestTracks(3);

  const producerNameById = Object.fromEntries(
    producers.map((producer) => {
      const profile = profiles.find((item) => item.id === producer.profileId);
      return [producer.id, profile?.displayName ?? producer.artistName];
    }),
  );

  return (
    <div className="space-y-20 pb-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-zinc-200 bg-white px-6 py-14 shadow-[0_30px_90px_rgba(12,20,38,0.08)] md:px-12 md:py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(79,91,232,0.15),transparent_35%),radial-gradient(circle_at_10%_80%,rgba(161,161,170,0.2),transparent_35%)]" />
        <Reveal className="relative mx-auto max-w-4xl text-center">
          <Badge className="border-indigo-200 bg-indigo-50 text-indigo-700">Premium Ghost Production Marketplace</Badge>
          <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight text-zinc-950 md:text-6xl">
            Exclusive ghost-produced tracks for serious DJs and artists.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base text-zinc-600 md:text-lg">
            Secure one-time rights, receive complete production files, and release with confidence.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/tracks">Browse Tracks</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/services">Order Custom Track</Link>
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {categoryPills.map((pill) => (
              <Badge key={pill}>{pill}</Badge>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Featured"
          title="Hot exclusives this week"
          description="Handpicked catalog with premium production quality and immediate ownership transfer."
        />
        <div className="grid gap-5 lg:grid-cols-3">
          {featuredTracks.map((track, index) => (
            <Reveal key={track.id} delay={index * 0.06}>
              <TrackCard track={track} producerName={producerNameById[track.producerId]} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal>
          <SectionHeading
            eyebrow="Why Ghost Market"
            title="Built for premium releases, not template tracks"
            description="Each listing includes structured file delivery and rights-ready checkout built for professional workflows."
          />
          <ul className="mt-6 space-y-3">
            {benefitBullets.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-zinc-700">
                <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                {item}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal className="grid gap-4 sm:grid-cols-2">
          <HowItWorksStep
            step="01"
            title="Browse Curated Catalog"
            description="Filter by genre, BPM, mood, key, and production package depth."
          />
          <HowItWorksStep
            step="02"
            title="Preview and Compare"
            description="Check quality with controlled previews and transparent metadata."
          />
          <HowItWorksStep
            step="03"
            title="Buy Exclusive Rights"
            description="Complete checkout and lock ownership for one-time use only."
          />
          <HowItWorksStep
            step="04"
            title="Download Full Package"
            description="Get WAV, stems, MIDI, and alternate edits based on included files."
          />
        </Reveal>
      </section>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="New In"
          title="Fresh additions"
          description="Recently uploaded tracks from top-rated producers."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {newestTracks.map((track) => (
            <Link
              key={track.id}
              href={`/tracks/${track.slug}`}
              className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-[0_20px_60px_rgba(12,20,38,0.06)] transition hover:-translate-y-0.5"
            >
              <div
                className={cn(
                  "mb-4 h-32 rounded-2xl bg-gradient-to-br",
                  track.artworkUrl?.trim() ? "bg-zinc-900" : genreArtworkTones[track.genre],
                )}
                style={
                  track.artworkUrl?.trim()
                    ? {
                        backgroundImage: `url("${track.artworkUrl.trim().replace(/"/g, '\\"')}")`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                    : undefined
                }
              />
              <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">{track.genre}</p>
              <h3 className="mt-2 text-xl font-semibold text-zinc-950">{track.title}</h3>
              <p className="mt-1 text-sm text-zinc-600">
                {track.bpm} BPM · {track.musicalKey}
              </p>
              <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-zinc-900">
                Open Track <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Top Producers"
          title="Verified production partners"
          description="Experienced ghost producers trusted by touring artists and label teams."
        />
        <div className="grid gap-4 md:grid-cols-4">
          {producers.map((producer) => {
            const profile = profiles.find((item) => item.id === producer.profileId);
            return (
              <div key={producer.id} className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-[0_16px_48px_rgba(12,20,38,0.05)]">
                <p className="text-lg font-semibold text-zinc-950">{producer.artistName}</p>
                <p className="text-sm text-zinc-600">{profile?.country}</p>
                <p className="mt-2 text-sm text-zinc-500">{producer.genres.join(" · ")}</p>
                <p className="mt-4 text-xs uppercase tracking-[0.12em] text-zinc-500">
                  {producer.totalSales} sales · {producer.responseTime} response
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Testimonials"
          title="Trusted by working artists"
          description="Feedback from buyers using the marketplace in release workflows."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((item) => (
            <article key={item.name} className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-[0_16px_48px_rgba(12,20,38,0.05)]">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <p className="mt-3 text-sm text-zinc-700">&ldquo;{item.quote}&rdquo;</p>
              <p className="mt-4 text-sm font-semibold text-zinc-900">{item.name}</p>
              <p className="text-xs text-zinc-500">{item.role}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-zinc-200 bg-zinc-950 px-8 py-14 text-center text-white shadow-[0_30px_90px_rgba(8,10,20,0.22)]">
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Ready to lock your next exclusive release?</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-zinc-300 md:text-base">
          Start with catalog purchases or submit a custom production brief in under two minutes.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild variant="secondary" size="lg">
            <Link href="/tracks">Browse Tracks</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-zinc-700 bg-transparent text-white hover:bg-zinc-800">
            <Link href="/services">Order Custom Track</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

function HowItWorksStep({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-[0_16px_48px_rgba(12,20,38,0.05)]">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600">Step {step}</p>
      <h3 className="mt-2 text-lg font-semibold text-zinc-900">{title}</h3>
      <p className="mt-2 text-sm text-zinc-600">{description}</p>
    </article>
  );
}
