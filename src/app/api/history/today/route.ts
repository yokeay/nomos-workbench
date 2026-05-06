import { NextRequest, NextResponse } from 'next/server'

const WIKI_API = 'https://zh.wikipedia.org/api/rest_v1/feed/onthisday/all'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') || String(new Date().getMonth() + 1).padStart(2, '0')
    const day = searchParams.get('day') || String(new Date().getDate()).padStart(2, '0')

    const url = `${WIKI_API}/${month}/${day}`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'NOMOS-Workbench/0.1.9' },
    })

    if (!res.ok) {
      return NextResponse.json({ code: 5000, message: 'Failed to fetch history', data: null }, { status: 502 })
    }

    const data = await res.json()

    // Return relevant parts only
    return NextResponse.json({
      code: 0,
      message: 'ok',
      data: {
        selected: (data.selected || []).map((e: any) => ({
          text: e.text,
          year: e.year,
        })),
        events: (data.events || []).slice(0, 10).map((e: any) => ({
          text: e.text,
          year: e.year,
        })),
        births: (data.births || []).slice(0, 5).map((e: any) => ({
          text: e.text,
          year: e.year,
        })),
        deaths: (data.deaths || []).slice(0, 5).map((e: any) => ({
          text: e.text,
          year: e.year,
        })),
      },
    })
  } catch (error) {
    console.error('History API error:', error)
    return NextResponse.json({ code: 5000, message: 'Failed to fetch history', data: null }, { status: 500 })
  }
}
