'use client'

import { useState, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { LogIn } from 'lucide-react'
import { SmallCalendar } from '@/components/memos/small-calendar'
import { TabBar, TabKey } from '@/components/memos/tab-bar'
import { MemosEditor } from '@/components/memos/memos-editor'
import { MemosTimeline } from '@/components/memos/memos-timeline'
import { MemoDetailDrawer } from '@/components/memos/memo-detail-drawer'
import { HistoryDisplay } from '@/components/memos/history-display'
import { AlmanacDisplay } from '@/components/memos/almanac-display'
import { TodoView } from '@/components/memos/todo-view'

interface Memo {
  id: string
  userId: string
  content: string
  createdAt: number
  updatedAt: number
}

export default function MemosPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('notes')
  const [publishing, setPublishing] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedMemo, setSelectedMemo] = useState<Memo | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  })
  const { isLoggedIn, isLoading } = useAuth()
  const toast = useToast()

  const handlePublish = useCallback(async (content: string) => {
    setPublishing(true)
    try {
      const res = await fetch('/api/memos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setRefreshKey((k) => k + 1)
    } catch {
      toast.error('发布失败，请重试')
    } finally {
      setPublishing(false)
    }
  }, [toast])

  const handleSelectMemo = useCallback((memo: Memo) => {
    setSelectedMemo(memo)
    setDrawerOpen(true)
  }, [])

  const handleDeleteMemo = useCallback((id: string) => {
    setRefreshKey((k) => k + 1)
  }, [])

  const handleUpdateMemo = useCallback((memo: Memo) => {
    setSelectedMemo(memo)
    setRefreshKey((k) => k + 1)
  }, [])

  return (
    <div className="flex h-full">
      {/* Left panel */}
      <div className="w-[334px] shrink-0 border-r border-border/40 flex flex-col p-3 gap-3">
        {/* Small calendar at top */}
        <SmallCalendar
          onDateChange={(date) =>
            setSelectedDate(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`)
          }
        />

        {/* Tab bar */}
        <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab content below */}
        <div className="flex-1 overflow-auto no-scrollbar">
          {activeTab === 'notes' && <TodoView date={selectedDate} />}
          {activeTab === 'history' && <HistoryDisplay />}
          {activeTab === 'almanac' && <AlmanacDisplay />}
        </div>
      </div>

      {/* Right content area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {activeTab === 'notes' ? (
          <div className="flex-1 flex flex-col p-4 gap-4 overflow-auto">
            {isLoading ? null : isLoggedIn ? (
              <>
                {/* Editor */}
                <MemosEditor onPublish={handlePublish} publishing={publishing} />

                {/* Timeline */}
                <div className="flex-1 overflow-auto no-scrollbar">
                  <MemosTimeline
                    refreshKey={refreshKey}
                    onSelectMemo={handleSelectMemo}
                  />
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground/40">
                <LogIn className="w-10 h-10" />
                <p className="text-sm font-medium">请先登录后再发布笔记</p>
                <a
                  href="/login"
                  className="text-xs text-primary/60 hover:text-primary/80 transition-colors underline underline-offset-2"
                >
                  前往登录
                </a>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 p-4 flex items-center justify-center text-xs text-muted-foreground/30">
            {activeTab === 'history' ? '选择日期查看历史事件' : '选择日期查看农历信息'}
          </div>
        )}
      </div>

      {/* Detail drawer */}
      <MemoDetailDrawer
        memo={selectedMemo}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onDelete={handleDeleteMemo}
        onUpdate={handleUpdateMemo}
      />
    </div>
  )
}
