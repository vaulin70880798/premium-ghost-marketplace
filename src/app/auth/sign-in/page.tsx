"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { useAppState } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { hasSupabaseEnv } from "@/lib/supabase/config";

export default function SignInPage() {
  const router = useRouter();
  const { syncRoleFromProfile } = useAppState();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setIsSubmitting(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    if (!data.user) {
      toast.error("Unable to sign in.");
      return;
    }

    await syncRoleFromProfile();
    toast.success("Signed in");
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-md">
      <form onSubmit={onSubmit} className="space-y-4 rounded-3xl border border-zinc-200 bg-white p-7 shadow-[0_24px_70px_rgba(12,20,38,0.08)]">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">Sign In</h1>
        <p className="text-sm text-zinc-600">Access your buyer, producer, or admin workspace.</p>

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

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Continue"}
        </Button>

        <p className="text-xs text-zinc-500">
          Demo accounts: buyer@demo.com, producer@demo.com, admin@demo.com
        </p>

        <p className="text-sm text-zinc-600">
          New here?{" "}
          <Link href="/auth/sign-up" className="font-medium text-zinc-900 underline">
            Create account
          </Link>
        </p>
      </form>
    </div>
  );
}
