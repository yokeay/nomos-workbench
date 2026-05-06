import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getStorageAdapter } from '@/lib/storage'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ code: 1001, message: 'Unauthorized', data: null }, { status: 401 })
    }

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (!files.length) {
      return NextResponse.json({ code: 1003, message: 'No files provided', data: null }, { status: 400 })
    }

    const adapter = await getStorageAdapter()

    const results = []
    for (const file of files) {
      try {
        const result = await adapter.upload(file)
        results.push(result)
      } catch (e: any) {
        console.error('Upload error for', file.name, ':', e.message)
      }
    }

    return NextResponse.json({ code: 0, message: 'ok', data: results })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ code: 5000, message: 'Upload failed', data: null }, { status: 500 })
  }
}
