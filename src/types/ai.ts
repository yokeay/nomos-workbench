// AI Message types
export interface Message {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt?: number;
}

export interface ChatSession {
  id: string;
  title: string;
  model?: string;
  createdAt: number;
  updatedAt: number;
}

export interface AIConfig {
  id: string;
  provider: string;
  model: string;
  apiKey?: string;
  baseUrl?: string;
  isActive: boolean;
  priority: number;
}

// Timeline types
export interface TimelineEvent {
  id: string;
  type: 'ai_response' | 'command_output' | 'system_notification' | 'user_action';
  content: {
    message: string;
    model?: string;
    sessionId?: string;
    command?: string;
  };
  eventDate: string;
  createdAt: number;
}

export interface NewsItem {
  id: string;
  title: string;
  summary?: string;
  url: string;
  source: string;
  publishedAt: number;
  eventDate: string;
}

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  theme: 'dark' | 'light';
  totpEnabled: boolean;
}

// API Response types
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T | null;
}

// Error codes
export const ErrorCodes = {
  TOKEN_EXPIRED: 1001,
  PERMISSION_DENIED: 1002,
  TOTP_VERIFY_FAILED: 1003,
  TOTP_NOT_SET: 1004,
  AI_PROVIDER_ERROR: 2001,
  AI_MODEL_NOT_CONFIGURED: 2002,
  KNOWLEDGE_FILE_ERROR: 2003,
  NEWS_SOURCE_PARSE_ERROR: 3001,
  FILE_UPLOAD_ERROR: 4001,
  FILE_TYPE_NOT_SUPPORTED: 4002,
  FILE_SIZE_EXCEEDED: 4003,
  DB_ERROR: 5001,
} as const;