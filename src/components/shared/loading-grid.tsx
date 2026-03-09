export function LoadingGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-3xl border border-zinc-200 bg-white p-5 shadow-[0_20px_60px_rgba(12,20,38,0.05)]"
        >
          <div className="h-40 animate-pulse rounded-2xl bg-zinc-100" />
          <div className="mt-4 h-4 w-2/3 animate-pulse rounded-full bg-zinc-100" />
          <div className="mt-3 h-3 w-1/2 animate-pulse rounded-full bg-zinc-100" />
          <div className="mt-5 h-10 animate-pulse rounded-2xl bg-zinc-100" />
        </div>
      ))}
    </div>
  );
}
