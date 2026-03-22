"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type TeamMember = {
  profileId: string;
  email: string | null;
  role: "producer" | "admin" | "buyer";
  displayName: string;
  artistName: string | null;
  isActive: boolean;
  createdAt: string;
};

export function ManageTeamPanel() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadMembers = async () => {
    setIsLoading(true);
    const response = await fetch("/api/admin/team-members", { method: "GET" });
    const payload = (await response.json().catch(() => null)) as { members?: TeamMember[]; error?: string } | null;
    setIsLoading(false);

    if (!response.ok || !payload) {
      toast.error(payload?.error ?? "Could not load team members.");
      return;
    }

    setMembers(payload.members ?? []);
  };

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      const response = await fetch("/api/admin/team-members", { method: "GET" });
      const payload = (await response.json().catch(() => null)) as { members?: TeamMember[]; error?: string } | null;

      if (!mounted) {
        return;
      }

      setIsLoading(false);

      if (!response.ok || !payload) {
        toast.error(payload?.error ?? "Could not load team members.");
        return;
      }

      setMembers(payload.members ?? []);
    };

    void run();

    return () => {
      mounted = false;
    };
  }, []);

  const toggleMember = async (member: TeamMember) => {
    const response = await fetch("/api/admin/team-members", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        profileId: member.profileId,
        isActive: !member.isActive,
      }),
    });

    const payload = (await response.json().catch(() => null)) as { error?: string } | null;

    if (!response.ok) {
      toast.error(payload?.error ?? "Could not update team member.");
      return;
    }

    toast.success(member.isActive ? "Team member deactivated." : "Team member restored.");
    await loadMembers();
  };

  return (
    <section className="space-y-4 rounded-3xl border border-zinc-200 bg-white p-5 shadow-[0_16px_48px_rgba(12,20,38,0.06)]">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900">Team Controls</h2>
        <Badge>Admin only</Badge>
      </div>

      <p className="text-sm text-zinc-600">
        Disable or restore admins/producers. Disabled accounts are hidden from operations and can be reactivated.
      </p>

      {isLoading ? <p className="text-sm text-zinc-500">Loading team members...</p> : null}

      {!isLoading ? (
        <div className="space-y-3">
          {members.length === 0 ? <p className="text-sm text-zinc-500">No team members found.</p> : null}

          {members.map((member) => (
            <article key={member.profileId} className="rounded-2xl border border-zinc-200 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-zinc-900">{member.displayName}</p>
                  <p className="text-xs text-zinc-500">{member.email ?? "No email"}</p>
                  {member.artistName ? <p className="mt-1 text-xs text-zinc-500">Artist: {member.artistName}</p> : null}
                </div>

                <div className="flex items-center gap-2">
                  <Badge>{member.role}</Badge>
                  <Badge className={member.isActive ? "" : "bg-zinc-100 text-zinc-600"}>{member.isActive ? "active" : "inactive"}</Badge>
                </div>
              </div>

              <div className="mt-3">
                <Button
                  type="button"
                  variant={member.isActive ? "outline" : "default"}
                  size="sm"
                  onClick={() => void toggleMember(member)}
                >
                  {member.isActive ? "Deactivate" : "Restore"}
                </Button>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
