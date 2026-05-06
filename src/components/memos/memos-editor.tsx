'use client'

import { useState, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Send, Paperclip, Loader2 } from 'lucide-react'

interface MemosEditorProps {
  onPublish: (content: string) => void
  publishing?: boolean
}

export function MemosEditor({ onPublish, publishing }: MemosEditorProps) {
  const [content, setContent] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadMsg, setUploadMsg] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const insertMarkdown = useCallback((md: string) => {
    const el = textareaRef.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const before = content.slice(0, start)
    const after = content.slice(end)
    const newContent = before + md + after
    setContent(newContent)
    // Restore cursor position after render
    requestAnimationFrame(() => {
      el.focus()
      el.selectionStart = el.selectionEnd = start + md.length
    })
  }, [content])

  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return

    const files: File[] = []
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile()
        if (file) files.push(file)
      }
    }

    if (files.length === 0) return

    e.preventDefault()
    setUploading(true)
    setUploadMsg(`正在上传 ${files.length} 个文件...`)

    const formData = new FormData()
    files.forEach((f) => formData.append('files', f))

    try {
      const res = await fetch('/api/memos/upload', { method: 'POST', body: formData })
      const json = await res.json()
      if (json.code === 0 && json.data?.length) {
        const mdParts = json.data.map((f: any) => {
          if (f.mimeType?.startsWith('image/')) return `![${f.filename}](${f.url})`
          return `[${f.filename}](${f.url})`
        })
        insertMarkdown(mdParts.join('\n') + '\n')
        setUploadMsg('')
      } else {
        setUploadMsg('上传失败')
      }
    } catch {
      setUploadMsg('上传失败')
    } finally {
      setUploading(false)
      setTimeout(() => setUploadMsg(''), 3000)
    }
  }, [insertMarkdown])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    if (files.length === 0) return

    setUploading(true)
    setUploadMsg(`正在上传 ${files.length} 个文件...`)

    const formData = new FormData()
    files.forEach((f) => formData.append('files', f))

    try {
      const res = await fetch('/api/memos/upload', { method: 'POST', body: formData })
      const json = await res.json()
      if (json.code === 0 && json.data?.length) {
        const mdParts = json.data.map((f: any) => {
          if (f.mimeType?.startsWith('image/')) return `![${f.filename}](${f.url})`
          return `[${f.filename}](${f.url})`
        })
        insertMarkdown(mdParts.join('\n') + '\n')
        setUploadMsg('')
      } else {
        setUploadMsg('上传失败')
      }
    } catch {
      setUploadMsg('上传失败')
    } finally {
      setUploading(false)
      setTimeout(() => setUploadMsg(''), 3000)
    }
  }, [insertMarkdown])

  const handleSubmit = useCallback(() => {
    const trimmed = content.trim()
    if (!trimmed || publishing) return
    onPublish(trimmed)
    setContent('')
  }, [content, publishing, onPublish])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }, [handleSubmit])

  return (
    <div className="relative flex flex-col gap-2">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground/50">
          <Paperclip className="w-3 h-3" />
          <span>支持粘贴图片/文件</span>
        </div>
        <span className="text-[10px] text-muted-foreground/30">Ctrl+Enter 发布</span>
      </div>

      {/* Editor area */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onPaste={handlePaste}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onKeyDown={handleKeyDown}
          placeholder="在这里输入 Markdown 笔记...&#10;支持粘贴图片、拖放文件自动上传"
          rows={6}
          className={cn(
            'w-full resize-none rounded-2xl border border-border/40 bg-card/60 px-4 py-3',
            'text-sm text-foreground placeholder:text-muted-foreground/30',
            'focus:outline-none focus:border-foreground/20 focus:ring-1 focus:ring-foreground/10',
            'transition-colors duration-fast',
            'scrollbar-none'
          )}
        />

        {/* Uploading overlay */}
        {uploading && (
          <div className="absolute inset-0 rounded-2xl bg-background/60 backdrop-blur-sm flex items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              {uploadMsg}
            </div>
          </div>
        )}
      </div>

      {/* Submit button */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={!content.trim() || publishing}
          className={cn(
            'flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-medium',
            'bg-foreground text-background hover:bg-foreground/90',
            'disabled:opacity-30 disabled:cursor-default',
            'transition-all duration-fast'
          )}
        >
          {publishing ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Send className="w-3 h-3" />
          )}
          发布
        </button>
      </div>
    </div>
  )
}
