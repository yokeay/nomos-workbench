'use client'

import { useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const DAY_NAMES = ['一', '二', '三', '四', '五', '六', '日']
const MONTH_NAMES = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

interface SmallCalendarProps {
  onDateChange?: (date: Date) => void
}

export function SmallCalendar({ onDateChange }: SmallCalendarProps) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selected, setSelected] = useState(today.getDate())

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const offset = firstDay === 0 ? 6 : firstDay - 1

  const prevMonth = useCallback(() => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1) }
    else setMonth((m) => m - 1)
  }, [month])

  const nextMonth = useCallback(() => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1) }
    else setMonth((m) => m + 1)
  }, [month])

  const handleSelect = useCallback((day: number) => {
    setSelected(day)
    onDateChange?.(new Date(year, month, day))
  }, [year, month, onDateChange])

  return (
    <div className="select-none">
      {/* Month header */}
      <div className="flex items-center justify-between mb-1.5">
        <button onClick={prevMonth} className="p-0.5 rounded hover:bg-accent/40 transition-colors">
          <ChevronLeft className="w-3 h-3 text-muted-foreground/60" />
        </button>
        <span className="text-xs font-medium text-foreground/80">
          {year}年{MONTH_NAMES[month]}
        </span>
        <button onClick={nextMonth} className="p-0.5 rounded hover:bg-accent/40 transition-colors">
          <ChevronRight className="w-3 h-3 text-muted-foreground/60" />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-0.5 mb-0.5">
        {DAY_NAMES.map((d) => (
          <div key={d} className="text-[9px] text-muted-foreground/40 text-center w-5 h-4 flex items-center justify-center">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({ length: offset }).map((_, i) => (
          <div key={`empty-${i}`} className="w-5 h-7" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const isToday =
            day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
          const isSelected = day === selected && month === today.getMonth() && year === today.getFullYear()

          return (
            <button
              key={day}
              onClick={() => handleSelect(day)}
              className={cn(
                'w-5 h-7 text-[10px] rounded-full flex items-center justify-center transition-colors duration-fast',
                isSelected
                  ? 'bg-foreground text-background font-medium'
                  : isToday
                    ? 'text-foreground font-medium ring-1 ring-foreground/20'
                    : 'text-foreground/60 hover:bg-accent/40'
              )}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}
