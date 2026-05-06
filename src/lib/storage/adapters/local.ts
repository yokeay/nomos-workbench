import { v4 as uuidv4 } from 'uuid'
import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'
import type { StorageAdapter, UploadResult } from '../types'

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads', 'memos')
const MAX_SIZE = 10 * 1024 * 1024

export function createLocalAdapter(): StorageAdapter {
  return {
    async upload(file: File): Promise<UploadResult> {
      if (file.size > MAX_SIZE) {
        throw new Error(`File ${file.name} exceeds 10MB limit`)
      }

      await mkdir(UPLOAD_DIR, { recursive: true })

      const ext = file.name.split('.').pop() || 'bin'
      const id = uuidv4()
      const filename = `${id}.${ext}`
      const filepath = join(UPLOAD_DIR, filename)

      const buffer = Buffer.from(await file.arrayBuffer())
      await writeFile(filepath, buffer)

      return {
        id,
        filename: file.name,
        url: `/uploads/memos/${filename}`,
        size: file.size,
        mimeType: file.type,
      }
    },
  }
}
