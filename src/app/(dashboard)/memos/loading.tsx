export default function MemosLoading() {
  return (
    <div className="flex h-full">
      {/* Left panel skeleton — w-[334px] */}
      <div className="w-[334px] shrink-0 border-r border-border/40 flex flex-col p-3 gap-3">
        {/* Calendar skeleton */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="w-3 h-3 bg-muted-foreground/10 rounded animate-pulse" />
            <div className="w-20 h-3 bg-muted-foreground/10 rounded animate-pulse" />
            <div className="w-3 h-3 bg-muted-foreground/10 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="w-5 h-9 rounded-full bg-muted-foreground/5 animate-pulse" />
            ))}
          </div>
        </div>

        {/* Tab bar skeleton */}
        <div className="flex border-b border-border/40 gap-0">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex-1 h-8 bg-muted-foreground/5 animate-pulse" />
          ))}
        </div>

        {/* Todo area skeleton */}
        <div className="flex-1 space-y-2">
          {/* Stats cards */}
          <div className="grid grid-cols-3 gap-1.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 rounded-lg bg-muted-foreground/5 animate-pulse" />
            ))}
          </div>
          {/* List items */}
          <div className="space-y-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-7 rounded-lg bg-muted-foreground/5 animate-pulse" />
            ))}
          </div>
        </div>
      </div>

      {/* Right content skeleton */}
      <div className="flex-1 p-4 space-y-4">
        {/* Editor skeleton */}
        <div className="h-32 bg-muted-foreground/5 rounded-2xl animate-pulse" />
        {/* Timeline skeleton */}
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-1.5 h-1.5 rounded-full mt-1.5 bg-muted-foreground/10 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-muted-foreground/10 rounded w-3/4 animate-pulse" />
                <div className="h-3 bg-muted-foreground/10 rounded w-1/2 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
