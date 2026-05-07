'use client'

import { create } from 'zustand'

const LS_KEY = 'nomos_news_filter'

interface NewsFilterState {
  disabledSourceIds: Set<string>
  toggleSource: (id: string) => void
  selectAll: () => void
  deselectAll: () => void
  isEnabled: (id: string) => boolean
  load: () => void
}

function loadDisabled(): Set<string> {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) return new Set(JSON.parse(raw))
  } catch {}
  return new Set()
}

function persist(disabled: Set<string>) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify([...disabled]))
  } catch {}
}

export const useNewsFilterStore = create<NewsFilterState>((set, get) => ({
  disabledSourceIds: typeof window !== 'undefined' ? loadDisabled() : new Set(),

  toggleSource: (id) => {
    const next = new Set(get().disabledSourceIds)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    persist(next)
    set({ disabledSourceIds: next })
  },

  selectAll: () => {
    persist(new Set())
    set({ disabledSourceIds: new Set() })
  },

  deselectAll: () => {
    // We'll load all source IDs before calling this
    // The caller passes the list; we store it
    // Actually, let's handle this differently — the NewsFilterManager knows all IDs
  },

  isEnabled: (id) => !get().disabledSourceIds.has(id),

  load: () => set({ disabledSourceIds: loadDisabled() }),
}))

// Helper to batch-disable all given IDs
export function deselectAllSources(ids: string[]) {
  const disabled = new Set(ids)
  persist(disabled)
  useNewsFilterStore.setState({ disabledSourceIds: disabled })
}
