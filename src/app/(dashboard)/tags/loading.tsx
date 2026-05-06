export default function TagsLoading() {
  return (
    <div className="h-full flex flex-col">
      {/* Level 1 skeleton tabs */}
      <div className="flex items-center gap-1 px-5 pt-4 pb-0">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-9 rounded-lg bg-muted/40 animate-pulse"
            style={{ width: i === 0 ? 60 : `${44 + Math.random() * 40}px` }}
          />
        ))}
      </div>

      {/* Level 2 skeleton tabs */}
      <div className="flex items-center gap-1 px-5 pt-2 pb-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-7 rounded-md bg-muted/40 animate-pulse"
            style={{ width: `${52 + Math.random() * 36}px` }}
          />
        ))}
      </div>

      {/* Divider */}
      <div className="mx-5 mt-1 border-t border-border/30" />

      {/* Grid skeleton */}
      <div className="flex-1 flex items-center justify-center">
        <div className="grid gap-2 auto-rows-auto justify-items-center w-full px-12"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))' }}
        >
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 p-2.5">
              <div className="w-12 h-12 rounded-2xl bg-muted/40 animate-pulse" />
              <div className="h-2.5 w-14 rounded bg-muted/40 animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Page indicator skeleton */}
      <div className="flex items-center justify-center gap-2 pb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`rounded-full ${i === 0 ? 'w-2 h-2 bg-muted/40' : 'w-2 h-2 border border-muted/30'}`}
          />
        ))}
      </div>
    </div>
  )
}
