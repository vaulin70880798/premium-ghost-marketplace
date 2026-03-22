import { redirect } from "next/navigation";

import { getAuthState } from "@/lib/auth/server";

export default async function RoleSelectionPage() {
  const auth = await getAuthState();

  if (!auth.user) {
    redirect("/auth/sign-in");
  }

  if (auth.role !== "admin") {
    redirect("/dashboard");
  }

  redirect("/admin");
}
