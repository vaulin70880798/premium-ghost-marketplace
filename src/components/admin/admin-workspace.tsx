"use client";

import { useState } from "react";
import Link from "next/link";

import { CreateProducerForm } from "@/components/admin/create-producer-form";
import { ManageTracksPanel } from "@/components/admin/manage-tracks-panel";
import { ManageTeamPanel } from "@/components/admin/manage-team-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AdminPanel = "upload" | "tracks" | "add-member" | "edit-team" | null;

const actions: Array<{ id: Exclude<AdminPanel, null>; label: string }> = [
  { id: "upload", label: "Upload New Song" },
  { id: "tracks", label: "Manage Existing Songs" },
  { id: "add-member", label: "Add Producer / Team Member" },
  { id: "edit-team", label: "Edit Team Access" },
];

export function AdminWorkspace() {
  const [activePanel, setActivePanel] = useState<AdminPanel>(null);

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-zinc-200 bg-white p-7 shadow-[0_24px_70px_rgba(12,20,38,0.08)]">
        <Badge>Admin Studio</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">Upload New Song</h1>
        <p className="mt-2 text-sm text-zinc-600">Choose one action below. Panels open only after you click a button.</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {actions.map((action) => (
            <Button
              key={action.id}
              type="button"
              variant={activePanel === action.id ? "default" : "outline"}
              className={cn("justify-start", activePanel === action.id ? "shadow-sm" : "")}
              onClick={() => setActivePanel(action.id)}
            >
              {action.label}
            </Button>
          ))}
        </div>
      </section>

      {activePanel === "upload" ? (
        <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-[0_16px_48px_rgba(12,20,38,0.06)]">
          <h2 className="text-lg font-semibold text-zinc-900">Upload New Song</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Open the full upload studio for artwork, audio preview, package ZIP, and delivery file setup.
          </p>
          <div className="mt-4">
            <Button asChild>
              <Link href="/upload" prefetch={false}>
                Open Upload Studio
              </Link>
            </Button>
          </div>
        </section>
      ) : null}

      {activePanel === "tracks" ? <ManageTracksPanel /> : null}
      {activePanel === "add-member" ? <CreateProducerForm /> : null}
      {activePanel === "edit-team" ? <ManageTeamPanel /> : null}
    </div>
  );
}
