'use client'

import { useState, useEffect, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'
import { X, Trash2, Pencil } from 'lucide-react'
import { useSettingsStore } from '@/stores'
import { TRANSLATIONS } from '@/i18n/config'

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
  onUpdate: (memo: Memo) => void
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

export function MemoDetailDrawer({ memo, open, onClose, onDelete, onUpdate }: MemoDetailDrawerProps) {
  const { locale } = useSettingsStore()
  const t = TRANSLATIONS[locale].memos

  const [mode, setMode] = useState<'view' | 'edit'>('view')
  const [editContent, setEditContent] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => setVisible(true))
    } else {
      setVisible(false)
    }
  }, [open])

  // Reset to view mode when memo changes
  useEffect(() => {
    setMode('view')
  }, [memo?.id])

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

  const handleEdit = () => {
    setEditContent(memo?.content || '')
    setMode('edit')
  }

  const handleSave = useCallback(async () => {
    if (!memo || saving) return
    setSaving(true)
    try {
      const res = await fetch(`/api/memos/${memo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent }),
      })
      if (res.ok) {
        onUpdate({ ...memo, content: editContent, updatedAt: Date.now() })
        setMode('view')
      }
    } catch {
      // ignore
    } finally {
      setSaving(false)
    }
  }, [memo, editContent, saving, onUpdate])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    }
  }, [handleSave])

  if (!open && !visible) return null

  return (
    <>
      {/* Backdrop — contained within right panel via absolute positioning */}
      <div
        className={cn(
          'absolute inset-0 z-40 bg-black/20 transition-opacity duration-200',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Drawer — absolute within parent (right content panel) */}
      <div
        className={cn(
          'absolute right-0 top-0 bottom-0 z-50 w-80 max-w-[85vw] bg-background border-l border-border/40',
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
              {mode === 'view' && (
                <button
                  onClick={handleEdit}
                  className="p-1 rounded hover:bg-accent/40 text-muted-foreground/50 hover:text-foreground/60 transition-colors"
                  title={t.edit}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              )}
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
            {mode === 'view' ? (
              <div className="prose prose-sm max-w-none text-foreground/80">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  urlTransform={(url) => {
                    const m = url.match(/\/([a-f0-9-]{36}\.[a-z]+)$/i)
                    return m ? `/api/storage/raw/${m[1]}` : url
                  }}
                >
                  {memo?.content || ''}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full h-64 bg-transparent border border-border/30 rounded-xl px-3 py-2 text-sm text-foreground/80 placeholder:text-muted-foreground/30 focus:outline-none focus:border-foreground/20 transition-colors resize-none"
                  placeholder="Markdown supported..."
                  autoFocus
                />
                <p className="text-[10px] text-muted-foreground/30 px-1">
                  Ctrl+Enter {t.saveEdit}
                </p>
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setMode('view')}
                    className="px-3 py-1.5 text-xs font-medium text-muted-foreground/60 hover:text-muted-foreground/80 transition-colors rounded-lg hover:bg-accent/40"
                  >
                    {t.cancelEdit}
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-1.5 text-xs font-medium rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-50"
                  >
                    {saving ? '...' : t.saveEdit}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
