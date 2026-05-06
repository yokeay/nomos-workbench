import { NextRequest, NextResponse } from "next/server"
import { sources } from "@/lib/newsnow/sources"
import { getCache, setCache, isFresh } from "@/lib/newsnow/cache"
import type { TimelineItem, NewsItem } from "@/lib/newsnow/types"

function mapSourceItems(
  id: string,
  items: NewsItem[],
  sourceMeta: NonNullable<ReturnType<typeof sources.get>>,
  target: TimelineItem[],
  perSource: number,
) {
  const sorted = [...items].sort((a, b) => {
    const da = a.pubDate ?? 0
    const db = b.pubDate ?? 0
    return (db as number) - (da as number) || 0
  })
  for (const item of sorted.slice(0, perSource)) {
    target.push({
      ...item,
      sourceId: id,
      sourceName: sourceMeta.definition.name,
      sourceColor: sourceMeta.definition.color || "gray",
      sourceColumn: sourceMeta.definition.column,
    })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get("limit") || "300") || 300, 500)
    const since = searchParams.get("since")

    const PER_SOURCE = 5
    const sourceIDs = Array.from(sources.keys())
    const allItems: TimelineItem[] = []

    // Fetch stale sources in parallel
    const staleIDs = sourceIDs.filter(id => {
      const sourceMeta = sources.get(id)
      if (!sourceMeta) return false
      return !isFresh(id, sourceMeta.definition.interval)
    })

    if (staleIDs.length > 0) {
      const fetchResults = await Promise.allSettled(
        staleIDs.map(async (id) => {
          const sourceMeta = sources.get(id)
          if (!sourceMeta) return null
          try {
            const items = await sourceMeta.getter()
            setCache(id, items)
            return { id, items }
          } catch {
            const cached = getCache(id)
            return cached ? { id, items: cached.items } : { id, items: [] }
          }
        }),
      )

      for (const result of fetchResults) {
        if (result.status === "fulfilled" && result.value) {
          const { id, items } = result.value
          const sourceMeta = sources.get(id)
          if (!sourceMeta) continue
          mapSourceItems(id, items, sourceMeta, allItems, PER_SOURCE)
        }
      }
    }

    // Also include fresh cached items
    for (const id of sourceIDs) {
      if (staleIDs.includes(id)) continue
      const cached = getCache(id)
      if (!cached) continue
      const sourceMeta = sources.get(id)
      if (!sourceMeta) continue
      mapSourceItems(id, cached.items, sourceMeta, allItems, PER_SOURCE)
    }

    // Sort all by pubDate descending
    allItems.sort((a, b) => {
      const da = a.pubDate ?? 0
      const db = b.pubDate ?? 0
      return (db as number) - (da as number) || 0
    })

    // Deduplicate by composite key
    const seen = new Set<string>()
    const deduped: TimelineItem[] = []
    for (const item of allItems) {
      const key = `${item.sourceId}-${item.id}`
      if (!seen.has(key)) {
        seen.add(key)
        deduped.push(item)
      }
    }

    // Apply time window filter (default 24h)
    const now = Date.now()
    const sinceTs = since ? parseInt(since) : (now - 24 * 60 * 60 * 1000)
    const filtered = !isNaN(sinceTs)
      ? deduped.filter(item => {
          const pd = item.pubDate ?? 0
          return (typeof pd === "number" ? pd : 0) > sinceTs
        })
      : deduped

    return NextResponse.json({
      code: 0,
      data: {
        items: filtered.slice(0, limit),
        total: filtered.length,
        updatedAt: Date.now(),
      },
    })
  } catch (error) {
    console.error("News timeline error:", error)
    return NextResponse.json(
      { code: 5000, message: "Failed to load news timeline", data: null },
      { status: 500 },
    )
  }
}
