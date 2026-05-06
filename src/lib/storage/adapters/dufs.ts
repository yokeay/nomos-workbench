import { v4 as uuidv4 } from 'uuid'
import type { StorageAdapter, DufsConfig, UploadResult } from '../types'

const MAX_SIZE = 10 * 1024 * 1024

export function createDufsAdapter(config: DufsConfig): StorageAdapter {
  const baseUrl = config.serverUrl.replace(/\/$/, '')

  return {
    async upload(file: File): Promise<UploadResult> {
      if (file.size > MAX_SIZE) {
        throw new Error(`File ${file.name} exceeds 10MB limit`)
      }

      const ext = file.name.split('.').pop() || 'bin'
      const id = uuidv4()
      const filename = `${id}.${ext}`

      const buffer = Buffer.from(await file.arrayBuffer())

      const headers: Record<string, string> = {
        'Content-Type': file.type || 'application/octet-stream',
      }
      if (config.authKey) {
        const encoded = Buffer.from(`nomos:${config.authKey}`).toString('base64')
        headers['Authorization'] = `Basic ${encoded}`
      }

      const res = await fetch(`${baseUrl}/${filename}`, {
        method: 'PUT',
        body: buffer,
        headers,
      })

      if (!res.ok) {
        throw new Error(`DUFS upload failed: ${res.status} ${res.statusText}`)
      }

      return {
        id,
        filename: file.name,
        url: `${baseUrl}/${filename}`,
        size: file.size,
        mimeType: file.type,
      }
    },
  }
}
