import { redirect } from "next/navigation";

import { DashboardHub } from "@/components/dashboards/dashboard-hub";
import { getAuthState } from "@/lib/auth/server";

export default async function DashboardHubPage() {
  const auth = await getAuthState();

  if (auth.isConfigured && !auth.user) {
    redirect("/auth/sign-in");
  }

  if (auth.isConfigured && auth.user) {
    if (auth.role === "buyer") {
      redirect("/dashboard/buyer");
    }

    if (auth.role === "producer") {
      redirect("/dashboard/producer");
    }

    if (auth.role === "admin") {
      redirect("/admin");
    }
  }

  return <DashboardHub />;
}
