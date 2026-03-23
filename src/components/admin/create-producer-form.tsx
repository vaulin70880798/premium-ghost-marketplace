"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CreateProducerForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [artistName, setArtistName] = useState("");
  const [role, setRole] = useState<"producer" | "admin">("producer");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSubmitting(true);

    const response = await fetch("/api/admin/create-producer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        displayName,
        artistName,
        role,
      }),
    });

    const payload = (await response.json().catch(() => null)) as { error?: string } | null;

    setIsSubmitting(false);

    if (!response.ok) {
      toast.error(payload?.error ?? "Could not create producer account.");
      return;
    }

    toast.success(`${role === "producer" ? "Producer" : "Admin"} account created successfully.`);
    setEmail("");
    setPassword("");
    setDisplayName("");
    setArtistName("");
    setRole("producer");
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-3xl border border-zinc-200 bg-white p-5 shadow-[0_16px_48px_rgba(12,20,38,0.06)]">
      <h2 className="text-lg font-semibold text-zinc-900">Add Producer / Team Member</h2>
      <p className="text-sm text-zinc-600">
        Admin-only onboarding flow for new producer or admin accounts.
      </p>

      <label className="space-y-1.5 text-sm">
        <span className="text-zinc-700">Role</span>
        <select
          value={role}
          onChange={(event) => setRole(event.target.value === "admin" ? "admin" : "producer")}
          className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm"
        >
          <option value="producer">Producer</option>
          <option value="admin">Admin</option>
        </select>
      </label>

      <label className="space-y-1.5 text-sm">
        <span className="text-zinc-700">Email</span>
        <Input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
      </label>

      <label className="space-y-1.5 text-sm">
        <span className="text-zinc-700">Temporary Password</span>
        <Input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>

      <label className="space-y-1.5 text-sm">
        <span className="text-zinc-700">Display Name</span>
        <Input required value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
      </label>

      {role === "producer" ? (
        <label className="space-y-1.5 text-sm">
          <span className="text-zinc-700">Artist Name</span>
          <Input required value={artistName} onChange={(event) => setArtistName(event.target.value)} />
        </label>
      ) : null}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : `Create ${role === "producer" ? "Producer" : "Admin"}`}
      </Button>
    </form>
  );
}
