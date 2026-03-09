import { BuyerDashboard } from "@/components/dashboards/buyer-dashboard";
import { getBuyerDashboardData } from "@/data/queries";

export default function BuyerDashboardPage() {
  const data = getBuyerDashboardData();

  return <BuyerDashboard {...data} />;
}
