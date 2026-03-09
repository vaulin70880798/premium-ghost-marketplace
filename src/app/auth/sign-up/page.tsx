"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SignUpPage() {
  const router = useRouter();

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast.success("Account created (demo mode)");
    router.push("/auth/role");
  };

  return (
    <div className="mx-auto max-w-md">
      <form onSubmit={onSubmit} className="space-y-4 rounded-3xl border border-zinc-200 bg-white p-7 shadow-[0_24px_70px_rgba(12,20,38,0.08)]">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">Create Account</h1>
        <p className="text-sm text-zinc-600">Start buying tracks or publishing as a producer.</p>

        <label className="space-y-2 text-sm">
          <span className="font-medium text-zinc-700">Name</span>
          <Input placeholder="Your name" required />
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium text-zinc-700">Email</span>
          <Input type="email" placeholder="you@example.com" required />
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium text-zinc-700">Password</span>
          <Input type="password" placeholder="••••••••" required />
        </label>

        <Button type="submit" className="w-full">
          Continue
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
