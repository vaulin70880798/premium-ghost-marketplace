"use client";

import { UploadCloud } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const deliverables = ["WAV", "Stems", "MIDI", "Master", "Unmastered", "Extended Mix", "Radio Edit"];

export function UploadTrackForm() {
  const [selectedDeliverables, setSelectedDeliverables] = useState<string[]>(["WAV", "Stems", "Master"]);
  const [exclusiveSale, setExclusiveSale] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleDeliverable = (item: string) => {
    setSelectedDeliverables((current) =>
      current.includes(item) ? current.filter((value) => value !== item) : [...current, item],
    );
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!agreed) {
      toast.error("Please accept terms before submitting");
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setIsSubmitting(false);

    toast.success("Track submitted for moderation review");
    (event.target as HTMLFormElement).reset();
    setSelectedDeliverables(["WAV", "Stems", "Master"]);
    setExclusiveSale(true);
    setAgreed(false);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2">
        <Field label="Track title" required>
          <Input placeholder="e.g. Aurora Protocol" required />
        </Field>
        <Field label="Genre" required>
          <select className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200" required>
            <option value="">Select genre</option>
            <option>Melodic Techno</option>
            <option>Tech House</option>
            <option>Afro House</option>
            <option>Deep House</option>
            <option>Progressive House</option>
          </select>
        </Field>
        <Field label="BPM" required>
          <Input type="number" placeholder="124" required />
        </Field>
        <Field label="Musical key" required>
          <Input placeholder="F# minor" required />
        </Field>
        <Field label="Mood" required>
          <Input placeholder="Emotional, dark, hypnotic" required />
        </Field>
        <Field label="Price (USD)" required>
          <Input type="number" placeholder="1290" required />
        </Field>
      </section>

      <Field label="Description" required>
        <Textarea
          required
          placeholder="Describe arrangement highlights, drop energy, and intended use context."
        />
      </Field>

      <section className="space-y-3 rounded-3xl border border-zinc-200 bg-zinc-50 p-5">
        <p className="text-sm font-semibold text-zinc-900">Included files</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {deliverables.map((item) => (
            <Checkbox
              key={item}
              checked={selectedDeliverables.includes(item)}
              onChange={() => toggleDeliverable(item)}
              label={item}
            />
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <UploadDropzone title="Upload artwork" hint="PNG or JPG · 1600x1600" />
        <UploadDropzone title="Upload preview" hint="MP3 · 30 sec" />
        <UploadDropzone title="Upload package" hint="ZIP with stems and project files" />
      </section>

      <section className="grid gap-3 rounded-3xl border border-zinc-200 bg-white p-5 sm:grid-cols-2">
        <Checkbox checked={exclusiveSale} onChange={setExclusiveSale} label="Exclusive one-time sale" />
        <Checkbox checked={agreed} onChange={setAgreed} label="I agree to upload and licensing terms" />
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Track"}
        </Button>
        <p className="text-xs text-zinc-500">MVP note: file uploads are simulated with placeholder handling.</p>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
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

function UploadDropzone({ title, hint }: { title: string; hint: string }) {
  return (
    <label className="group flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-300 bg-white p-6 text-center transition hover:border-indigo-300 hover:bg-indigo-50/40">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 group-hover:bg-indigo-100 group-hover:text-indigo-600">
        <UploadCloud className="h-5 w-5" />
      </span>
      <span className="mt-3 text-sm font-semibold text-zinc-900">{title}</span>
      <span className="mt-1 text-xs text-zinc-500">{hint}</span>
      <input type="file" className="sr-only" />
    </label>
  );
}
