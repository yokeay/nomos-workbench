export default function CalendarLoading() {
  return (
    <div className="h-full p-6 overflow-auto">
      <div className="max-w-4xl mx-auto animate-fade-in">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-muted/40 animate-pulse" />
            <div className="h-7 w-32 rounded-lg bg-muted/40 animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-muted/40 animate-pulse" />
            <div className="w-8 h-8 rounded-lg bg-muted/40 animate-pulse" />
          </div>
        </div>

        {/* Calendar grid skeleton */}
        <div className="bg-card/60 border border-border/60 shadow-sm-soft rounded-2xl overflow-hidden">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-px py-3 px-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-3 w-8 mx-auto rounded bg-muted/40 animate-pulse" />
            ))}
          </div>
          {/* Day cells */}
          <div className="grid grid-cols-7 gap-px p-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-20 p-2 rounded-xl">
                <div className="w-5 h-5 rounded bg-muted/30 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
