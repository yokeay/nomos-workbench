import { auth } from '@/lib/auth';
import { getNewsItems } from '@/lib/rss';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ code: 1001, message: 'Unauthorized', data: null }, { status: 401 });
    }
    const items = await getNewsItems(session.user.id);
    return NextResponse.json({ code: 0, message: 'ok', data: items });
  } catch (error) {
    console.error('News list error:', error);
    return NextResponse.json({ code: 5000, message: 'Failed to list news', data: null }, { status: 500 });
  }
}
