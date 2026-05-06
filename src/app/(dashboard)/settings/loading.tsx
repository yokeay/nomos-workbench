export default function SettingsLoading() {
  return (
    <div className="h-full p-6 overflow-auto">
      <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
        {/* Header skeleton */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-muted/40 animate-pulse" />
          <div className="h-7 w-24 rounded-lg bg-muted/40 animate-pulse" />
        </div>

        {/* Card skeletons */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="bg-card/60 border border-border/60 shadow-sm-soft rounded-2xl p-5 space-y-3"
          >
            {/* Card title */}
            <div className="h-5 w-28 rounded-md bg-muted/40 animate-pulse" />
            {/* Card body */}
            {Array.from({ length: i < 2 ? 2 : 1 }).map((_, j) => (
              <div key={j} className="space-y-2">
                <div className="h-3 w-16 rounded bg-muted/40 animate-pulse" />
                <div className="h-9 w-full rounded-lg bg-muted/30 animate-pulse" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
