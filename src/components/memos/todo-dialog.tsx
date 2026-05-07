'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Pencil, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSettingsStore } from '@/stores'
import { TRANSLATIONS } from '@/i18n/config'
import type { Todo } from '@/lib/db'

type DialogMode = 'view' | 'edit' | 'create'

const MAX_SUBTASKS = 100

interface TodoDialogProps {
  mode: DialogMode
  todo: Todo | null
  open: boolean
  onClose: () => void
  onSave: (data: { title: string; content: string }) => Promise<void>
}

function parseSubtasks(content: string): string[] {
  const lines = content.split('\n').filter(Boolean)
  return lines.length > 0 ? lines : ['']
}

export function TodoDialog({ mode: initialMode, todo, open, onClose, onSave }: TodoDialogProps) {
  const { locale } = useSettingsStore()
  const t = TRANSLATIONS[locale].todo

  const [mode, setMode] = useState<DialogMode>(initialMode)
  const [title, setTitle] = useState('')
  const [subtasks, setSubtasks] = useState<string[]>([''])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setMode(initialMode)
      if (initialMode === 'create') {
        setTitle('')
        setSubtasks([''])
      } else if (todo) {
        setTitle(todo.title)
        setSubtasks(parseSubtasks(todo.content || ''))
      }
    }
  }, [open, initialMode, todo])

  const handleSave = useCallback(async () => {
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return
    const content = subtasks.filter((s) => s.trim()).join('\n')
    setSaving(true)
    try {
      await onSave({ title: trimmedTitle, content })
      onClose()
    } finally {
      setSaving(false)
    }
  }, [title, subtasks, onSave, onClose])

  const setSubtask = useCallback((i: number, val: string) => {
    setSubtasks((prev) => {
      const next = [...prev]
      next[i] = val
      return next
    })
  }, [])

  const addSubtask = useCallback(() => {
    setSubtasks((prev) => {
      if (prev.length >= MAX_SUBTASKS) return prev
      return [...prev, '']
    })
  }, [])

  const removeSubtask = useCallback((i: number) => {
    setSubtasks((prev) => {
      if (prev.length <= 1) return prev
      return prev.filter((_, idx) => idx !== i)
    })
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    }
  }, [handleSave])

  if (!open) return null

  const isView = mode === 'view'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-[420px] max-h-[80vh] bg-card border border-border/60 rounded-2xl shadow-lg flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 shrink-0">
          <h3 className="text-sm font-medium text-foreground/80">
            {mode === 'create' ? t.addTodo : mode === 'edit' ? t.editTodo : t.viewTodo}
          </h3>
          <div className="flex items-center gap-1">
            {isView && todo && (
              <button
                onClick={() => {
                  setMode('edit')
                  setTitle(todo.title)
                  setSubtasks(parseSubtasks(todo.content || ''))
                }}
                className="p-1.5 rounded-lg hover:bg-accent/40 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5 text-muted-foreground/60" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-accent/40 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground/60" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-4 space-y-3">
          {isView && todo ? (
            <div className="space-y-3">
              <h2 className="text-base font-semibold text-foreground/90">{todo.title}</h2>
              {todo.content ? (
                <div className="space-y-1.5">
                  {todo.content.split('\n').filter(Boolean).map((line, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-foreground/70">
                      <input
                        type="checkbox"
                        checked={false}
                        readOnly
                        className="mt-1 w-3.5 h-3.5 rounded border-border/60 accent-foreground shrink-0"
                      />
                      <span>{line}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground/40">{t.contentPlaceholder}</p>
              )}
            </div>
          ) : (
            <>
              <div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t.titlePlaceholder}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent border-b border-border/40 px-1 py-1.5 text-sm font-medium text-foreground/90 placeholder:text-muted-foreground/30 focus:outline-none focus:border-foreground/20 transition-colors"
                  autoFocus
                />
              </div>

              {/* Subtask rows */}
              <div className="space-y-1.5">
                {subtasks.map((st, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground/30 w-4 text-right shrink-0">
                      {i + 1}
                    </span>
                    <input
                      type="text"
                      value={st}
                      onChange={(e) => setSubtask(i, e.target.value)}
                      placeholder={`${t.subtaskPlaceholder} ${i + 1}`}
                      onKeyDown={handleKeyDown}
                      className="flex-1 bg-transparent border border-border/30 rounded-lg px-2 py-1.5 text-sm text-foreground/70 placeholder:text-muted-foreground/25 focus:outline-none focus:border-foreground/20 transition-colors"
                    />
                    {subtasks.length > 1 && (
                      <button
                        onClick={() => removeSubtask(i)}
                        className="p-1 rounded hover:bg-destructive/10 text-muted-foreground/30 hover:text-destructive/60 transition-colors shrink-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  onClick={addSubtask}
                  disabled={subtasks.length >= MAX_SUBTASKS}
                  className={cn(
                    'flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium transition-colors',
                    subtasks.length >= MAX_SUBTASKS
                      ? 'text-muted-foreground/20 cursor-not-allowed'
                      : 'text-muted-foreground/40 hover:text-foreground/60 hover:bg-accent/30'
                  )}
                >
                  <Plus className="w-3 h-3" />
                  <span>{subtasks.length >= MAX_SUBTASKS ? t.maxSubtasks : t.addSubtask}</span>
                </button>
              </div>

              <p className="text-[10px] text-muted-foreground/30 px-1">
                Ctrl+Enter {t.save}
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        {!isView && (
          <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border/40 shrink-0">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-muted-foreground/60 hover:text-muted-foreground/80 transition-colors rounded-lg hover:bg-accent/40"
            >
              {TRANSLATIONS[locale].common.cancel}
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim() || saving}
              className={cn(
                'px-4 py-1.5 text-xs font-medium rounded-lg transition-colors',
                title.trim()
                  ? 'bg-foreground text-background hover:bg-foreground/90'
                  : 'bg-muted text-muted-foreground/40 cursor-not-allowed'
              )}
            >
              {saving ? TRANSLATIONS[locale].settings.saving : t.save}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
