export default function ProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-ink-100 bg-white">
      <div className="aspect-[4/5] animate-pulse bg-ink-100" />
      <div className="space-y-2 p-3.5">
        <div className="h-4 w-3/4 animate-pulse rounded bg-ink-100" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-ink-100" />
        <div className="flex items-center gap-2">
          <div className="h-5 w-16 animate-pulse rounded bg-ink-100" />
          <div className="h-3 w-12 animate-pulse rounded bg-ink-100" />
        </div>
        <div className="h-3 w-2/3 animate-pulse rounded bg-ink-100" />
        <div className="flex gap-2 pt-1">
          <div className="h-8 flex-1 animate-pulse rounded-full bg-ink-100" />
          <div className="h-8 w-8 animate-pulse rounded-full bg-ink-100" />
        </div>
      </div>
    </div>
  );
}
