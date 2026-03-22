import { ProducerDashboard } from "@/components/dashboards/producer-dashboard";
import { getProducerDashboardData } from "@/data/queries";
import { requireRole } from "@/lib/auth/server";

export default async function ProducerDashboardPage() {
  const auth = await requireRole(["producer", "admin"]);
  const data = getProducerDashboardData();

  return <ProducerDashboard {...data} canUpload={auth.role === "admin"} />;
}
