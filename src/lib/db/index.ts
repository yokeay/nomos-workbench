import * as schema from './schema';
import type { InferInsertModel } from 'drizzle-orm';


// ==================== 业务前缀配置 ====================
const ENV = process.env.NOMOS_ENV || 'dev';
export const BUSINESS_PREFIX: string =
  process.env.BUSINESS_PREFIX ?? `nomos_${ENV === 'staging' ? 'stg' : ENV === 'production' ? 'prod' : 'dev'}_`;

// 定义表名映射
export const TABLES = {
  users: `${BUSINESS_PREFIX}users`,
  aiConfigs: `${BUSINESS_PREFIX}ai_configs`,
  chatSessions: `${BUSINESS_PREFIX}chat_sessions`,
  chatMessages: `${BUSINESS_PREFIX}chat_messages`,
  knowledgeFiles: `${BUSINESS_PREFIX}knowledge_files`,
  timelineAiEvents: `${BUSINESS_PREFIX}timeline_ai_events`,
  newsItems: `${BUSINESS_PREFIX}news_items`,
  newsSources: `${BUSINESS_PREFIX}news_sources`,
  sessions: `${BUSINESS_PREFIX}sessions`,
  verificationTokens: `${BUSINESS_PREFIX}verification_tokens`,
  auditLogs: `${BUSINESS_PREFIX}audit_logs`,
  memos: `${BUSINESS_PREFIX}memos`,
  memoAttachments: `${BUSINESS_PREFIX}memo_attachments`,
  calendarEvents: `${BUSINESS_PREFIX}calendar_events`,
} as const;

// ==================== Lazy DB connection ====================
// Uses eval('require') to bypass webpack static analysis of better-sqlite3
// native addon, which crashes the dev server during compilation.

const dynamicRequire = eval('require') as NodeRequire;

let _db: ReturnType<typeof import('drizzle-orm/better-sqlite3').drizzle> | null = null;

function getDbPath(): string {
  const dbPath = process.env.DATABASE_URL || dynamicRequire('path').join(process.cwd(), 'data', 'workbench.db');
  const dataDir = dynamicRequire('path').dirname(dbPath);
  if (!dynamicRequire('fs').existsSync(dataDir)) {
    dynamicRequire('fs').mkdirSync(dataDir, { recursive: true });
  }
  return dbPath;
}

function initDb() {
  const Database = dynamicRequire('better-sqlite3');
  const { drizzle } = dynamicRequire('drizzle-orm/better-sqlite3');
  const sqlite = new Database(getDbPath());
  sqlite.pragma('journal_mode = WAL');
  _db = drizzle(sqlite, { schema }) as any;
}

// Proxy that lazily initializes the db on first access
export const db = new Proxy({} as NonNullable<typeof _db>, {
  get(_target, prop, receiver) {
    if (!_db) initDb();
    return Reflect.get(_db as object, prop, receiver);
  },
});

// 导出类型
export type { InferInsertModel };

// 导出所有表
export * from './schema';
