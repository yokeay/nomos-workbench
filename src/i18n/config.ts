/**
 * i18n Configuration
 * 国际化配置文件
 */

export const LOCALES = {
  zh: { name: '中文', dir: 'ltr' as const },
  en: { name: 'English', dir: 'ltr' as const },
} as const;

export type Locale = keyof typeof LOCALES;

export const DEFAULT_LOCALE: Locale = 'zh';

export const TRANSLATIONS = {
  zh: {
    // 通用
    common: {
      search: '搜索...',
      send: '发送',
      loading: '加载中...',
      error: '错误',
      success: '成功',
      confirm: '确认',
      cancel: '取消',
      settings: '设置',
      profile: '个人资料',
      logout: '退出',
    },
    // AI Chat
    chat: {
      title: 'AI 聊天',
      placeholder: '输入消息...',
      modelSelector: '模型选择',
    },
    // Sidebar
    sidebar: {
      dashboard: '仪表盘',
      calendar: '日历',
      settings: '设置',
      terminal: '终端',
    },
    // Header
    header: {
      search: '搜索任意内容...',
      date: '日期',
      lightMode: '☀️ 浅色模式',
      darkMode: '🌙 深色模式',
    },
    // Timeline
    timeline: {
      ai: 'AI',
      news: '新闻',
    },
  },
  en: {
    common: {
      search: 'Search...',
      send: 'Send',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      confirm: 'Confirm',
      cancel: 'Cancel',
      settings: 'Settings',
      profile: 'Profile',
      logout: 'Logout',
    },
    chat: {
      title: 'AI Chat',
      placeholder: 'Type your message...',
      modelSelector: 'Model Selector',
    },
    sidebar: {
      dashboard: 'Dashboard',
      calendar: 'Calendar',
      settings: 'Settings',
      terminal: 'Terminal',
    },
    header: {
      search: 'Search anything...',
      date: 'Date',
      lightMode: '☀️ Light Mode',
      darkMode: '🌙 Dark Mode',
    },
    timeline: {
      ai: 'AI',
      news: 'News',
    },
  },
} as const;

export const getTranslations = (locale: Locale) => TRANSLATIONS[locale];
