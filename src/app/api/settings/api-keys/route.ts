import { auth } from '@/lib/auth';
import { db, aiConfigs } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { encrypt } from '@/lib/crypto';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ code: 1001, message: 'Unauthorized', data: null }, { status: 401 });
    }
    const configs = await db
      .select({
        id: aiConfigs.id,
        provider: aiConfigs.provider,
        model: aiConfigs.model,
        modelsJson: aiConfigs.modelsJson,
        isActive: aiConfigs.isActive,
        baseUrl: aiConfigs.baseUrl,
        hasKey: aiConfigs.apiKey,
      })
      .from(aiConfigs)
      .where(eq(aiConfigs.userId, session.user.id));
    const safe = configs.map(c => {
      const { hasKey, ...rest } = c;
      let models: string[] | null = null;
      if (c.modelsJson) {
        try { models = JSON.parse(c.modelsJson); } catch {}
      }
      return { ...rest, hasKey: !!hasKey, models };
    });
    return NextResponse.json({ code: 0, message: 'ok', data: safe });
  } catch (error) {
    console.error('API keys GET error:', error);
    return NextResponse.json({ code: 5000, message: 'Failed to get API keys', data: null }, { status: 500 });
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
    const config = {
      id: uuidv4(),
      userId: session.user.id,
      provider: body.provider,
      model: body.model,
      apiKey: body.apiKey ? encrypt(body.apiKey) : null,
      baseUrl: body.baseUrl || null,
      modelsJson: body.modelsJson ? (Array.isArray(body.modelsJson) ? JSON.stringify(body.modelsJson) : body.modelsJson) : null,
      isActive: body.isActive ? 1 : 0,
      priority: body.priority || 0,
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(aiConfigs).values(config);
    return NextResponse.json({ code: 0, message: 'ok', data: { id: config.id } });
  } catch (error) {
    console.error('API keys POST error:', error);
    return NextResponse.json({ code: 5000, message: 'Failed to save API key', data: null }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ code: 1001, message: 'Unauthorized', data: null }, { status: 401 });
    }
    const body = await request.json();
    const updates: Record<string, any> = { updatedAt: Date.now() };
    if (body.isActive !== undefined) updates.isActive = body.isActive ? 1 : 0;
    if (body.priority !== undefined) updates.priority = body.priority;
    if (body.apiKey) updates.apiKey = encrypt(body.apiKey);
    if (body.baseUrl !== undefined) updates.baseUrl = body.baseUrl;
    if (body.model) updates.model = body.model;
    if (body.modelsJson !== undefined) {
      updates.modelsJson = Array.isArray(body.modelsJson) ? JSON.stringify(body.modelsJson) : body.modelsJson;
    }
    await db.update(aiConfigs).set(updates).where(and(eq(aiConfigs.id, body.id), eq(aiConfigs.userId, session.user.id)));
    return NextResponse.json({ code: 0, message: 'ok' });
  } catch (error) {
    console.error('API keys PUT error:', error);
    return NextResponse.json({ code: 5000, message: 'Failed to update API key', data: null }, { status: 500 });
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
    await db.delete(aiConfigs).where(and(eq(aiConfigs.id, id), eq(aiConfigs.userId, session.user.id)));
    return NextResponse.json({ code: 0, message: 'ok' });
  } catch (error) {
    console.error('API keys DELETE error:', error);
    return NextResponse.json({ code: 5000, message: 'Failed to delete API key', data: null }, { status: 500 });
  }
}
