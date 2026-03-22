"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Chrome } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useAppState } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { hasSupabaseEnv } from "@/lib/supabase/config";

function parseRole(value: string | null | undefined): "buyer" | "producer" | "admin" {
  if (value === "buyer" || value === "producer" || value === "admin") {
    return value;
  }

  return "buyer";
}

export default function SignInPage() {
  const router = useRouter();
  const { syncRoleFromProfile } = useAppState();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!hasSupabaseEnv()) {
      toast.info("Supabase is not configured yet. Running demo mode.");
      router.push("/dashboard");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      toast.error("Supabase client is unavailable.");
      return;
    }

    setIsSubmitting(true);

    const { error, data } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
      setIsSubmitting(false);
      toast.error(error?.message ?? "Unable to sign in.");
      return;
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
    const role = parseRole(profile?.role);

    if (role === "admin") {
      if (!adminCode.trim()) {
        await supabase.auth.signOut();
        setIsSubmitting(false);
        toast.error("Admin code is required for admin login.");
        return;
      }

      const verifyResponse = await fetch("/api/auth/verify-admin-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: adminCode.trim() }),
      });

      if (!verifyResponse.ok) {
        const payload = (await verifyResponse.json().catch(() => null)) as { error?: string } | null;
        await supabase.auth.signOut();
        setIsSubmitting(false);
        toast.error(payload?.error ?? "Invalid admin code.");
        return;
      }
    }

    await syncRoleFromProfile();
    setIsSubmitting(false);
    toast.success("Signed in");
    router.push("/dashboard");
    router.refresh();
  };

  const onGoogleSignIn = async () => {
    if (!hasSupabaseEnv()) {
      toast.info("Supabase is not configured yet. Running demo mode.");
      router.push("/dashboard");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      toast.error("Supabase client is unavailable.");
      return;
    }

    setIsGoogleSubmitting(true);

    const redirectTo = `${window.location.origin}/auth/callback?next=/dashboard`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });

    setIsGoogleSubmitting(false);

    if (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-3xl border border-zinc-200 bg-white p-7 shadow-[0_24px_70px_rgba(12,20,38,0.08)]"
      >
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">Sign In</h1>
        <p className="text-sm text-zinc-600">All new users are buyers by default. Producer access is admin-assigned.</p>

        <Button type="button" variant="outline" className="w-full" onClick={onGoogleSignIn} disabled={isGoogleSubmitting}>
          <Chrome className="mr-2 h-4 w-4" />
          {isGoogleSubmitting ? "Redirecting..." : "Continue with Google"}
        </Button>

        <div className="relative py-1 text-center text-xs text-zinc-400">
          <span className="bg-white px-2">or use email and password</span>
          <div className="absolute inset-x-0 top-1/2 -z-10 h-px bg-zinc-200" />
        </div>

        <label className="space-y-2 text-sm">
          <span className="font-medium text-zinc-700">Email</span>
          <Input
            type="email"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium text-zinc-700">Password</span>
          <Input
            type="password"
            placeholder="••••••••"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium text-zinc-700">Admin Code (admins only)</span>
          <Input
            type="password"
            placeholder="Private admin code"
            value={adminCode}
            onChange={(event) => setAdminCode(event.target.value)}
          />
        </label>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Continue"}
        </Button>

        <p className="text-sm text-zinc-600">
          New here?{" "}
          <Link href="/auth/sign-up" className="font-medium text-zinc-900 underline">
            Create buyer account
          </Link>
        </p>
      </form>
    </div>
  );
}
