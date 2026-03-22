import { redirect } from "next/navigation";

import { getAuthState } from "@/lib/auth/server";

export default async function RoleSelectionPage() {
  const auth = await getAuthState();

  if (auth.isConfigured && !auth.user) {
    redirect("/auth/sign-in");
  }

  if (auth.isConfigured && auth.user && auth.role !== "admin") {
    redirect("/dashboard");
  }

  if (auth.isConfigured && auth.user && auth.role === "admin") {
    redirect("/admin");
  }

  return (
    <div className="mx-auto max-w-3xl rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-[0_24px_70px_rgba(12,20,38,0.08)]">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">Role Selection is Admin-Only</h1>
      <p className="mt-3 text-sm text-zinc-600">
        Public users are buyers by default. Producer and admin access is managed in the admin panel.
      </p>
    </div>
  );
}
