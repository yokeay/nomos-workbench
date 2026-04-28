import { create } from 'zustand';
import { Message, ChatSession } from '@/types/ai';

interface ChatState {
  // Current session
  currentSessionId: string | null;
  sessions: ChatSession[];
  messages: Map<string, Message[]>;

  // Streaming state
  isStreaming: boolean;
  streamingContent: string;

  // Actions
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

  // Actions
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

  // Actions
  setActiveChannel: (channel: 'ai' | 'news') => void;
  setAiScrollPosition: (position: number) => void;
  setNewsScrollPosition: (position: number) => void;
  setScrollLocked: (locked: boolean) => void;
}

export const useTimelineStore = create<TimelineState>((set) => ({
  activeChannel: 'ai',
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

  // Actions
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: 'dark',
  sidebarCollapsed: false,

  setTheme: (theme) => {
    set({ theme });
    // Update HTML class for Tailwind dark mode
    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
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
}));