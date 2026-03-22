import { CreateProducerForm } from "@/components/admin/create-producer-form";
import { ManageTracksPanel } from "@/components/admin/manage-tracks-panel";
import { ManageTeamPanel } from "@/components/admin/manage-team-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/auth/server";

const modules = [
  {
    title: "Users",
    description: "Review buyer and producer account status, verification, and activity.",
    action: "Open user moderation",
  },
  {
    title: "Tracks",
    description: "Moderate uploaded tracks, metadata accuracy, and rights compliance.",
    action: "Open track moderation",
  },
  {
    title: "Orders",
    description: "Inspect payment records, rights transfer events, and download logs.",
    action: "Open order review",
  },
  {
    title: "Service Requests",
    description: "Route custom requests to matching producers and monitor SLA.",
    action: "Open service queue",
  },
  {
    title: "Payouts",
    description: "Track producer payout schedules and invoice readiness.",
    action: "Open payout placeholder",
  },
  {
    title: "Moderation",
    description: "Policy flags, legal checks, and catalog quality operations.",
    action: "Open moderation panel",
  },
];

export default async function AdminPage() {
  await requireRole(["admin"]);

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-zinc-200 bg-white p-7 shadow-[0_24px_70px_rgba(12,20,38,0.08)]">
        <Badge>Admin Control</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">Platform Control Room</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Only admins can access this area and onboard producer accounts.
        </p>
      </section>

      <CreateProducerForm />
      <ManageTeamPanel />
      <ManageTracksPanel />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {modules.map((module) => (
          <article key={module.title} className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-[0_16px_48px_rgba(12,20,38,0.06)]">
            <h2 className="text-lg font-semibold text-zinc-950">{module.title}</h2>
            <p className="mt-2 text-sm text-zinc-600">{module.description}</p>
            <Button variant="outline" size="sm" className="mt-4">
              {module.action}
            </Button>
          </article>
        ))}
      </section>
    </div>
  );
}
