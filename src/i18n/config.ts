export const LOCALES = {
  zh: { name: '中文', dir: 'ltr' as const },
  en: { name: 'English', dir: 'ltr' as const },
} as const;

export type Locale = keyof typeof LOCALES;

export const DEFAULT_LOCALE: Locale = 'zh';

export const TRANSLATIONS = {
  zh: {
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
      tryAgain: '重试',
      somethingWentWrong: '出错了',
    },
    chat: {
      title: 'AI 聊天',
      placeholder: '输入消息...',
      modelSelector: '模型',
      streaming: '...',
      userLabel: '你',
      aiLabel: 'AI',
    },
    sidebar: {
      dashboard: '仪表盘',
      calendar: '日历',
      settings: '设置',
      terminal: '终端',
    },
    header: {
      search: '搜索任意内容...',
      lightMode: '☀️ 浅色模式',
      darkMode: '🌙 深色模式',
      language: '🌐 语言',
      chinese: '中文',
      english: 'English',
    },
    timeline: {
      ai: 'AI',
      news: '新闻',
      aiPlaceholder: 'AI 事件将实时显示在这里',
      newsPlaceholder: '新闻将实时显示在这里',
    },
    terminal: {
      title: '终端',
    },
    settings: {
      title: '设置',
      profile: '个人资料',
      apiKeys: 'API 密钥',
      theme: '主题',
      language: '语言',
      dark: '深色',
      light: '浅色',
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
      tryAgain: 'Try again',
      somethingWentWrong: 'Something went wrong',
    },
    chat: {
      title: 'AI Chat',
      placeholder: 'Type your message...',
      modelSelector: 'Model',
      streaming: '...',
      userLabel: 'You',
      aiLabel: 'AI',
    },
    sidebar: {
      dashboard: 'Dashboard',
      calendar: 'Calendar',
      settings: 'Settings',
      terminal: 'Terminal',
    },
    header: {
      search: 'Search anything...',
      lightMode: '☀️ Light Mode',
      darkMode: '🌙 Dark Mode',
      language: '🌐 Language',
      chinese: '中文',
      english: 'English',
    },
    timeline: {
      ai: 'AI',
      news: 'News',
      aiPlaceholder: 'AI events will appear here in real-time',
      newsPlaceholder: 'News items will appear here in real-time',
    },
    terminal: {
      title: 'Terminal',
    },
    settings: {
      title: 'Settings',
      profile: 'Profile',
      apiKeys: 'API Keys',
      theme: 'Theme',
      language: 'Language',
      dark: 'Dark',
      light: 'Light',
    },
  },
} as const;

export const getTranslations = (locale: Locale) => TRANSLATIONS[locale];
