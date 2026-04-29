import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { encrypt, decrypt } from '@/lib/crypto';

const BACKUP_DIR = path.join(process.cwd(), 'data', 'backups');

function ensureDir() {
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

export async function createBackup(): Promise<string> {
  ensureDir();
  const dbPath = process.env.DATABASE_URL || path.join(process.cwd(), 'data', 'workbench.db');
  const backupName = `nomos-workbench-${new Date().toISOString().replace(/[:.]/g, '')}.db.enc`;
  const backupPath = path.join(BACKUP_DIR, backupName);

  // Use SQLite backup API for consistency
  const tmpPath = backupPath.replace('.enc', '.tmp');
  const src = new Database(dbPath);
  await src.backup(tmpPath);
  src.close();

  // Encrypt
  const raw = fs.readFileSync(backupPath.replace('.enc', '.tmp'));
  const metadata = JSON.stringify({ created: Date.now(), size: raw.length });
  const encrypted = encrypt(raw.toString('base64') + ':::' + metadata);
  fs.writeFileSync(backupPath, encrypted);
  fs.unlinkSync(backupPath.replace('.enc', '.tmp'));

  return backupName;
}

export function restoreFromBackup(backupName: string): boolean {
  const backupPath = path.join(BACKUP_DIR, backupName);
  if (!fs.existsSync(backupPath)) return false;

  const encrypted = fs.readFileSync(backupPath, 'utf8');
  const decrypted = decrypt(encrypted);
  const idx = decrypted.indexOf(':::');
  if (idx === -1) return false;
  const b64 = decrypted.slice(0, idx);
  const raw = Buffer.from(b64, 'base64');

  const dbPath = process.env.DATABASE_URL || path.join(process.cwd(), 'data', 'workbench.db');
  fs.writeFileSync(dbPath, raw);
  return true;
}

export function listBackups(): Array<{ name: string; size: number; created: number }> {
  ensureDir();
  if (!fs.existsSync(BACKUP_DIR)) return [];

  const files = fs.readdirSync(BACKUP_DIR);
  const result: Array<{ name: string; size: number; created: number }> = [];

  for (const f of files) {
    if (!f.endsWith('.db.enc')) continue;
    const stat = fs.statSync(path.join(BACKUP_DIR, f));
    // Extract date from filename
    const match = f.match(/(\d{4}-\d{2}-\d{2}T\d{2}\d{2}\d{2})/);
    const created = match ? new Date(match[1]).getTime() : 0;
    result.push({ name: f, size: stat.size, created });
  }

  return result.sort((a, b) => b.created - a.created);
}

export function deleteBackup(backupName: string): boolean {
  const p = path.join(BACKUP_DIR, backupName);
  if (fs.existsSync(p)) {
    fs.unlinkSync(p);
    return true;
  }
  return false;
}

// Clean backups older than 30 days
export function cleanupOldBackups() {
  const backups = listBackups();
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  for (const b of backups) {
    if (b.created < cutoff) deleteBackup(b.name);
  }
}
