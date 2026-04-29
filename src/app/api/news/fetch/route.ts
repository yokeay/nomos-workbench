import { auth } from '@/lib/auth';
import { fetchNews, seedDefaultSources } from '@/lib/rss';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ code: 1001, message: 'Unauthorized', data: null }, { status: 401 });
    }
    await seedDefaultSources(session.user.id);
    const count = await fetchNews(session.user.id);
    return NextResponse.json({ code: 0, message: 'ok', data: { count } });
  } catch (error) {
    console.error('News fetch error:', error);
    return NextResponse.json({ code: 5000, message: 'Failed to fetch news', data: null }, { status: 500 });
  }
}
