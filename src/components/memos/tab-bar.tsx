'use client'

import { cn } from '@/lib/utils'
import { FileText, Clock, Moon } from 'lucide-react'

export type TabKey = 'notes' | 'history' | 'almanac'

interface TabBarProps {
  activeTab: TabKey
  onTabChange: (tab: TabKey) => void
}

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'notes', label: '笔记', icon: <FileText className="w-3 h-3" /> },
  { key: 'history', label: '历史上的今天', icon: <Clock className="w-3 h-3" /> },
  { key: 'almanac', label: '万年历', icon: <Moon className="w-3 h-3" /> },
]

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <div className="flex items-center border-b border-border/40">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={cn(
            'flex-1 flex items-center justify-center gap-1 px-2 py-2 text-xs font-medium transition-colors duration-fast',
            'border-b-2 -mb-px',
            activeTab === tab.key
              ? 'border-foreground text-foreground'
              : 'border-transparent text-muted-foreground/50 hover:text-muted-foreground'
          )}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  )
}
