import { db, knowledgeFiles } from '@/lib/db';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data', 'knowledge');

/**
 * Load all knowledge files for a user and concatenate their content
 */
export async function loadKnowledgeFiles(userId: string): Promise<string> {
  try {
    // Get user's knowledge files from database
    const files = await db
      .select()
      .from(knowledgeFiles)
      .where(eq(knowledgeFiles.userId, userId));

    if (files.length === 0) {
      return '';
    }

    const contents: string[] = [];

    for (const file of files) {
      const filePath = path.join(DATA_DIR, file.filepath);

      if (fs.existsSync(filePath)) {
        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          contents.push(`\n--- File: ${file.filename} ---\n${content}\n`);
        } catch (err) {
          console.error(`Failed to read knowledge file: ${filePath}`, err);
        }
      }
    }

    return contents.join('\n');
  } catch (error) {
    console.error('Failed to load knowledge files:', error);
    return '';
  }
}

/**
 * Get file extension to determine if supported
 */
export function isSupportedFile(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  const supportedExtensions = [
    '.txt', '.md', '.markdown',
    '.pdf', '.doc', '.docx',
    '.json', '.xml', '.csv',
    '.html', '.htm'
  ];
  return supportedExtensions.includes(ext);
}

/**
 * Calculate content hash for change detection
 */
export function calculateContentHash(content: string): string {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(content).digest('hex');
}