import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'
import type { StorageAdapter, S3Config, UploadResult } from '../types'

const MAX_SIZE = 10 * 1024 * 1024

export function createS3Adapter(config: S3Config): StorageAdapter {
  const s3 = new S3Client({
    endpoint: config.endpoint,
    region: config.region,
    credentials: {
      accessKeyId: config.accessKey,
      secretAccessKey: config.secretKey,
    },
    forcePathStyle: true,
  })

  return {
    async upload(file: File): Promise<UploadResult> {
      if (file.size > MAX_SIZE) {
        throw new Error(`File ${file.name} exceeds 10MB limit`)
      }

      const ext = file.name.split('.').pop() || 'bin'
      const id = uuidv4()
      const key = `memos/${id}.${ext}`

      const buffer = Buffer.from(await file.arrayBuffer())

      await s3.send(new PutObjectCommand({
        Bucket: config.bucket,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      }))

      const baseUrl = config.publicUrl || config.endpoint
      const url = `${baseUrl.replace(/\/$/, '')}/${config.bucket}/${key}`

      return {
        id,
        filename: file.name,
        url,
        size: file.size,
        mimeType: file.type,
      }
    },
  }
}
