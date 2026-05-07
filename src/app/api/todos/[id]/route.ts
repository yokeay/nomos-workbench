import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db, todos } from "@/lib/db"
import { eq, and } from "drizzle-orm"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ code: 1001, message: "Unauthorized", data: null }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Verify ownership
    const existing = await db
      .select()
      .from(todos)
      .where(and(eq(todos.id, id), eq(todos.userId, session.user.id)))
      .limit(1)

    if (existing.length === 0) {
      return NextResponse.json({ code: 1004, message: "Todo not found", data: null }, { status: 404 })
    }

    const updates: Record<string, unknown> = { updatedAt: Date.now() }
    if (body.title !== undefined) updates.title = body.title
    if (body.content !== undefined) updates.content = body.content
    if (body.completed !== undefined) updates.completed = body.completed ? 1 : 0
    if (body.sortOrder !== undefined) updates.sortOrder = body.sortOrder

    await db.update(todos).set(updates).where(eq(todos.id, id))

    return NextResponse.json({ code: 0, message: "ok", data: null })
  } catch (error) {
    console.error("PUT /api/todos/[id] error:", error)
    return NextResponse.json({ code: 5000, message: "Failed to update todo", data: null }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ code: 1001, message: "Unauthorized", data: null }, { status: 401 })
    }

    const { id } = await params

    await db
      .delete(todos)
      .where(and(eq(todos.id, id), eq(todos.userId, session.user.id)))

    return NextResponse.json({ code: 0, message: "ok" })
  } catch (error) {
    console.error("DELETE /api/todos/[id] error:", error)
    return NextResponse.json({ code: 5000, message: "Failed to delete todo", data: null }, { status: 500 })
  }
}
