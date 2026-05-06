import { NextRequest, NextResponse } from 'next/server'
import { db, storageConfig } from '@/lib/db'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    const rows = db.select().from(storageConfig).all()
    const row = rows[0]

    if (!row) {
      return NextResponse.json({
        code: 0,
        message: 'ok',
        data: { provider: 'local', config: {} },
      })
    }

    // Deserialize config and mask secretKey
    let config: any = {}
    try { config = JSON.parse(row.config) } catch { /* */ }
    if (config.secretKey && typeof config.secretKey === 'string' && config.secretKey.length > 0) {
      config = { ...config, secretKey: '••••' }
    }

    return NextResponse.json({
      code: 0,
      message: 'ok',
      data: { provider: row.provider, config },
    })
  } catch (error) {
    console.error('Storage config GET error:', error)
    return NextResponse.json({ code: 5000, message: 'Failed to get storage config', data: null }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { provider, config } = body

    if (!['local', 's3', 'dufs'].includes(provider)) {
      return NextResponse.json({ code: 1003, message: 'Invalid provider', data: null }, { status: 400 })
    }

    const now = Math.floor(Date.now() / 1000)
    const rows = db.select().from(storageConfig).all()
    const existing = rows[0]

    // Merge config: if secretKey is masked, keep old value
    let finalConfig = config || {}
    if (existing) {
      let oldConfig: any = {}
      try { oldConfig = JSON.parse(existing.config) } catch { /* */ }
      if (finalConfig.secretKey === '••••' && oldConfig.secretKey) {
        finalConfig.secretKey = oldConfig.secretKey
      }
    }

    if (existing) {
      db.update(storageConfig)
        .set({
          provider,
          config: JSON.stringify(finalConfig),
          updatedAt: now,
        })
        .where(eq(storageConfig.id, existing.id))
        .run()
    } else {
      db.insert(storageConfig)
        .values({
          provider,
          config: JSON.stringify(finalConfig),
          updatedAt: now,
        })
        .run()
    }

    return NextResponse.json({ code: 0, message: 'ok', data: { provider, config: finalConfig } })
  } catch (error) {
    console.error('Storage config PUT error:', error)
    return NextResponse.json({ code: 5000, message: 'Failed to save storage config', data: null }, { status: 500 })
  }
}
