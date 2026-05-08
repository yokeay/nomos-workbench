import { auth } from '@/lib/auth';
import { db, userSettings } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

const DEFAULTS = {
  theme: 'dark',
  locale: 'zh',
  newsFilter: '[]',
  terminalWsUrl: '',
  storageProvider: 'local',
  storageConfig: '{}',
  searchEngines: '[]',
};

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ code: 1001, message: 'Unauthorized', data: null }, { status: 401 });
    }

    const rows = await db.select().from(userSettings).where(eq(userSettings.userId, session.user.id)).limit(1);
    const row = rows[0];

    if (!row) {
      return NextResponse.json({ code: 0, message: 'ok', data: DEFAULTS });
    }

    // Mask sensitive storage config keys
    let sc: any = {};
    try { sc = JSON.parse(row.storageConfig) } catch { /* */ }
    if (sc.secretKey && sc.secretKey.length > 0) sc = { ...sc, secretKey: '••••' };
    if (sc.authKey && sc.authKey.length > 0) sc = { ...sc, authKey: '••••' };

    // Also check legacy storageConfig table for migration
    let storageProvider = row.storageProvider;
    let storageConfig = JSON.stringify(sc);
    if (storageProvider === 'local') {
      try {
        const { storageConfig: legacyStorage } = await import('@/lib/db');
        const { db: db2 } = await import('@/lib/db');
        // Only pull from legacy if user_settings has default and legacy table has data
      } catch { /* ignore */ }
    }

    return NextResponse.json({
      code: 0,
      message: 'ok',
      data: {
        theme: row.theme,
        locale: row.locale,
        newsFilter: row.newsFilter,
        terminalWsUrl: row.terminalWsUrl,
        storageProvider: row.storageProvider,
        storageConfig: JSON.stringify(sc),
        searchEngines: row.searchEngines ?? DEFAULTS.searchEngines,
      },
    });
  } catch (error) {
    console.error('Preferences GET error:', error);
    return NextResponse.json({ code: 5000, message: 'Failed to get preferences', data: null }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ code: 1001, message: 'Unauthorized', data: null }, { status: 401 });
    }

    const body = await request.json();
    const now = Date.now();

    const rows = await db.select().from(userSettings).where(eq(userSettings.userId, session.user.id)).limit(1);
    const existing = rows[0];

    // Merge storage config: keep old secret if masked
    let sc = body.storageConfig;
    if (existing) {
      let oldSc: any = {};
      try { oldSc = JSON.parse(existing.storageConfig) } catch { /* */ }
      if (sc) {
        let newSc: any = typeof sc === 'string' ? JSON.parse(sc) : sc;
        if (newSc.secretKey === '••••' && oldSc.secretKey) newSc.secretKey = oldSc.secretKey;
        if (newSc.authKey === '••••' && oldSc.authKey) newSc.authKey = oldSc.authKey;
        sc = JSON.stringify(newSc);
      }
    }

    const values = {
      theme: body.theme ?? existing?.theme ?? DEFAULTS.theme,
      locale: body.locale ?? existing?.locale ?? DEFAULTS.locale,
      newsFilter: body.newsFilter ?? existing?.newsFilter ?? DEFAULTS.newsFilter,
      terminalWsUrl: body.terminalWsUrl ?? existing?.terminalWsUrl ?? DEFAULTS.terminalWsUrl,
      storageProvider: body.storageProvider ?? existing?.storageProvider ?? DEFAULTS.storageProvider,
      storageConfig: typeof sc === 'string' ? sc : (existing?.storageConfig ?? DEFAULTS.storageConfig),
      searchEngines: body.searchEngines ?? existing?.searchEngines ?? DEFAULTS.searchEngines,
      updatedAt: now,
    };

    if (existing) {
      await db.update(userSettings).set(values).where(eq(userSettings.id, existing.id));
    } else {
      await db.insert(userSettings).values({
        userId: session.user.id,
        ...values,
        createdAt: now,
      });
    }

    return NextResponse.json({ code: 0, message: 'ok' });
  } catch (error) {
    console.error('Preferences PUT error:', error);
    return NextResponse.json({ code: 5000, message: 'Failed to save preferences', data: null }, { status: 500 });
  }
}
