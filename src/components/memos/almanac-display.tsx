'use client'

import { useState, useEffect } from 'react'

interface AlmanacData {
  solarDate: string
  lunarMonth: number
  lunarDay: number
  isLeapMonth: boolean
  yearZodiac: string
  solarTerm: string | null
}

const LUNAR_MONTHS = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月']

const LUNAR_DAYS = [
  '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十',
]

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
          <div className="w-24 h-5 bg-muted-foreground/10 rounded mx-auto" />
          <div className="w-32 h-4 bg-muted-foreground/10 rounded mx-auto" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 bg-muted-foreground/5 rounded-xl animate-pulse" />
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

  const lunarDayStr = LUNAR_DAYS[data.lunarDay - 1] || `${data.lunarDay}`
  const lunarMonthStr = (data.isLeapMonth ? '闰' : '') + (LUNAR_MONTHS[data.lunarMonth - 1] || `${data.lunarMonth}月`)

  return (
    <div className="py-3 space-y-4 text-xs">
      {/* Lunar date highlight */}
      <div className="text-center space-y-1 py-2">
        <p className="text-lg font-medium text-foreground/80">
          {lunarMonthStr}{lunarDayStr}
        </p>
        <p className="text-[10px] text-muted-foreground/40">
          {data.solarDate} · {data.yearZodiac}年
          {data.solarTerm && ` · ${data.solarTerm}`}
        </p>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-muted/20 px-3 py-2 text-center">
          <p className="text-[10px] text-muted-foreground/40">生肖年</p>
          <p className="text-sm font-medium text-foreground/70">{data.yearZodiac}</p>
        </div>
        <div className="rounded-xl bg-muted/20 px-3 py-2 text-center">
          <p className="text-[10px] text-muted-foreground/40">节气</p>
          <p className="text-sm font-medium text-foreground/70">{data.solarTerm || '无'}</p>
        </div>
        <div className="rounded-xl bg-muted/20 px-3 py-2 text-center">
          <p className="text-[10px] text-muted-foreground/40">农历月</p>
          <p className="text-sm font-medium text-foreground/70">{lunarMonthStr}</p>
        </div>
        <div className="rounded-xl bg-muted/20 px-3 py-2 text-center">
          <p className="text-[10px] text-muted-foreground/40">农历日</p>
          <p className="text-sm font-medium text-foreground/70">{lunarDayStr}</p>
        </div>
      </div>
    </div>
  )
}
