'use client'

import { useState, useEffect } from 'react'

interface HistoryEvent {
  text: string
  year: number
}

interface HistoryData {
  selected: HistoryEvent[]
  events: HistoryEvent[]
  births: HistoryEvent[]
  deaths: HistoryEvent[]
}

export function HistoryDisplay() {
  const [data, setData] = useState<HistoryData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/history/today')
        const json = await res.json()
        if (json.code === 0) {
          setData(json.data)
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-3 py-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse space-y-1">
            <div className="flex gap-2">
              <div className="w-10 h-3 bg-muted-foreground/10 rounded shrink-0" />
              <div className="flex-1 h-3 bg-muted-foreground/10 rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!data) {
    return (
      <div className="py-8 text-center text-xs text-muted-foreground/40">
        暂无数据
      </div>
    )
  }

  return (
    <div className="py-2 space-y-4 text-xs">
      {data.selected.length > 0 && (
        <section>
          <h4 className="text-[10px] font-medium text-muted-foreground/50 mb-1.5">精选</h4>
          <div className="space-y-1">
            {data.selected.map((e, i) => (
              <p key={i} className="flex gap-2 leading-relaxed">
                <span className="text-[10px] text-muted-foreground/40 shrink-0">{e.year}年</span>
                <span className="text-foreground/70">{e.text}</span>
              </p>
            ))}
          </div>
        </section>
      )}

      <section>
        <h4 className="text-[10px] font-medium text-muted-foreground/50 mb-1.5">事件</h4>
        <div className="space-y-1">
          {data.events.map((e, i) => (
            <p key={i} className="flex gap-2 leading-relaxed">
              <span className="text-[10px] text-muted-foreground/40 shrink-0">{e.year}年</span>
              <span className="text-foreground/70">{e.text}</span>
            </p>
          ))}
        </div>
      </section>

      {data.births.length > 0 && (
        <section>
          <h4 className="text-[10px] font-medium text-muted-foreground/50 mb-1.5">诞辰</h4>
          <div className="space-y-1">
            {data.births.slice(0, 3).map((e, i) => (
              <p key={i} className="flex gap-2 leading-relaxed">
                <span className="text-[10px] text-muted-foreground/40 shrink-0">{e.year}年</span>
                <span className="text-foreground/70">{e.text}</span>
              </p>
            ))}
          </div>
        </section>
      )}

      {data.deaths.length > 0 && (
        <section>
          <h4 className="text-[10px] font-medium text-muted-foreground/50 mb-1.5">忌日</h4>
          <div className="space-y-1">
            {data.deaths.slice(0, 3).map((e, i) => (
              <p key={i} className="flex gap-2 leading-relaxed">
                <span className="text-[10px] text-muted-foreground/40 shrink-0">{e.year}年</span>
                <span className="text-foreground/70">{e.text}</span>
              </p>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
