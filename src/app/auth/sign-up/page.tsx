"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { hasSupabaseEnv } from "@/lib/supabase/config";

export default function SignUpPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
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

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    });

    if (error) {
      setIsSubmitting(false);
      toast.error(error.message);
      return;
    }

    if (data.user && data.session) {
      await supabase.from("profiles").upsert(
        {
          id: data.user.id,
          email,
          display_name: displayName,
          role: "buyer",
        },
        { onConflict: "id" },
      );
      setIsSubmitting(false);
      toast.success("Buyer account created");
      router.push("/dashboard");
      router.refresh();
      return;
    }

    setIsSubmitting(false);
    toast.success("Account created. Please verify your email, then sign in.");
    router.push("/auth/sign-in");
  };

  return (
    <div className="mx-auto max-w-md">
      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-3xl border border-zinc-200 bg-white p-7 shadow-[0_24px_70px_rgba(12,20,38,0.08)]"
      >
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">Create Buyer Account</h1>
        <p className="text-sm text-zinc-600">Producer and admin accounts are created only by admin onboarding.</p>

        <label className="space-y-2 text-sm">
          <span className="font-medium text-zinc-700">Name</span>
          <Input
            placeholder="Your name"
            required
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
          />
        </label>

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
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Continue"}
        </Button>

        <p className="text-sm text-zinc-600">
          Already have an account?{" "}
          <Link href="/auth/sign-in" className="font-medium text-zinc-900 underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
