export type StorageProvider = 'local' | 's3' | 'dufs'

export interface S3Config {
  endpoint: string
  region: string
  bucket: string
  accessKey: string
  secretKey: string
  publicUrl?: string
}

export interface DufsConfig {
  serverUrl: string
  authKey: string
}

export interface UploadResult {
  id: string
  filename: string
  url: string
  size: number
  mimeType: string
}

export interface StorageAdapter {
  upload(file: File): Promise<UploadResult>
}
