import { NextRequest, NextResponse } from 'next/server'
import { db, storageConfig } from '@/lib/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const filename = path.join('/')

  const rows = db.select().from(storageConfig).all()
  const row = rows[0]
  if (!row) {
    return new NextResponse('Not Found', { status: 404 })
  }

  let config: any = {}
  try { config = JSON.parse(row.config) } catch { /* */ }

  const baseUrl = (config.serverUrl || '').replace(/\/$/, '')
  const url = `${baseUrl}/${filename}`

  const headers: Record<string, string> = {}
  if (config.authKey) {
    const encoded = Buffer.from(`nomos:${config.authKey}`).toString('base64')
    headers['Authorization'] = `Basic ${encoded}`
  }

  try {
    const res = await fetch(url, { headers })
    if (!res.ok) {
      return new NextResponse('Not Found', { status: 404 })
    }

    const buffer = Buffer.from(await res.arrayBuffer())
    const contentType = res.headers.get('content-type') || 'application/octet-stream'

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=604800',
      },
    })
  } catch {
    return new NextResponse('Proxy Error', { status: 502 })
  }
}
