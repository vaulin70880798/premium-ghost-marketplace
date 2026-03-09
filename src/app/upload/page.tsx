import Link from "next/link";

import { UploadTrackForm } from "@/components/forms/upload-track-form";
import { SectionHeading } from "@/components/shared/section-heading";
import { Badge } from "@/components/ui/badge";

export default function UploadPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <SectionHeading
        eyebrow="Producer Studio"
        title="Upload New Exclusive Track"
        description="Structured submission flow with metadata, file package declaration, and moderation-ready terms."
      />

      <div className="flex flex-wrap gap-2">
        <Badge>MVP Upload Flow</Badge>
        <Badge>Moderation Queue Ready</Badge>
        <Badge>Supabase Storage Ready</Badge>
      </div>

      <UploadTrackForm />

      <p className="text-xs text-zinc-500">
        Need custom producer onboarding? Continue to <Link href="/services" className="underline">custom services</Link>.
      </p>
    </div>
  );
}
