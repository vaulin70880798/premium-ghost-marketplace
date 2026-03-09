import { ProducerDashboard } from "@/components/dashboards/producer-dashboard";
import { getProducerDashboardData } from "@/data/queries";

export default function ProducerDashboardPage() {
  const data = getProducerDashboardData();

  return <ProducerDashboard {...data} />;
}
