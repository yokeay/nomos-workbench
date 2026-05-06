import { db, storageConfig } from '@/lib/db'
import { createLocalAdapter } from './adapters/local'
import { createS3Adapter } from './adapters/s3'
import { createDufsAdapter } from './adapters/dufs'
import type { StorageAdapter, StorageProvider, S3Config, DufsConfig } from './types'

export type { StorageAdapter, StorageProvider, S3Config, DufsConfig, UploadResult } from './types'

export async function getStorageAdapter(): Promise<StorageAdapter> {
  const rows = db.select().from(storageConfig).all()
  const row = rows[0]

  if (!row) {
    return createLocalAdapter()
  }

  const provider = row.provider as StorageProvider
  let config: any = {}
  try {
    config = JSON.parse(row.config)
  } catch { /* use empty config */ }

  switch (provider) {
    case 's3':
      return createS3Adapter(config as S3Config)
    case 'dufs':
      return createDufsAdapter(config as DufsConfig)
    case 'local':
    default:
      return createLocalAdapter()
  }
}
