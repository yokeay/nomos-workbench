'use client'

import { useState, useEffect, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

interface Memo {
  id: string
  userId: string
  content: string
  createdAt: number
  updatedAt: number
}

interface MemosTimelineProps {
  refreshKey: number
  onSelectMemo: (memo: Memo) => void
}

function relativeTime(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins}分钟前`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}小时前`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}天前`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}个月前`
  return `${Math.floor(months / 12)}年前`
}

export function MemosTimeline({ refreshKey, onSelectMemo }: MemosTimelineProps) {
  const [memos, setMemos] = useState<Memo[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMemos = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/memos?limit=50')
      const json = await res.json()
      if (json.code === 0) {
        setMemos(json.data || [])
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMemos()
  }, [fetchMemos, refreshKey])

  if (loading) {
    return (
      <div className="space-y-3 py-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse space-y-1.5">
            <div className="h-3 bg-muted-foreground/10 rounded w-3/4" />
            <div className="h-3 bg-muted-foreground/10 rounded w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  if (memos.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-muted-foreground/40">
        暂无笔记，开始写第一条吧
      </div>
    )
  }

  return (
    <div className="relative pl-4 py-2">
      <div className="absolute left-0 top-0 bottom-0 w-px bg-border/40" />

      <div className="space-y-3">
        {memos.map((memo) => (
          <button
            key={memo.id}
            onClick={() => onSelectMemo(memo)}
            className="relative block w-full text-left group"
          >
            <div className="absolute -left-[calc(1rem+1.5px)] top-1.5 w-1.5 h-1.5 rounded-full bg-border group-hover:bg-foreground/40 transition-colors duration-fast" />

            <div className="space-y-0.5">
              <div className="prose prose-xs max-w-none text-foreground/80 line-clamp-2">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  urlTransform={(url) => {
                    const m = url.match(/\/([a-f0-9-]{36}\.[a-z]+)$/i)
                    return m ? `/api/storage/raw/${m[1]}` : url
                  }}
                >
                  {memo.content}
                </ReactMarkdown>
              </div>
              <span className="text-[10px] text-muted-foreground/40">
                {relativeTime(memo.createdAt)}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
