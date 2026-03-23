"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Chrome } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useAppState } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TEMP_ADMIN_EMAIL, TEMP_ADMIN_PASSWORD } from "@/lib/auth/demo-admin";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { hasSupabaseEnv } from "@/lib/supabase/config";

function parseRole(value: string | null | undefined): "buyer" | "producer" | "admin" {
  if (value === "buyer" || value === "producer" || value === "admin") {
    return value;
  }

  return "buyer";
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string) {
  let timer: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race<T>([
      promise,
      new Promise<T>((_resolve, reject) => {
        timer = setTimeout(() => {
          reject(new Error(message));
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}

export default function SignInPage() {
  const router = useRouter();
  const { syncRoleFromProfile, activateDemoAdminSession, setRole } = useAppState();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedPassword = password.trim();

      if (normalizedEmail === TEMP_ADMIN_EMAIL && normalizedPassword === TEMP_ADMIN_PASSWORD) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 12_000);

        const response = await fetch("/api/auth/demo-admin-login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: normalizedEmail,
            password: normalizedPassword,
          }),
          signal: controller.signal,
        }).finally(() => clearTimeout(timer));

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(payload?.error ?? "Temporary admin login failed.");
        }

        try {
          activateDemoAdminSession();
        } catch {
          // The secure cookie is the source of truth; local storage failures should not block sign-in.
        }

        setRole("admin");
        toast.success("Admin signed in");
        router.push("/admin");
        router.refresh();
        return;
      }

      if (!hasSupabaseEnv()) {
        throw new Error("Supabase is not configured for regular user login yet.");
      }

      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        throw new Error("Supabase client is unavailable.");
      }

      const { error, data } = await withTimeout(
        supabase.auth.signInWithPassword({ email: normalizedEmail, password: normalizedPassword }),
        15_000,
        "Sign in timed out. Please check your connection and try again.",
      );

      if (error || !data.user) {
        throw new Error(error?.message ?? "Unable to sign in.");
      }

      const profileResult = (await withTimeout(
        Promise.resolve(supabase.from("profiles").select("role, is_active").eq("id", data.user.id).maybeSingle()),
        10_000,
        "Profile check timed out. Please try again.",
      )) as {
        data: { role: string | null; is_active: boolean | null } | null;
        error: { message: string } | null;
      };

      const { data: profile, error: profileError } = profileResult;

      if (profileError) {
        throw new Error(profileError.message);
      }

      const role = parseRole(profile?.role);

      if (profile?.is_active === false) {
        await supabase.auth.signOut();
        throw new Error("Account is inactive. Contact admin.");
      }

      setRole(role);
      void syncRoleFromProfile();
      toast.success("Signed in");
      router.push(role === "admin" ? "/admin" : "/dashboard");
      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to sign in."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const onGoogleSignIn = async () => {
    try {
      if (!hasSupabaseEnv()) {
        toast.info("Supabase is not configured yet. Running demo mode.");
        router.push("/dashboard");
        return;
      }

      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        throw new Error("Supabase client is unavailable.");
      }

      setIsGoogleSubmitting(true);

      const redirectTo = `${window.location.origin}/auth/callback?next=/dashboard`;

      const { error } = await withTimeout(
        supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo,
          },
        }),
        15_000,
        "Google sign-in timed out. Please try again.",
      );

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Google sign-in failed."));
    } finally {
      setIsGoogleSubmitting(false);
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
