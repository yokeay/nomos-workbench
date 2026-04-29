import { auth } from '@/lib/auth';
import { db, timelineAiEvents } from '@/lib/db';
import { eq, desc } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ code: 1001, message: 'Unauthorized', data: null }, { status: 401 });
    }
    const events = await db
      .select()
      .from(timelineAiEvents)
      .where(eq(timelineAiEvents.userId, session.user.id))
      .orderBy((t) => desc(t.eventDate))
      .limit(50);
    return NextResponse.json({ code: 0, message: 'ok', data: events });
  } catch (error) {
    console.error('Timeline AI error:', error);
    return NextResponse.json({ code: 5000, message: 'Failed to get timeline', data: null }, { status: 500 });
  }
}
