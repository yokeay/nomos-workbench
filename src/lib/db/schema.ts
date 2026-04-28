import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

// =====================
// Business Prefix
// =====================
// 按环境区分：nomos_dev_ / nomos_stg_ / nomos_prod_
const ENV = process.env.NOMOS_ENV || 'dev';
export const BUSINESS_PREFIX: string =
  process.env.BUSINESS_PREFIX ?? `nomos_${ENV === 'staging' ? 'stg' : ENV === 'production' ? 'prod' : 'dev'}_`;

// Users table
export const users = sqliteTable(`${BUSINESS_PREFIX}users`, {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  avatar: text('avatar'),
  totpSecret: text('totp_secret'),
  totpEnabled: integer('totp_enabled').default(0),
  theme: text('theme').default('dark'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

// AI model configurations
export const aiConfigs = sqliteTable(`${BUSINESS_PREFIX}ai_configs`, {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  provider: text('provider').notNull(),
  model: text('model').notNull(),
  apiKey: text('api_key'),
  baseUrl: text('base_url'),
  isActive: integer('is_active').default(0),
  priority: integer('priority').default(0),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

// Chat sessions
export const chatSessions = sqliteTable(`${BUSINESS_PREFIX}chat_sessions`, {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  model: text('model'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

// Chat messages
export const chatMessages = sqliteTable(`${BUSINESS_PREFIX}chat_messages`, {
  id: text('id').primaryKey(),
  sessionId: text('session_id').notNull().references(() => chatSessions.id),
  role: text('role').notNull(),
  content: text('content').notNull(),
  tokens: integer('tokens'),
  createdAt: integer('created_at').notNull(),
}, (table) => ({
  sessionIdx: index('chat_messages_session_idx').on(table.sessionId),
}));

// Knowledge files
export const knowledgeFiles = sqliteTable(`${BUSINESS_PREFIX}knowledge_files`, {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  filename: text('filename').notNull(),
  filepath: text('filepath').notNull(),
  size: integer('size'),
  contentHash: text('content_hash'),
  createdAt: integer('created_at').notNull(),
});

// AI timeline events
export const timelineAiEvents = sqliteTable(`${BUSINESS_PREFIX}timeline_ai_events`, {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  type: text('type').notNull(),
  content: text('content').notNull(),
  eventDate: text('event_date').notNull(),
  createdAt: integer('created_at').notNull(),
}, (table) => ({
  userDateIdx: index('timeline_ai_user_date_idx').on(table.userId, table.eventDate),
}));

// News items
export const newsItems = sqliteTable(`${BUSINESS_PREFIX}news_items`, {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  summary: text('summary'),
  url: text('url').notNull(),
  source: text('source').notNull(),
  publishedAt: integer('published_at').notNull(),
  eventDate: text('event_date').notNull(),
  createdAt: integer('created_at').notNull(),
}, (table) => ({
  userDateIdx: index('news_items_user_date_idx').on(table.userId, table.eventDate),
  publishedIdx: index('news_items_published_idx').on(table.publishedAt),
}));

// News sources (RSS subscriptions)
export const newsSources = sqliteTable(`${BUSINESS_PREFIX}news_sources`, {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  url: text('url').notNull(),
  category: text('category'),
  isActive: integer('is_active').default(1),
  fetchInterval: integer('fetch_interval').default(300),
  lastFetchAt: integer('last_fetch_at'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

// =====================
// Auth Tables (NextAuth v5)
// =====================

export const sessions = sqliteTable(`${BUSINESS_PREFIX}sessions`, {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  expires: integer('expires').notNull(),
  sessionToken: text('session_token').unique().notNull(),
});

export const verificationTokens = sqliteTable(`${BUSINESS_PREFIX}verification_tokens`, {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: integer('expires').notNull(),
});

// =====================
// Audit Logs
// =====================

export const auditLogs = sqliteTable(`${BUSINESS_PREFIX}audit_logs`, {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  action: text('action').notNull(),
  detail: text('detail'),
  ip: text('ip'),
  createdAt: integer('created_at').notNull(),
});

// =====================
// Type exports
// =====================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type AiConfig = typeof aiConfigs.$inferSelect;
export type NewAiConfig = typeof aiConfigs.$inferInsert;

export type ChatSession = typeof chatSessions.$inferSelect;
export type NewChatSession = typeof chatSessions.$inferInsert;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type NewChatMessage = typeof chatMessages.$inferInsert;

export type KnowledgeFile = typeof knowledgeFiles.$inferSelect;
export type NewKnowledgeFile = typeof knowledgeFiles.$inferInsert;

export type TimelineAiEvent = typeof timelineAiEvents.$inferSelect;
export type NewTimelineAiEvent = typeof timelineAiEvents.$inferInsert;

export type NewsItem = typeof newsItems.$inferSelect;
export type NewNewsItem = typeof newsItems.$inferInsert;

export type NewsSource = typeof newsSources.$inferSelect;
export type NewNewsSource = typeof newsSources.$inferInsert;

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;