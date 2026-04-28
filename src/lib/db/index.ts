import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import type { InferInsertModel } from 'drizzle-orm';
import path from 'path';
import fs from 'fs';

// ==================== 业务前缀配置 ====================
// 从环境变量读取业务前缀
// 默认值: nomos_
const BUSINESS_PREFIX = process.env.BUSINESS_PREFIX || 'nomos_';

// 定义表名映射
const TABLES = {
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
} as const;

// ==================== 数据库路径 ====================
const dbPath = process.env.DATABASE_URL || path.join(process.cwd(), 'data', 'workbench.db');

// 确保数据目录存在
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// ==================== 数据库连接 ====================
const sqlite = new Database(dbPath);

// 启用 WAL 模式
sqlite.pragma('journal_mode = WAL');

// ==================== Drizzle 实例 ====================
// 使用 sqliteTable 中的表名（需要单独处理）
export const db = drizzle(sqlite, { schema });

// 导出配置常量
export { BUSINESS_PREFIX, TABLES };

// 导出类型
export type { InferInsertModel };

// 导出所有表
export * from './schema';
