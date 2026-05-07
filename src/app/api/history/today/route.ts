import { NextRequest, NextResponse } from 'next/server'
import { db, historyOnthisday } from '@/lib/db'
import { eq, and } from 'drizzle-orm'
import { v4 as uuid } from 'uuid'

const WIKI_API = 'https://zh.wikipedia.org/api/rest_v1/feed/onthisday/all'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') || String(new Date().getMonth() + 1).padStart(2, '0')
    const day = searchParams.get('day') || String(new Date().getDate()).padStart(2, '0')

    // Check cache first
    const rows = db.select().from(historyOnthisday)
      .where(and(eq(historyOnthisday.month, month), eq(historyOnthisday.day, day)))
      .limit(1)
      .all()
    const cached = rows[0]

    if (cached) {
      return NextResponse.json({
        code: 0,
        message: 'ok',
        data: JSON.parse(cached.data),
      })
    }

    // Fetch from Wikipedia
    const url = `${WIKI_API}/${month}/${day}`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'NOMOS-Workbench/0.1.9' },
    })

    if (!res.ok) {
      return NextResponse.json({ code: 5000, message: 'Failed to fetch history', data: null }, { status: 502 })
    }

    const wikiData = await res.json()

    const data = {
      selected: (wikiData.selected || []).map((e: any) => ({
        text: e.text,
        year: e.year,
      })),
      events: (wikiData.events || []).slice(0, 10).map((e: any) => ({
        text: e.text,
        year: e.year,
      })),
      births: (wikiData.births || []).slice(0, 5).map((e: any) => ({
        text: e.text,
        year: e.year,
      })),
      deaths: (wikiData.deaths || []).slice(0, 5).map((e: any) => ({
        text: e.text,
        year: e.year,
      })),
    }

    // Store in cache
    await db.insert(historyOnthisday).values({
      id: `${month}-${day}`,
      month,
      day,
      data: JSON.stringify(data),
      createdAt: Date.now(),
    })

    return NextResponse.json({ code: 0, message: 'ok', data })
  } catch (error) {
    console.error('History API error:', error)
    return NextResponse.json({ code: 5000, message: 'Failed to fetch history', data: null }, { status: 500 })
  }
}
