import { AdminWorkspace } from "@/components/admin/admin-workspace";
import { requireRole } from "@/lib/auth/server";

export default async function AdminPage() {
  await requireRole(["admin"]);

  return <AdminWorkspace />;
}
