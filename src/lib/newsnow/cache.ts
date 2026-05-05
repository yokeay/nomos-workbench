import type { NewsItem } from "./types"
import { Interval } from "./constants"

interface CacheEntry {
  items: NewsItem[]
  updated: number
}

const store = new Map<string, CacheEntry>()

export function getCache(id: string): CacheEntry | undefined {
  return store.get(id)
}

export function setCache(id: string, items: NewsItem[]): void {
  store.set(id, { items, updated: Date.now() })
}

export function isFresh(id: string, ttl: number = Interval): boolean {
  const entry = store.get(id)
  if (!entry) return false
  return Date.now() - entry.updated < ttl
}

export function getStaleIDs(ids: string[]): string[] {
  return ids.filter(id => !isFresh(id))
}
