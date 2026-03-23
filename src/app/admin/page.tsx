import { CreateProducerForm } from "@/components/admin/create-producer-form";
import { ManageTracksPanel } from "@/components/admin/manage-tracks-panel";
import { ManageTeamPanel } from "@/components/admin/manage-team-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/auth/server";
import Link from "next/link";

export default async function AdminPage() {
  await requireRole(["admin"]);

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-zinc-200 bg-white p-7 shadow-[0_24px_70px_rgba(12,20,38,0.08)]">
        <Badge>Admin Studio</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">Upload New Song</h1>
        <p className="mt-2 text-sm text-zinc-600">Catalog operations are visible only for administrator accounts.</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Button asChild className="justify-start">
            <Link href="/upload">Upload New Song</Link>
          </Button>

          <Button asChild variant="outline" className="justify-start">
            <Link href="#manage-existing-songs">Manage Existing Songs</Link>
          </Button>

          <Button asChild variant="outline" className="justify-start">
            <Link href="#add-team-member">Add Producer / Team Member</Link>
          </Button>

          <Button asChild variant="outline" className="justify-start">
            <Link href="#edit-team-access">Edit Team Access</Link>
          </Button>
        </div>
      </section>

      <section id="manage-existing-songs" className="scroll-mt-24">
        <ManageTracksPanel />
      </section>

      <section id="add-team-member" className="scroll-mt-24">
        <CreateProducerForm />
      </section>

      <section id="edit-team-access" className="scroll-mt-24">
        <ManageTeamPanel />
      </section>
    </div>
  );
}
