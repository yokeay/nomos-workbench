'use client'

import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Plus, Pencil, Eye, Trash2, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSettingsStore } from '@/stores'
import { TRANSLATIONS } from '@/i18n/config'
import type { Todo } from '@/lib/db'
import { TodoDialog } from './todo-dialog'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface TodoViewProps {
  date: string
}

type FilterTab = 'uncompleted' | 'completed'

function sortTodos(a: Todo, b: Todo): number {
  return a.sortOrder - b.sortOrder
}

function TodoItem({
  todo,
  onToggle,
  onEdit,
  onView,
  onDelete,
}: {
  todo: Todo
  onToggle: (todo: Todo) => void
  onEdit: (todo: Todo) => void
  onView: (todo: Todo) => void
  onDelete: (todo: Todo) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-colors group',
        isDragging ? 'opacity-50 bg-accent/40 z-50' : 'hover:bg-accent/20'
      )}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="p-0.5 cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-muted-foreground/50 transition-colors shrink-0"
      >
        <GripVertical className="w-3 h-3" />
      </button>

      {/* Checkbox */}
      <button
        onClick={() => onToggle(todo)}
        className={cn(
          'w-3.5 h-3.5 rounded border shrink-0 transition-colors flex items-center justify-center',
          todo.completed
            ? 'bg-foreground/20 border-foreground/20'
            : 'border-border/60 hover:border-foreground/30'
        )}
      >
        {todo.completed === 1 && (
          <svg className="w-2 h-2 text-foreground/60" viewBox="0 0 16 16" fill="none">
            <path d="M3 8l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Title */}
      <span
        className={cn(
          'text-xs flex-1 truncate transition-colors',
          todo.completed
            ? 'text-muted-foreground/30 line-through'
            : 'text-foreground/70'
        )}
      >
        {todo.title}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          onClick={() => onView(todo)}
          className="p-1 rounded hover:bg-accent/40 transition-colors"
        >
          <Eye className="w-3 h-3 text-muted-foreground/50" />
        </button>
        <button
          onClick={() => onEdit(todo)}
          className="p-1 rounded hover:bg-accent/40 transition-colors"
        >
          <Pencil className="w-3 h-3 text-muted-foreground/50" />
        </button>
        <button
          onClick={() => onDelete(todo)}
          className="p-1 rounded hover:bg-destructive/10 transition-colors"
        >
          <Trash2 className="w-3 h-3 text-muted-foreground/50 hover:text-destructive/70" />
        </button>
      </div>
    </div>
  )
}

export function TodoView({ date }: TodoViewProps) {
  const { locale } = useSettingsStore()
  const t = TRANSLATIONS[locale].todo
  const toast = useToast()

  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(false)
  const [filterTab, setFilterTab] = useState<FilterTab>('uncompleted')

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'view' | 'edit' | 'create'>('create')
  const [dialogTodo, setDialogTodo] = useState<Todo | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  )

  const fetchTodos = useCallback(async () => {
    if (!date) return
    setLoading(true)
    try {
      const res = await fetch(`/api/todos?date=${date}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      if (json.code === 0) {
        setTodos((json.data as Todo[]).sort(sortTodos))
      }
    } catch (err) {
      console.error('Failed to fetch todos:', err)
      toast.error('Failed to load todos')
    } finally {
      setLoading(false)
    }
  }, [date, toast])

  useEffect(() => {
    fetchTodos()
  }, [fetchTodos])

  const handleToggle = useCallback(async (todo: Todo) => {
    const newCompleted = todo.completed ? 0 : 1
    // Optimistic
    setTodos((prev) =>
      prev
        .map((t) => (t.id === todo.id ? { ...t, completed: newCompleted } : t))
        .sort(sortTodos)
    )
    try {
      await fetch(`/api/todos/${todo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !!newCompleted }),
      })
    } catch {
      fetchTodos() // rollback
    }
  }, [fetchTodos])

  const handleDelete = useCallback(async (todo: Todo) => {
    setTodos((prev) => prev.filter((t) => t.id !== todo.id))
    try {
      await fetch(`/api/todos/${todo.id}`, { method: 'DELETE' })
    } catch {
      fetchTodos()
    }
  }, [fetchTodos])

  const handleSave = useCallback(async (data: { title: string; content: string }) => {
    if (dialogMode === 'create') {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, ...data }),
      })
      const json = await res.json()
      if (json.code === 0) {
        toast.success(t.created)
        fetchTodos()
      }
    } else if (dialogTodo) {
      const res = await fetch(`/api/todos/${dialogTodo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (json.code === 0) {
        toast.success(t.updated)
        fetchTodos()
      }
    }
  }, [dialogMode, dialogTodo, date, fetchTodos, toast, t])

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = todos.findIndex((t) => t.id === active.id)
    const newIndex = todos.findIndex((t) => t.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = [...todos]
    const [moved] = reordered.splice(oldIndex, 1)
    reordered.splice(newIndex, 0, moved)

    // Reassign sortOrder
    const updated = reordered.map((t, i) => ({ ...t, sortOrder: i }))
    setTodos(updated)

    // Persist
    try {
      await fetch('/api/todos/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: updated.map((t) => ({ id: t.id, sortOrder: t.sortOrder })),
        }),
      })
    } catch {
      fetchTodos()
    }
  }, [todos, fetchTodos])

  const uncompleted = todos.filter((t) => !t.completed)
  const completed = todos.filter((t) => t.completed)
  const displayed = filterTab === 'uncompleted' ? uncompleted : completed

  return (
    <div className="flex flex-col h-full">
      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-1.5 mb-2">
        {([
          [t.statsTotal, todos.length],
          [t.statsCompleted, completed.length],
          [t.statsUncompleted, uncompleted.length],
        ] as const).map(([label, count], i) => (
          <div
            key={label}
            className={cn(
              'text-center py-1.5 rounded-lg border border-border/30 bg-card/40',
              i === 0 && 'border-foreground/10',
              i === 1 && 'border-emerald-500/20',
              i === 2 && 'border-amber-500/20'
            )}
          >
            <div className="text-sm font-semibold text-foreground/80">{count}</div>
            <div className="text-[9px] text-muted-foreground/40">{label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex border-b border-border/30 mb-2">
        <button
          onClick={() => setFilterTab('uncompleted')}
          className={cn(
            'flex-1 text-center py-1.5 text-[11px] font-medium transition-colors border-b-2 -mb-[1px]',
            filterTab === 'uncompleted'
              ? 'border-foreground/60 text-foreground/80'
              : 'border-transparent text-muted-foreground/40 hover:text-muted-foreground/60'
          )}
        >
          {t.tabUncompleted} ({uncompleted.length})
        </button>
        <button
          onClick={() => setFilterTab('completed')}
          className={cn(
            'flex-1 text-center py-1.5 text-[11px] font-medium transition-colors border-b-2 -mb-[1px]',
            filterTab === 'completed'
              ? 'border-foreground/60 text-foreground/80'
              : 'border-transparent text-muted-foreground/40 hover:text-muted-foreground/60'
          )}
        >
          {t.tabCompleted} ({completed.length})
        </button>
      </div>

      {/* Todo list */}
      <div className="flex-1 overflow-auto no-scrollbar space-y-0.5">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-4 h-4 border-2 border-foreground/20 border-t-foreground/40 rounded-full animate-spin" />
          </div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground/25">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
            <p className="text-[11px]">{t.empty}</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={displayed.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              {displayed.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={handleToggle}
                  onEdit={(t) => {
                    setDialogTodo(t)
                    setDialogMode('edit')
                    setDialogOpen(true)
                  }}
                  onView={(t) => {
                    setDialogTodo(t)
                    setDialogMode('view')
                    setDialogOpen(true)
                  }}
                  onDelete={handleDelete}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Add button */}
      <button
        onClick={() => {
          setDialogTodo(null)
          setDialogMode('create')
          setDialogOpen(true)
        }}
        className="flex items-center justify-center gap-1.5 mt-2 py-2 rounded-xl border border-dashed border-border/40 hover:border-foreground/20 hover:bg-accent/20 text-muted-foreground/40 hover:text-foreground/60 transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        <span className="text-[11px] font-medium">{t.addTodo}</span>
      </button>

      {/* Dialog */}
      <TodoDialog
        mode={dialogMode}
        todo={dialogTodo}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
      />
    </div>
  )
}
