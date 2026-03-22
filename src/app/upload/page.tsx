import Link from "next/link";

import { UploadTrackForm } from "@/components/forms/upload-track-form";
import { SectionHeading } from "@/components/shared/section-heading";
import { Badge } from "@/components/ui/badge";
import { requireRole } from "@/lib/auth/server";

export default async function UploadPage() {
  await requireRole(["admin"]);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <SectionHeading
        eyebrow="Admin Catalog Studio"
        title="Upload New Exclusive Track"
        description="Admin-only catalog submission flow with metadata, package declaration, and moderation-ready terms."
      />

      <div className="flex flex-wrap gap-2">
        <Badge>Admin-only Upload</Badge>
        <Badge>Supabase Storage Live</Badge>
        <Badge>Beatstore-style Metadata</Badge>
      </div>

      <UploadTrackForm />

      <p className="text-xs text-zinc-500">
        Need custom producer onboarding? Continue to{" "}
        <Link href="/services" className="underline">
          custom services
        </Link>
        .
      </p>
    </div>
  );
}
