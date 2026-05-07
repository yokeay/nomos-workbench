import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db, memos } from '@/lib/db'
import { and, eq } from 'drizzle-orm'

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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ code: 1001, message: 'Unauthorized', data: null }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const [existing] = await db
      .select()
      .from(memos)
      .where(and(eq(memos.id, id), eq(memos.userId, session.user.id)))
      .limit(1)

    if (!existing) {
      return NextResponse.json({ code: 1004, message: 'Memo not found', data: null }, { status: 404 })
    }

    await db
      .update(memos)
      .set({ content: body.content, updatedAt: Date.now() })
      .where(eq(memos.id, id))

    return NextResponse.json({ code: 0, message: 'ok', data: null })
  } catch (error) {
    console.error('Memo PUT error:', error)
    return NextResponse.json({ code: 5000, message: 'Failed to update memo', data: null }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ code: 1001, message: 'Unauthorized', data: null }, { status: 401 })
    }

    const { id } = await params
    // Only delete if the memo belongs to the authenticated user
    await db.delete(memos).where(and(eq(memos.id, id), eq(memos.userId, session.user.id)))
    return NextResponse.json({ code: 0, message: 'ok' })
  } catch (error) {
    console.error('Memo DELETE error:', error)
    return NextResponse.json({ code: 5000, message: 'Failed to delete memo', data: null }, { status: 500 })
  }
}
