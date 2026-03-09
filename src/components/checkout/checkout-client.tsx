"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { Track } from "@/types/domain";

export function CheckoutClient({ track }: { track: Track }) {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-5 rounded-3xl border border-zinc-200 bg-white p-6 shadow-[0_24px_80px_rgba(12,20,38,0.08)]">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">Secure Checkout</h1>
        <p className="text-sm text-zinc-600">Checkout is shown as premium UI only. Payments are not enabled in this phase.</p>

        <div className="rounded-2xl border border-zinc-200 p-4">
          <p className="text-sm font-semibold text-zinc-900">Payment method</p>
          <p className="mt-1 text-xs text-zinc-500">Placeholder only. Stripe flow will be connected in a later phase.</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <input className="h-11 rounded-2xl border border-zinc-200 px-3 text-sm" placeholder="Cardholder name" disabled />
            <input className="h-11 rounded-2xl border border-zinc-200 px-3 text-sm" placeholder="Card number" disabled />
            <input className="h-11 rounded-2xl border border-zinc-200 px-3 text-sm" placeholder="MM / YY" disabled />
            <input className="h-11 rounded-2xl border border-zinc-200 px-3 text-sm" placeholder="CVC" disabled />
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
          <div className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-4 w-4 text-indigo-600" />
            <p>
              By completing this order, ownership rights transfer to you and this track is delisted from future sales.
            </p>
          </div>
        </div>
      </div>

      <aside className="space-y-4 rounded-3xl border border-zinc-200 bg-white p-5 shadow-[0_24px_80px_rgba(12,20,38,0.08)]">
        <h2 className="text-lg font-semibold text-zinc-900">Order Summary</h2>
        <div className="rounded-2xl border border-zinc-200 p-4">
          <p className="text-sm font-semibold text-zinc-900">{track.title}</p>
          <p className="mt-1 text-xs text-zinc-500">
            {track.genre} · {track.bpm} BPM · {track.musicalKey}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge>WAV</Badge>
            {track.hasStems ? <Badge>Stems</Badge> : null}
            {track.hasMidi ? <Badge>MIDI</Badge> : null}
            {track.hasMaster ? <Badge>Master</Badge> : null}
          </div>
        </div>

        <div className="rounded-2xl bg-zinc-50 p-4 text-sm">
          <div className="flex items-center justify-between text-zinc-600">
            <span>Track price</span>
            <span>{formatCurrency(track.price)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-zinc-600">
            <span>Platform fee</span>
            <span>$0</span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-zinc-200 pt-3 font-semibold text-zinc-900">
            <span>Total</span>
            <span>{formatCurrency(track.price)}</span>
          </div>
        </div>

        <Button disabled className="w-full">
          Checkout Coming Soon
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href="/tracks">Back to Catalog</Link>
        </Button>
      </aside>
    </section>
  );
}
