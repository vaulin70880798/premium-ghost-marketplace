import Link from "next/link";

import { Button } from "@/components/ui/button";

export function EmptyState({
  title,
  description,
  ctaLabel,
  ctaHref,
}: {
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-[0_20px_60px_rgba(12,20,38,0.07)]">
      <h3 className="text-xl font-semibold text-zinc-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600">{description}</p>
      {ctaLabel && ctaHref ? (
        <div className="mt-6">
          <Button asChild>
            <Link href={ctaHref}>{ctaLabel}</Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
