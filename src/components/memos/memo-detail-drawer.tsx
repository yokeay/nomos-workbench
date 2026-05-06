'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { X, Trash2 } from 'lucide-react'

interface Memo {
  id: string
  userId: string
  content: string
  createdAt: number
  updatedAt: number
}

interface MemoDetailDrawerProps {
  memo: Memo | null
  open: boolean
  onClose: () => void
  onDelete: (id: string) => void
}

function formatDate(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function MemoDetailDrawer({ memo, open, onClose, onDelete }: MemoDetailDrawerProps) {
  const [deleting, setDeleting] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => setVisible(true))
    } else {
      setVisible(false)
    }
  }, [open])

  const handleDelete = async () => {
    if (!memo || deleting) return
    setDeleting(true)
    try {
      await fetch(`/api/memos/${memo.id}`, { method: 'DELETE' })
      onDelete(memo.id)
      onClose()
    } catch {
      // ignore
    } finally {
      setDeleting(false)
    }
  }

  if (!open && !visible) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/20 transition-opacity duration-200',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed right-0 top-0 bottom-0 z-50 w-80 max-w-[85vw] bg-background border-l border-border/40',
          'shadow-xl transition-transform duration-200',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
            <span className="text-xs text-muted-foreground/60">
              {memo ? formatDate(memo.createdAt) : ''}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="p-1 rounded hover:bg-destructive/10 text-muted-foreground/50 hover:text-destructive transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onClose}
                className="p-1 rounded hover:bg-accent/40 transition-colors"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground/60" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto px-4 py-4">
            <div className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
              {memo?.content || ''}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
