import Link from "next/link";
import { Download, MessageSquare, Music2, Package, Star } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Order, ServiceRequest, Track } from "@/types/domain";

interface BuyerDashboardProps {
  accountName: string;
  totalSpent: number;
  activeOrders: number;
  purchasedTracks: Track[];
  recentOrders: Order[];
  serviceRequests: ServiceRequest[];
}

export function BuyerDashboard({
  accountName,
  totalSpent,
  activeOrders,
  purchasedTracks,
  recentOrders,
  serviceRequests,
}: BuyerDashboardProps) {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-[0_20px_60px_rgba(12,20,38,0.06)]">
        <p className="text-sm text-zinc-500">Buyer Dashboard</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">Welcome back, {accountName}</h1>
        <p className="mt-2 text-sm text-zinc-600">Manage orders, downloads, saved tracks, and custom service requests.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Stat label="Active orders" value={String(activeOrders)} icon={<Package className="h-4 w-4" />} />
          <Stat label="Total spent" value={formatCurrency(totalSpent)} icon={<Music2 className="h-4 w-4" />} />
          <Stat label="Open services" value={String(serviceRequests.length)} icon={<Star className="h-4 w-4" />} />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-[0_20px_60px_rgba(12,20,38,0.06)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900">Downloads</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/tracks">Buy more tracks</Link>
            </Button>
          </div>

          {purchasedTracks.length === 0 ? (
            <EmptyState
              title="No purchased tracks yet"
              description="Your secured tracks will appear here with instant download access."
              ctaLabel="Browse Tracks"
              ctaHref="/tracks"
            />
          ) : (
            <div className="space-y-3">
              {purchasedTracks.map((track) => (
                <div key={track.id} className="flex items-center justify-between rounded-2xl border border-zinc-200 p-3">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">{track.title}</p>
                    <p className="text-xs text-zinc-500">{track.genre}</p>
                  </div>
                  <Button size="sm" variant="outline">
                    <Download className="mr-1 h-4 w-4" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-[0_20px_60px_rgba(12,20,38,0.06)]">
          <h2 className="text-lg font-semibold text-zinc-900">Recent Orders</h2>
          <div className="mt-4 space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="rounded-2xl border border-zinc-200 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-zinc-900">Order {order.id}</p>
                  <Badge>{order.status}</Badge>
                </div>
                <p className="mt-2 text-xs text-zinc-500">{formatDate(order.createdAt)}</p>
                <p className="mt-2 text-sm font-medium text-zinc-900">{formatCurrency(order.total)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-[0_20px_60px_rgba(12,20,38,0.06)]">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">Custom Service Requests</h2>
          <Button asChild variant="outline" size="sm">
            <Link href="/services">New Request</Link>
          </Button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {serviceRequests.map((request) => (
            <article key={request.id} className="rounded-2xl border border-zinc-200 p-4">
              <p className="text-sm font-semibold text-zinc-900">{request.service}</p>
              <p className="mt-1 text-xs text-zinc-500">{request.genre} · {request.budgetRange}</p>
              <p className="mt-2 text-sm text-zinc-600">{request.notes}</p>
              <div className="mt-3 flex items-center justify-between">
                <Badge>{request.status}</Badge>
                <button className="inline-flex items-center gap-1 text-xs text-zinc-500">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Messages (soon)
                </button>
              </div>
            </article>
          ))}
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
