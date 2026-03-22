import { BuyerDashboard } from "@/components/dashboards/buyer-dashboard";
import { getBuyerDashboardData } from "@/data/queries";
import { requireRole } from "@/lib/auth/server";

export default async function BuyerDashboardPage() {
  await requireRole(["buyer", "admin"]);
  const data = getBuyerDashboardData();

  return <BuyerDashboard {...data} />;
}
