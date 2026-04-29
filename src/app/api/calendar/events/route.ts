import { auth } from '@/lib/auth';
import { db, calendarEvents } from '@/lib/db';
import { eq, and, gte, lte, asc } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ code: 1001, message: 'Unauthorized', data: null }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month') || new Date().toISOString().slice(0, 7);
    const start = new Date(month + '-01').getTime();
    const end = new Date(month + '-01').setMonth(new Date(month + '-01').getMonth() + 1);

    const events = await db
      .select()
      .from(calendarEvents)
      .where(and(
        eq(calendarEvents.userId, session.user.id),
        gte(calendarEvents.startTime, start),
        lte(calendarEvents.startTime, end),
      ))
      .orderBy((t) => asc(t.startTime));

    return NextResponse.json({ code: 0, message: 'ok', data: events });
  } catch (error) {
    console.error('Calendar GET error:', error);
    return NextResponse.json({ code: 5000, message: 'Failed to get events', data: null }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ code: 1001, message: 'Unauthorized', data: null }, { status: 401 });
    }
    const body = await request.json();
    const now = Date.now();
    const event = {
      id: uuidv4(),
      userId: session.user.id,
      title: body.title || 'Untitled',
      description: body.description || null,
      startTime: body.startTime,
      endTime: body.endTime,
      color: body.color || '#3B82F6',
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(calendarEvents).values(event);
    return NextResponse.json({ code: 0, message: 'ok', data: event });
  } catch (error) {
    console.error('Calendar POST error:', error);
    return NextResponse.json({ code: 5000, message: 'Failed to create event', data: null }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ code: 1001, message: 'Unauthorized', data: null }, { status: 401 });
    }
    const body = await request.json();
    await db
      .update(calendarEvents)
      .set({ ...body, updatedAt: Date.now() })
      .where(eq(calendarEvents.id, body.id));
    return NextResponse.json({ code: 0, message: 'ok' });
  } catch (error) {
    console.error('Calendar PUT error:', error);
    return NextResponse.json({ code: 5000, message: 'Failed to update event', data: null }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ code: 1001, message: 'Unauthorized', data: null }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ code: 400, message: 'id required', data: null }, { status: 400 });
    await db.delete(calendarEvents).where(eq(calendarEvents.id, id));
    return NextResponse.json({ code: 0, message: 'ok' });
  } catch (error) {
    console.error('Calendar DELETE error:', error);
    return NextResponse.json({ code: 5000, message: 'Failed to delete event', data: null }, { status: 500 });
  }
}
