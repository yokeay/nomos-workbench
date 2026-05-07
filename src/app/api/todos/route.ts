import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db, todos } from "@/lib/db"
import { eq, and, desc } from "drizzle-orm"
import { v4 as uuidv4 } from "uuid"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ code: 1001, message: "Unauthorized", data: null }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")
    if (!date) {
      return NextResponse.json({ code: 1003, message: "date is required", data: null }, { status: 400 })
    }

    const items = await db
      .select()
      .from(todos)
      .where(and(eq(todos.userId, session.user.id), eq(todos.date, date)))
      .orderBy(desc(todos.sortOrder))

    return NextResponse.json({ code: 0, message: "ok", data: items })
  } catch (error) {
    console.error("GET /api/todos error:", error)
    return NextResponse.json({ code: 5000, message: "Failed to fetch todos", data: null }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ code: 1001, message: "Unauthorized", data: null }, { status: 401 })
    }

    const body = await request.json()
    const { date, title, content } = body

    if (!date || !title) {
      return NextResponse.json({ code: 1003, message: "date and title are required", data: null }, { status: 400 })
    }

    const now = Date.now()

    // Get next sortOrder for this user+date
    const existing = await db
      .select({ sortOrder: todos.sortOrder })
      .from(todos)
      .where(and(eq(todos.userId, session.user.id), eq(todos.date, date)))
      .orderBy(desc(todos.sortOrder))
      .limit(1)

    const nextOrder = existing.length > 0 ? existing[0].sortOrder + 1 : 0

    const todo = {
      id: uuidv4(),
      userId: session.user.id,
      date,
      title: title.trim(),
      content: content || "",
      sortOrder: nextOrder,
      completed: 0,
      createdAt: now,
      updatedAt: now,
    }

    await db.insert(todos).values(todo)

    return NextResponse.json({ code: 0, message: "ok", data: todo })
  } catch (error) {
    console.error("POST /api/todos error:", error)
    return NextResponse.json({ code: 5000, message: "Failed to create todo", data: null }, { status: 500 })
  }
}
