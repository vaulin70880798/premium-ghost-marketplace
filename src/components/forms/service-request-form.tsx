"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ServiceRequestForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    toast.success("Service request submitted. A producer manager will reply shortly.");
    (event.target as HTMLFormElement).reset();
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-[0_20px_60px_rgba(12,20,38,0.06)]">
      <h2 className="text-2xl font-semibold text-zinc-950">Submit Your Project Brief</h2>
      <p className="text-sm text-zinc-600">Share references, style direction, and budget. We will match you with a producer.</p>

      <Field label="Service" required>
        <select className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200" required>
          <option value="">Choose service</option>
          <option>Custom Ghost Production</option>
          <option>Remix</option>
          <option>Mixing</option>
          <option>Mastering</option>
          <option>Track Finishing</option>
          <option>Melody Writing</option>
        </select>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Genre" required>
          <Input required placeholder="Melodic Techno" />
        </Field>
        <Field label="Budget range" required>
          <select className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200" required>
            <option value="">Select range</option>
            <option>$250 - $500</option>
            <option>$500 - $1,000</option>
            <option>$1,000 - $1,500</option>
            <option>$1,500 - $2,500</option>
            <option>$2,500+</option>
          </select>
        </Field>
      </div>

      <Field label="Reference links">
        <Input placeholder="SoundCloud / YouTube / Dropbox links" />
      </Field>

      <Field label="Producer preference">
        <Input placeholder="Optional producer name or style note" />
      </Field>

      <Field label="Project notes" required>
        <Textarea required placeholder="Describe mood, arrangement style, deadline, and release context." />
      </Field>

      <Field label="Upload references">
        <label className="flex h-24 cursor-pointer items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 text-sm text-zinc-500 transition hover:border-indigo-300 hover:text-indigo-600">
          Drop files or click to upload (mocked)
          <input type="file" className="sr-only" multiple />
        </label>
      </Field>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit Request"}
      </Button>
    </form>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-zinc-700">
        {label}
        {required ? <span className="ml-1 text-indigo-600">*</span> : null}
      </span>
      {children}
    </label>
  );
}
