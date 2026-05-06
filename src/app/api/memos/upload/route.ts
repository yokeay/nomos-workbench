import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads', 'memos')
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (!files.length) {
      return NextResponse.json({ code: 1003, message: 'No files provided', data: null }, { status: 400 })
    }

    await mkdir(UPLOAD_DIR, { recursive: true })

    const results = []
    for (const file of files) {
      if (file.size > MAX_SIZE) {
        continue
      }

      const ext = file.name.split('.').pop() || 'bin'
      const id = uuidv4()
      const filename = `${id}.${ext}`
      const filepath = join(UPLOAD_DIR, filename)

      const buffer = Buffer.from(await file.arrayBuffer())
      await writeFile(filepath, buffer)

      results.push({
        id,
        filename: file.name,
        url: `/uploads/memos/${filename}`,
        size: file.size,
        mimeType: file.type,
      })
    }

    return NextResponse.json({ code: 0, message: 'ok', data: results })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ code: 5000, message: 'Upload failed', data: null }, { status: 500 })
  }
}
