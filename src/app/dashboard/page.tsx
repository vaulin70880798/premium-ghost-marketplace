"use client";

import Link from "next/link";

import { useAppState } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/types/domain";

const roleRoutes: Record<UserRole, string> = {
  buyer: "/dashboard/buyer",
  producer: "/dashboard/producer",
  admin: "/admin",
};

export default function DashboardHubPage() {
  const { role, setRole } = useAppState();

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <section className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-[0_24px_70px_rgba(12,20,38,0.08)]">
        <p className="text-sm text-zinc-500">Role-aware access</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">Dashboard Access</h1>
        <p className="mt-2 text-sm text-zinc-600">This MVP supports buyer, producer, and admin role structure.</p>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {(["buyer", "producer", "admin"] as UserRole[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setRole(item)}
              className={`rounded-2xl border p-4 text-left transition ${
                role === item
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300"
              }`}
            >
              <p className="text-sm font-semibold capitalize">{item}</p>
              <p className={`mt-1 text-xs ${role === item ? "text-zinc-300" : "text-zinc-500"}`}>
                View {item} area
              </p>
            </button>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <Button asChild>
            <Link href={roleRoutes[role]}>Open {role} dashboard</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/auth/role">Role Selection Page</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
