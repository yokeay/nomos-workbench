/**
 * Migration: Add role and github_id columns to users table.
 * Run with: npx tsx scripts/migrate-users-roles.ts
 */
import Database from 'better-sqlite3'
import path from 'path'

const ENV = process.env.NOMOS_ENV || 'dev'
const PREFIX = process.env.BUSINESS_PREFIX ?? `nomos_${ENV === 'staging' ? 'stg' : ENV === 'production' ? 'prod' : 'dev'}_`
const TABLE = `${PREFIX}users`

const dbPath = process.env.DATABASE_URL?.replace('file:', '') || path.join(process.cwd(), 'data', 'workbench.db')
const db = new Database(dbPath)
db.pragma('journal_mode = WAL')

console.log(`Migrating table: ${TABLE} at ${dbPath}`)

// Check if columns exist
const cols = db.pragma(`table_info(${TABLE})`) as { name: string }[]
const colNames = cols.map(c => c.name)

if (!colNames.includes('role')) {
  db.exec(`ALTER TABLE ${TABLE} ADD COLUMN role TEXT NOT NULL DEFAULT 'user'`)
  console.log('Added column: role')
} else {
  console.log('Column role already exists, skipping.')
}

if (!colNames.includes('github_id')) {
  db.exec(`ALTER TABLE ${TABLE} ADD COLUMN github_id TEXT`)
  console.log('Added column: github_id')
} else {
  console.log('Column github_id already exists, skipping.')
}

console.log('Migration complete.')
db.close()
