import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center rounded-3xl border border-zinc-200 bg-white p-10 text-center shadow-[0_24px_70px_rgba(12,20,38,0.08)]">
      <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">Page Not Found</h1>
      <p className="mt-3 text-sm text-zinc-600">The page you requested is unavailable or moved.</p>
      <div className="mt-6 flex gap-2">
        <Button asChild>
          <Link href="/">Back Home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/tracks">Browse Tracks</Link>
        </Button>
      </div>
    </div>
  );
}
