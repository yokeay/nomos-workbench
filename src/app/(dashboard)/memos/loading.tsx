export default function MemosLoading() {
  return (
    <div className="flex h-full">
      {/* Left panel skeleton */}
      <div className="w-56 shrink-0 border-r border-border/40 flex flex-col p-3 gap-3">
        {/* Calendar skeleton */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="w-3 h-3 bg-muted-foreground/10 rounded animate-pulse" />
            <div className="w-20 h-3 bg-muted-foreground/10 rounded animate-pulse" />
            <div className="w-3 h-3 bg-muted-foreground/10 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="w-5 h-5 rounded-full bg-muted-foreground/5 animate-pulse" />
            ))}
          </div>
        </div>

        {/* Tab bar skeleton */}
        <div className="flex border-b border-border/40">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex-1 h-7 bg-muted-foreground/5 animate-pulse" />
          ))}
        </div>
      </div>

      {/* Right content skeleton */}
      <div className="flex-1 p-4 space-y-3">
        <div className="h-24 bg-muted-foreground/5 rounded-2xl animate-pulse" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="h-3 bg-muted-foreground/10 rounded w-3/4 animate-pulse" />
              <div className="h-3 bg-muted-foreground/10 rounded w-1/2 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
