'use client'

import { useState, useCallback } from 'react'
import { SmallCalendar } from '@/components/memos/small-calendar'
import { TabBar, TabKey } from '@/components/memos/tab-bar'
import { MemosEditor } from '@/components/memos/memos-editor'
import { MemosTimeline } from '@/components/memos/memos-timeline'
import { MemoDetailDrawer } from '@/components/memos/memo-detail-drawer'
import { HistoryDisplay } from '@/components/memos/history-display'
import { AlmanacDisplay } from '@/components/memos/almanac-display'

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

  const handlePublish = useCallback(async (content: string) => {
    setPublishing(true)
    try {
      await fetch('/api/memos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      setRefreshKey((k) => k + 1)
    } catch {
      // ignore
    } finally {
      setPublishing(false)
    }
  }, [])

  const handleSelectMemo = useCallback((memo: Memo) => {
    setSelectedMemo(memo)
    setDrawerOpen(true)
  }, [])

  const handleDeleteMemo = useCallback((id: string) => {
    setRefreshKey((k) => k + 1)
  }, [])

  return (
    <div className="flex h-full">
      {/* Left panel */}
      <div className="w-56 shrink-0 border-r border-border/40 flex flex-col p-3 gap-3">
        {/* Small calendar at top */}
        <SmallCalendar />

        {/* Tab bar */}
        <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab content below */}
        <div className="flex-1 overflow-auto scrollbar-none">
          {activeTab === 'history' && <HistoryDisplay />}
          {activeTab === 'almanac' && <AlmanacDisplay />}
        </div>
      </div>

      {/* Right content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeTab === 'notes' ? (
          <div className="flex-1 flex flex-col p-4 gap-4 overflow-auto">
            {/* Editor */}
            <MemosEditor onPublish={handlePublish} publishing={publishing} />

            {/* Timeline */}
            <div className="flex-1 overflow-auto scrollbar-none">
              <MemosTimeline
                refreshKey={refreshKey}
                onSelectMemo={handleSelectMemo}
              />
            </div>
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
      />
    </div>
  )
}
