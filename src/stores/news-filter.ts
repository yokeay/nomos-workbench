'use client'

import { create } from 'zustand'
import { savePreferences } from '@/lib/preferences-client'

const LS_KEY = 'nomos_news_filter'

interface NewsFilterState {
  disabledSourceIds: Set<string>
  filterVersion: number
  toggleSource: (id: string) => void
  selectAll: () => void
  deselectAll: () => void
  isEnabled: (id: string) => boolean
  load: () => void
  loadFromServer: (disabled: Set<string>) => void
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
  filterVersion: 0,

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
    // Handled via batchDeselectAll below — caller passes all IDs
  },

  isEnabled: (id) => !get().disabledSourceIds.has(id),

  load: () => set({ disabledSourceIds: loadDisabled() }),

  loadFromServer: (disabled) => {
    set({ disabledSourceIds: disabled, filterVersion: get().filterVersion + 1 })
    persist(disabled)
  },
}))

export function batchPersist(disabledIds: Set<string>) {
  persist(disabledIds)
  const s = useNewsFilterStore.getState()
  useNewsFilterStore.setState({ disabledSourceIds: disabledIds, filterVersion: s.filterVersion + 1 })
  savePreferences({ newsFilter: JSON.stringify([...disabledIds]) })
}

export function deselectAllSources(ids: string[]) {
  const disabled = new Set(ids)
  persist(disabled)
  const s = useNewsFilterStore.getState()
  useNewsFilterStore.setState({ disabledSourceIds: disabled, filterVersion: s.filterVersion + 1 })
}
