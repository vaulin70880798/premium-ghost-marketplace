"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type TeamMember = {
  profileId: string;
  email: string | null;
  role: "producer" | "admin" | "buyer";
  displayName: string;
  artistName: string | null;
  isActive: boolean;
  createdAt: string;
};

type MemberDraft = {
  role: "producer" | "admin";
  artistName: string;
};

export function ManageTeamPanel() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [drafts, setDrafts] = useState<Record<string, MemberDraft>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingId, setIsSavingId] = useState<string | null>(null);

  const loadMembers = async () => {
    setIsLoading(true);
    const response = await fetch("/api/admin/team-members", { method: "GET" });
    const payload = (await response.json().catch(() => null)) as { members?: TeamMember[]; error?: string } | null;
    setIsLoading(false);

    if (!response.ok || !payload) {
      toast.error(payload?.error ?? "Could not load team members.");
      if (response.status === 401 || response.status === 403) {
        window.location.assign("/auth/sign-in");
      }
      return;
    }

    const nextMembers = payload.members ?? [];
    setMembers(nextMembers);
    setDrafts(
      Object.fromEntries(
        nextMembers.map((member) => [
          member.profileId,
          {
            role: member.role === "admin" ? "admin" : "producer",
            artistName: member.artistName ?? member.displayName,
          },
        ]),
      ),
    );
  };

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      const response = await fetch("/api/admin/team-members", { method: "GET" });
      const payload = (await response.json().catch(() => null)) as { members?: TeamMember[]; error?: string } | null;

      if (!mounted) {
        return;
      }

      setIsLoading(false);

      if (!response.ok || !payload) {
        toast.error(payload?.error ?? "Could not load team members.");
        if (response.status === 401 || response.status === 403) {
          window.location.assign("/auth/sign-in");
        }
        return;
      }

      const nextMembers = payload.members ?? [];
      setMembers(nextMembers);
      setDrafts(
        Object.fromEntries(
          nextMembers.map((member) => [
            member.profileId,
            {
              role: member.role === "admin" ? "admin" : "producer",
              artistName: member.artistName ?? member.displayName,
            },
          ]),
        ),
      );
    };

    void initialize();

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

  const saveAccess = async (member: TeamMember) => {
    const draft = drafts[member.profileId];
    if (!draft) {
      return;
    }

    if (draft.role === "producer" && !draft.artistName.trim()) {
      toast.error("Artist name is required for producer role.");
      return;
    }

    setIsSavingId(member.profileId);

    const response = await fetch("/api/admin/team-members", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        profileId: member.profileId,
        role: draft.role,
        artistName: draft.artistName.trim(),
      }),
    });

    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    setIsSavingId(null);

    if (!response.ok) {
      toast.error(payload?.error ?? "Could not save access changes.");
      return;
    }

    toast.success("Access updated.");
    await loadMembers();
  };

  return (
    <section className="space-y-4 rounded-3xl border border-zinc-200 bg-white p-5 shadow-[0_16px_48px_rgba(12,20,38,0.06)]">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900">Edit Team Access</h2>
        <Badge>Admin only</Badge>
      </div>

      <p className="text-sm text-zinc-600">
        Update role permissions and activate or restore existing team members.
      </p>

      {isLoading ? <p className="text-sm text-zinc-500">Loading team members...</p> : null}

      {!isLoading ? (
        <div className="space-y-3">
          {members.length === 0 ? <p className="text-sm text-zinc-500">No team members found.</p> : null}

          {members.map((member) => {
            const draft = drafts[member.profileId];
            return (
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

                {draft ? (
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <label className="space-y-1.5 text-sm">
                      <span className="text-zinc-700">Role</span>
                      <select
                        value={draft.role}
                        onChange={(event) =>
                          setDrafts((current) => ({
                            ...current,
                            [member.profileId]: {
                              ...draft,
                              role: event.target.value === "admin" ? "admin" : "producer",
                            },
                          }))
                        }
                        className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm"
                      >
                        <option value="producer">Producer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </label>

                    <label className="space-y-1.5 text-sm">
                      <span className="text-zinc-700">Artist Name (for producer role)</span>
                      <Input
                        value={draft.artistName}
                        onChange={(event) =>
                          setDrafts((current) => ({
                            ...current,
                            [member.profileId]: {
                              ...draft,
                              artistName: event.target.value,
                            },
                          }))
                        }
                        disabled={draft.role !== "producer"}
                      />
                    </label>
                  </div>
                ) : null}

                <div className="mt-3 flex flex-wrap gap-2">
                  <Button type="button" size="sm" onClick={() => void saveAccess(member)} disabled={isSavingId === member.profileId}>
                    {isSavingId === member.profileId ? "Saving..." : "Save Access"}
                  </Button>

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
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
