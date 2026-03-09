"use client";

import Link from "next/link";

import { useAppState } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/types/domain";

const roleCopy: Record<UserRole, string> = {
  buyer: "Browse and purchase exclusive tracks with full rights transfer.",
  producer: "Upload premium ghost productions and manage your sales.",
  admin: "Moderate tracks, users, and service requests.",
};

export default function RoleSelectionPage() {
  const { role, setRole } = useAppState();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-[0_24px_70px_rgba(12,20,38,0.08)]">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">Select Your Role</h1>
        <p className="mt-2 text-sm text-zinc-600">You can change this later from dashboard settings.</p>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {(["buyer", "producer", "admin"] as UserRole[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setRole(item)}
              className={`rounded-2xl border p-4 text-left transition ${
                role === item
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-zinc-200 bg-white hover:border-zinc-300"
              }`}
            >
              <p className="text-sm font-semibold capitalize text-zinc-900">{item}</p>
              <p className="mt-2 text-xs text-zinc-600">{roleCopy[item]}</p>
            </button>
          ))}
        </div>

        <div className="mt-6 flex gap-2">
          <Button asChild>
            <Link href="/dashboard">Continue to Dashboard</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/tracks">Browse tracks first</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
