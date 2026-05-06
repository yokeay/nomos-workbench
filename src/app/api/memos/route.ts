import { NextRequest, NextResponse } from 'next/server'
import { db, memos } from '@/lib/db'
import { desc } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200)
    const offset = parseInt(searchParams.get('offset') || '0')

    const items = await db
      .select()
      .from(memos)
      .orderBy(desc(memos.createdAt))
      .limit(limit)
      .offset(offset)

    return NextResponse.json({ code: 0, message: 'ok', data: items })
  } catch (error) {
    console.error('Memos GET error:', error)
    return NextResponse.json({ code: 5000, message: 'Failed to fetch memos', data: null }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const now = Date.now()

    const memo = {
      id: uuidv4(),
      userId: body.userId || 'default',
      content: body.content || '',
      createdAt: now,
      updatedAt: now,
    }

    await db.insert(memos).values(memo)

    return NextResponse.json({ code: 0, message: 'ok', data: memo })
  } catch (error) {
    console.error('Memos POST error:', error)
    return NextResponse.json({ code: 5000, message: 'Failed to create memo', data: null }, { status: 500 })
  }
}
