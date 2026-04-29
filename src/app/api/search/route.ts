import { auth } from '@/lib/auth';
import { db, chatMessages, chatSessions, calendarEvents, newsItems } from '@/lib/db';
import { eq, like, and, desc } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ code: 1001, message: 'Unauthorized', data: null }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    if (!q) return NextResponse.json({ code: 0, message: 'ok', data: { chats: [], events: [], news: [] } });

    const userId = session.user.id;
    const pattern = `%${q}%`;

    // Search calendar events
    const events = await db
      .select()
      .from(calendarEvents)
      .where(and(eq(calendarEvents.userId, userId), like(calendarEvents.title, pattern)))
      .orderBy((t) => desc(t.startTime))
      .limit(20);

    // Search news
    const news = await db
      .select()
      .from(newsItems)
      .where(and(eq(newsItems.userId, userId), like(newsItems.title, pattern)))
      .orderBy((t) => desc(t.publishedAt))
      .limit(20);

    return NextResponse.json({ code: 0, message: 'ok', data: { chats: [], events, news } });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ code: 5000, message: 'Search failed', data: null }, { status: 500 });
  }
}
