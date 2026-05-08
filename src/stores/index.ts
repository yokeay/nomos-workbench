'use client';

import { create } from 'zustand';
import { Message, ChatSession } from '@/types/ai';
import type { Locale } from '@/i18n/config';
import i18n from '@/lib/i18n';
import { savePreferences } from '@/lib/preferences-client';

interface ChatState {
  currentSessionId: string | null;
  sessions: ChatSession[];
  messages: Map<string, Message[]>;

  isStreaming: boolean;
  streamingContent: string;

  setCurrentSession: (sessionId: string | null) => void;
  addMessage: (sessionId: string, message: Message) => void;
  updateStreamingMessage: (content: string) => void;
  clearMessages: (sessionId: string) => void;
  setSessions: (sessions: ChatSession[]) => void;
  setStreaming: (isStreaming: boolean) => void;
  resetStreaming: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  currentSessionId: null,
  sessions: [],
  messages: new Map(),
  isStreaming: false,
  streamingContent: '',

  setCurrentSession: (sessionId) => set({ currentSessionId: sessionId }),

  addMessage: (sessionId, message) => {
    const currentMessages = get().messages.get(sessionId) || [];
    const updatedMessages = new Map(get().messages);
    updatedMessages.set(sessionId, [...currentMessages, message]);
    set({ messages: updatedMessages });
  },
  updateStreamingMessage: (content) => set({ streamingContent: content }),
  clearMessages: (sessionId) => {
    const updatedMessages = new Map(get().messages);
    updatedMessages.delete(sessionId);
    set({ messages: updatedMessages });
  },
  setSessions: (sessions) => set({ sessions }),
  setStreaming: (isStreaming) => set({ isStreaming }),
  resetStreaming: () => set({ isStreaming: false, streamingContent: '' }),
}));

interface TerminalState {
  isOpen: boolean;
  isMaximized: boolean;
  position: 'top' | 'bottom' | 'float';
  zIndex: number;

  open: () => void;
  close: () => void;
  toggleMaximize: () => void;
  setPosition: (position: 'top' | 'bottom' | 'float') => void;
  bringToFront: () => void;
}

export const useTerminalStore = create<TerminalState>((set) => ({
  isOpen: false,
  isMaximized: false,
  position: 'top',
  zIndex: 1,

  open: () => set({ isOpen: true, position: 'top' }),
  close: () => set({ isOpen: false }),
  toggleMaximize: () => set((state) => ({ isMaximized: !state.isMaximized })),
  setPosition: (position) => set({ position }),
  bringToFront: () => set((state) => ({ zIndex: state.zIndex + 1 })),
}));

interface TimelineState {
  activeChannel: 'ai' | 'news';
  aiScrollPosition: number;
  newsScrollPosition: number;
  scrollLocked: boolean;

  setActiveChannel: (channel: 'ai' | 'news') => void;
  setAiScrollPosition: (position: number) => void;
  setNewsScrollPosition: (position: number) => void;
  setScrollLocked: (locked: boolean) => void;
}

export const useTimelineStore = create<TimelineState>((set) => ({
  activeChannel: 'news',
  aiScrollPosition: 0,
  newsScrollPosition: 0,
  scrollLocked: false,

  setActiveChannel: (channel) => set({ activeChannel: channel }),
  setAiScrollPosition: (position) => set({ aiScrollPosition: position }),
  setNewsScrollPosition: (position) => set({ newsScrollPosition: position }),
  setScrollLocked: (locked) => set({ scrollLocked: locked }),
}));

interface SettingsState {
  theme: 'dark' | 'light';
  sidebarCollapsed: boolean;
  locale: 'zh' | 'en';

  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setLocale: (locale: 'zh' | 'en') => void;
}

const getInitialLocale = (): 'zh' | 'en' => {
  if (typeof document !== 'undefined') {
    const stored = localStorage.getItem('nomos_locale');
    if (stored === 'zh' || stored === 'en') return stored;
  }
  return 'zh';
};

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: 'dark',
  sidebarCollapsed: false,
  locale: getInitialLocale(),

  setTheme: (theme) => {
    set({ theme });
    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    savePreferences({ theme });
  },

  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === 'dark' ? 'light' : 'dark';
      if (typeof document !== 'undefined') {
        if (newTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      return { theme: newTheme };
    }),

  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  setLocale: (locale) => {
    set({ locale });
    if (typeof document !== 'undefined') {
      localStorage.setItem('nomos_locale', locale);
    }
    i18n.changeLanguage(locale);
    savePreferences({ locale });
  },
}));
