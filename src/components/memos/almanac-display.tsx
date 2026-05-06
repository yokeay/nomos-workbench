'use client'

import { useState, useEffect } from 'react'

interface AlmanacData {
  solarDate: string
  lunarMonth: number
  lunarDay: number
  isLeapMonth: boolean
  lunarMonthName: string
  lunarDayName: string
  yearZodiac: string
  dayZodiac: string
  solarTerm: string | null

  baZi: { year: string; month: string; day: string; hour: string }
  baZiWuXing: { year: string; month: string; day: string; hour: string }
  baZiNaYin: { year: string; month: string; day: string; hour: string }

  yi: string[]
  ji: string[]

  chong: string
  sha: string

  jiShen: string[]
  xiongSha: string[]

  taiShen: string

  pengZuGan: string
  pengZuZhi: string

  xiu: string
  xiuSong: string
  xiuLuck: string
}

const PILLAR_LABELS = ['年', '月', '日', '时'] as const
type PillarKey = 'year' | 'month' | 'day' | 'hour'

export function AlmanacDisplay() {
  const [data, setData] = useState<AlmanacData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/almanac/today')
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
      <div className="py-4 space-y-3">
        <div className="animate-pulse space-y-2">
          <div className="w-20 h-5 bg-muted-foreground/10 rounded mx-auto" />
          <div className="w-28 h-3 bg-muted-foreground/10 rounded mx-auto" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 bg-muted-foreground/5 rounded-lg animate-pulse" />
          ))}
        </div>
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

  const baZiPillars: { key: PillarKey; label: string }[] = [
    { key: 'year', label: '年' },
    { key: 'month', label: '月' },
    { key: 'day', label: '日' },
    { key: 'hour', label: '时' },
  ]

  return (
    <div className="py-3 space-y-4 text-xs">
      {/* Lunar date highlight */}
      <div className="text-center space-y-1 py-2">
        <p className="text-lg font-medium text-foreground/80">
          {data.lunarMonthName}{data.lunarDayName}
        </p>
        <p className="text-[10px] text-muted-foreground/40">
          {data.solarDate} · {data.yearZodiac}年
          {data.solarTerm && ` · ${data.solarTerm}`}
        </p>
      </div>

      {/* Yi (宜) */}
      {data.yi.length > 0 && (
        <div className="rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 px-3 py-2.5">
          <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400/60 mb-1.5 font-medium">宜</p>
          <div className="flex flex-wrap gap-1">
            {data.yi.slice(0, 8).map((item) => (
              <span key={item} className="text-[10px] text-emerald-700/60 dark:text-emerald-300/50 bg-emerald-100/50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded-md">
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Ji (忌) */}
      {data.ji.length > 0 && (
        <div className="rounded-xl bg-red-50/50 dark:bg-red-950/20 px-3 py-2.5">
          <p className="text-[10px] text-red-500/70 dark:text-red-400/60 mb-1.5 font-medium">忌</p>
          <div className="flex flex-wrap gap-1">
            {data.ji.map((item) => (
              <span key={item} className="text-[10px] text-red-600/60 dark:text-red-300/50 bg-red-100/50 dark:bg-red-900/30 px-1.5 py-0.5 rounded-md">
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* BaZi */}
      <div className="rounded-xl bg-muted/20 px-3 py-2.5">
        <p className="text-[10px] text-muted-foreground/40 mb-2 font-medium">八字</p>
        <div className="grid grid-cols-4 gap-1.5">
          {baZiPillars.map(({ key, label }) => (
            <div key={key} className="text-center">
              <p className="text-[11px] font-medium text-foreground/70">{data.baZi[key]}</p>
              <p className="text-[8px] text-muted-foreground/40 mt-0.5">{data.baZiWuXing[key]}</p>
              <p className="text-[8px] text-muted-foreground/30">{data.baZiNaYin[key]}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Chong/Sha + TaiShen */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-muted/20 px-3 py-2 text-center">
          <p className="text-[10px] text-muted-foreground/40">冲</p>
          <p className="text-[11px] font-medium text-foreground/60 mt-0.5">{data.chong}</p>
        </div>
        <div className="rounded-xl bg-muted/20 px-3 py-2 text-center">
          <p className="text-[10px] text-muted-foreground/40">煞</p>
          <p className="text-[11px] font-medium text-foreground/60 mt-0.5">{data.sha}</p>
        </div>
      </div>

      {/* JiShen */}
      {data.jiShen.length > 0 && (
        <div className="rounded-xl bg-muted/20 px-3 py-2.5">
          <p className="text-[10px] text-muted-foreground/40 mb-1.5 font-medium">吉神</p>
          <div className="flex flex-wrap gap-1">
            {data.jiShen.map((item) => (
              <span key={item} className="text-[10px] text-foreground/50 bg-muted/30 px-1.5 py-0.5 rounded-md">
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* XiongSha */}
      {data.xiongSha.length > 0 && (
        <div className="rounded-xl bg-muted/20 px-3 py-2.5">
          <p className="text-[10px] text-muted-foreground/40 mb-1.5 font-medium">凶神</p>
          <div className="flex flex-wrap gap-1">
            {data.xiongSha.map((item) => (
              <span key={item} className="text-[10px] text-foreground/50 bg-muted/30 px-1.5 py-0.5 rounded-md">
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* TaiShen + PengZu */}
      <div className="rounded-xl bg-muted/20 px-3 py-2.5 space-y-2">
        <div>
          <p className="text-[10px] text-muted-foreground/40 mb-0.5">胎神</p>
          <p className="text-[11px] text-foreground/60">{data.taiShen}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground/40 mb-0.5">彭祖百忌</p>
          <p className="text-[11px] text-foreground/60">{data.pengZuGan} {data.pengZuZhi}</p>
        </div>
      </div>

      {/* Xiu */}
      <div className="rounded-xl bg-muted/20 px-3 py-2.5 text-center">
        <p className="text-[10px] text-muted-foreground/40 mb-1">值日星宿</p>
        <p className="text-sm font-medium text-foreground/70">
          {data.xiu}
          <span className={data.xiuLuck === '吉' ? 'text-emerald-500/70' : 'text-red-500/70'}> · {data.xiuLuck}</span>
        </p>
        <p className="text-[9px] text-muted-foreground/40 mt-0.5 leading-relaxed">{data.xiuSong}</p>
      </div>
    </div>
  )
}
