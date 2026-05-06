import { NextRequest, NextResponse } from 'next/server'
import { db, memos } from '@/lib/db'
import { eq } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const [item] = await db.select().from(memos).where(eq(memos.id, id)).limit(1)
    if (!item) {
      return NextResponse.json({ code: 1004, message: 'Memo not found', data: null }, { status: 404 })
    }
    return NextResponse.json({ code: 0, message: 'ok', data: item })
  } catch (error) {
    console.error('Memo GET error:', error)
    return NextResponse.json({ code: 5000, message: 'Failed to fetch memo', data: null }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.delete(memos).where(eq(memos.id, id))
    return NextResponse.json({ code: 0, message: 'ok' })
  } catch (error) {
    console.error('Memo DELETE error:', error)
    return NextResponse.json({ code: 5000, message: 'Failed to delete memo', data: null }, { status: 500 })
  }
}
