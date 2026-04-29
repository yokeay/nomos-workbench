import { auth } from '@/lib/auth';
import { db, users } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ code: 1001, message: 'Unauthorized', data: null }, { status: 401 });
    }
    const [user] = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1);
    if (!user) return NextResponse.json({ code: 404, message: 'Not found', data: null }, { status: 404 });
    return NextResponse.json({ code: 0, message: 'ok', data: { name: user.name, email: user.email, avatar: user.avatar, theme: user.theme } });
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json({ code: 5000, message: 'Failed to get profile', data: null }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ code: 1001, message: 'Unauthorized', data: null }, { status: 401 });
    }
    const body = await request.json();
    await db.update(users).set({ name: body.name, avatar: body.avatar, theme: body.theme, updatedAt: Date.now() }).where(eq(users.id, session.user.id));
    return NextResponse.json({ code: 0, message: 'ok' });
  } catch (error) {
    console.error('Profile PUT error:', error);
    return NextResponse.json({ code: 5000, message: 'Failed to update profile', data: null }, { status: 500 });
  }
}
