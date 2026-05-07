import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db, todos } from "@/lib/db"
import { eq, and } from "drizzle-orm"

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ code: 1001, message: "Unauthorized", data: null }, { status: 401 })
    }

    const body = await request.json()
    const { items } = body as { items: { id: string; sortOrder: number }[] }

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ code: 1003, message: "items array is required", data: null }, { status: 400 })
    }

    const now = Date.now()

    // Update each item's sortOrder (only if owned by user)
    for (const item of items) {
      await db
        .update(todos)
        .set({ sortOrder: item.sortOrder, updatedAt: now })
        .where(and(eq(todos.id, item.id), eq(todos.userId, session.user.id)))
    }

    return NextResponse.json({ code: 0, message: "ok", data: null })
  } catch (error) {
    console.error("PUT /api/todos/reorder error:", error)
    return NextResponse.json({ code: 5000, message: "Failed to reorder todos", data: null }, { status: 500 })
  }
}
