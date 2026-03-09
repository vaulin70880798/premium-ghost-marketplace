import { LoadingGrid } from "@/components/shared/loading-grid";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-80 animate-pulse rounded-full bg-zinc-200" />
      <div className="h-5 w-2/3 animate-pulse rounded-full bg-zinc-200" />
      <LoadingGrid count={6} />
    </div>
  );
}
