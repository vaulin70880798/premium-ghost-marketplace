import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-zinc-200 bg-white/80">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-zinc-900">Ghost Market</p>
            <p className="mt-1 max-w-md text-sm text-zinc-600">
              Premium ghost-produced tracks with one-time exclusive licensing and full rights transfer.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-zinc-600">
            <Link href="/tracks" className="hover:text-zinc-900">
              Buy Tracks
            </Link>
            <Link href="/services" className="hover:text-zinc-900">
              Custom Services
            </Link>
            <Link href="/upload" className="hover:text-zinc-900">
              Producer Upload
            </Link>
            <Link href="/admin" className="hover:text-zinc-900">
              Admin
            </Link>
          </div>
        </div>
        <div className="flex flex-col gap-1 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <p>Demo MVP. Payments and downloads are simulated for review.</p>
          <p>Copyright {new Date().getFullYear()} Ghost Market.</p>
        </div>
      </div>
    </footer>
  );
}
