import Link from "next/link";
import { BarChart3, DollarSign, Layers3, MessageCircle, UploadCloud } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { Track } from "@/types/domain";

interface ProducerDashboardProps {
  producerName: string;
  listedTracks: Track[];
  totalSales: number;
  conversionRate: string;
  monthlyEarnings: string;
  sold: number;
  avgResponse: string;
  pendingOrders: number;
}

export function ProducerDashboard({
  producerName,
  listedTracks,
  totalSales,
  conversionRate,
  monthlyEarnings,
  sold,
  avgResponse,
  pendingOrders,
}: ProducerDashboardProps) {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-[0_20px_60px_rgba(12,20,38,0.06)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-zinc-500">Producer Dashboard</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">Studio Workspace · {producerName}</h1>
            <p className="mt-2 text-sm text-zinc-600">Manage catalog, orders, and earnings in one place.</p>
          </div>
          <Button asChild>
            <Link href="/upload">
              <UploadCloud className="mr-2 h-4 w-4" />
              Upload Track
            </Link>
          </Button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Monthly earnings" value={monthlyEarnings} icon={<DollarSign className="h-4 w-4" />} />
          <Stat label="Total sales" value={String(totalSales)} icon={<BarChart3 className="h-4 w-4" />} />
          <Stat label="Conversion rate" value={conversionRate} icon={<Layers3 className="h-4 w-4" />} />
          <Stat label="Pending orders" value={String(pendingOrders)} icon={<MessageCircle className="h-4 w-4" />} />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-[0_20px_60px_rgba(12,20,38,0.06)]">
          <h2 className="text-lg font-semibold text-zinc-900">Track Inventory</h2>
          <div className="mt-4 space-y-3">
            {listedTracks.map((track) => (
              <article key={track.id} className="rounded-2xl border border-zinc-200 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">{track.title}</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {track.genre} · {track.bpm} BPM · {track.musicalKey}
                    </p>
                  </div>
                  <Badge>{track.exclusivityStatus}</Badge>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <p className="text-zinc-500">{track.tags.join(" · ")}</p>
                  <p className="font-semibold text-zinc-900">{formatCurrency(track.price)}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-[0_20px_60px_rgba(12,20,38,0.06)]">
            <h3 className="text-sm font-semibold text-zinc-900">Earnings Summary</h3>
            <ul className="mt-3 space-y-2 text-sm text-zinc-600">
              <li className="flex items-center justify-between">
                <span>Sold exclusives</span>
                <span className="font-semibold text-zinc-900">{sold}</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Avg response time</span>
                <span className="font-semibold text-zinc-900">{avgResponse}</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Withdrawals</span>
                <span className="font-semibold text-zinc-900">Every Friday</span>
              </li>
            </ul>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-[0_20px_60px_rgba(12,20,38,0.06)]">
            <h3 className="text-sm font-semibold text-zinc-900">Messages</h3>
            <p className="mt-2 text-sm text-zinc-600">Client messaging module is prepared as an upcoming feature.</p>
            <Button variant="outline" size="sm" className="mt-4">
              Open Inbox Placeholder
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
      <div className="inline-flex rounded-xl bg-white p-2 text-zinc-600">{icon}</div>
      <p className="mt-3 text-xs uppercase tracking-[0.12em] text-zinc-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-zinc-950">{value}</p>
    </div>
  );
}
