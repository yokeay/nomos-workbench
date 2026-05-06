'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useTimelineStore } from '@/stores';
import { cn } from '@/lib/utils';
import { Bot, Newspaper, Loader2 } from 'lucide-react';

function relativeTime(date: number | string): string {
  const ts = typeof date === 'string' ? Date.parse(date) : date;
  if (!ts || isNaN(ts)) return '';
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '刚刚';
  if (mins < 60) return `${mins}分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}天前`;
  return new Date(ts).toLocaleDateString();
}

function TypewriterText({ text, speed = 75, className }: { text: string; speed?: number; className?: string }) {
  const [chars, setChars] = useState(0);
  const textRef = useRef(text);

  useEffect(() => {
    if (textRef.current !== text) {
      textRef.current = text;
      setChars(0);
    }
    if (!text) return;
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setChars(i);
      if (i >= text.length) clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return <span className={className}>{text.slice(0, chars)}</span>;
}

const sourceColorMap: Record<string, string> = {
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  orange: 'bg-orange-500',
  slate: 'bg-slate-500',
  gray: 'bg-gray-500',
  indigo: 'bg-indigo-500',
  emerald: 'bg-emerald-500',
  teal: 'bg-teal-500',
  yellow: 'bg-yellow-500',
};

export function TimelinePanel() {
  const { t } = useTranslation();
  const { activeChannel, setActiveChannel } = useTimelineStore();

  return (
    <aside className="w-80 bg-sidebar border-l border-sidebar-border flex flex-col h-full shrink-0 z-10">
      <div className="h-12 border-b border-sidebar-border flex items-center px-3">
        <Tabs
          value={activeChannel}
          onValueChange={(v) => setActiveChannel(v as 'ai' | 'news')}
          className="w-full"
        >
          <TabsList className="relative w-full bg-muted/50 h-9 rounded-xl p-0.5">
            {/* Sliding indicator */}
            <div
              className={cn(
                'absolute top-0.5 h-[calc(100%-4px)] w-[calc(50%-2px)] rounded-lg bg-background shadow-subtle transition-all duration-300 ease-out',
                activeChannel === 'ai' ? 'left-0.5' : 'left-[calc(50%+1px)]',
              )}
            />
            <TabsTrigger
              value="ai"
              className="relative z-10 flex-1 gap-1.5 rounded-lg text-xs font-medium data-active:text-foreground data-active:shadow-none data-active:bg-transparent transition-all duration-normal"
            >
              <Bot className="w-3.5 h-3.5" />
              {t('timeline:ai')}
            </TabsTrigger>
            <TabsTrigger
              value="news"
              className="relative z-10 flex-1 gap-1.5 rounded-lg text-xs font-medium data-active:text-foreground data-active:shadow-none data-active:bg-transparent transition-all duration-normal"
            >
              <Newspaper className="w-3.5 h-3.5" />
              {t('timeline:news')}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className={activeChannel === 'ai' ? 'h-full' : 'hidden'}>
          <AITimeline />
        </div>
        <div className={activeChannel === 'news' ? 'h-full' : 'hidden'}>
          <NewsTimeline />
        </div>
      </div>
    </aside>
  );
}

function AITimeline() {
  const { t } = useTranslation();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    fetch('/api/timeline/ai')
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 0) setEvents(d.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Poll for new events every 60s
  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        const r = await fetch('/api/timeline/ai');
        const d = await r.json();
        if (d.code === 0 && d.data?.length > 0) {
          setEvents((prev) => {
            const existing = new Set(prev.map((e: any) => e.id || e.eventDate));
            const novel = d.data.filter((e: any) => !existing.has(e.id || e.eventDate));
            if (novel.length === 0) return prev;
            return [...novel, ...prev].slice(0, 50);
          });
        }
      } catch {
        // silent
      }
    }, 60_000);
    return () => clearInterval(timer);
  }, []);

  if (loading) return <TimelineSkeleton />;

  return (
    <ScrollArea className="h-full">
      <div className="p-3 space-y-1">
        {events.length === 0 && (
          <div className="text-muted-foreground text-xs text-center py-12 font-medium">
            {t('timeline:aiPlaceholder')}
          </div>
        )}
        {events.slice(0, 20).map((ev: any, i: number) => {
          const content = (() => {
            try {
              return JSON.parse(ev.content);
            } catch {
              return { message: ev.content };
            }
          })();
          const date = new Date(ev.eventDate).toLocaleDateString();
          return (
            <div
              key={i}
              className="group px-3 py-2.5 rounded-xl hover:bg-accent/40 transition-colors duration-fast animate-timeline-node"
            >
              <div className="overflow-hidden">
                <div className="text-muted-foreground/70 text-[10px] font-medium mb-1 tracking-wide">
                  {date}
                </div>
                <TypewriterText
                  text={content.message}
                  className="text-foreground/85 text-xs leading-relaxed line-clamp-3 group-hover:text-foreground transition-colors"
                />
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}

function NewsTimeline() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'sse' | 'fallback'>('sse');
  const [updatedAt, setUpdatedAt] = useState<number>(0);
  const esRef = useRef<EventSource | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const revealTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Full data cache (sorted descending by pubDate, newest first)
  const allItemsRef = useRef<any[]>([]);
  // Items currently visible
  const [displayItems, setDisplayItems] = useState<any[]>([]);
  // Next index to reveal (counting from end: oldest first)
  const revealIndexRef = useRef(0);
  // Track seen item keys to avoid duplicates
  const seenRef = useRef<Set<string>>(new Set());

  const itemKey = (item: any) => `${item.sourceId}-${item.id}`;

  const sortDesc = (items: any[]) =>
    [...items].sort((a, b) => {
      const da = a.pubDate ?? 0;
      const db = b.pubDate ?? 0;
      return (db as number) - (da as number) || 0;
    });

  // Reveal next oldest item (from end of allItems)
  const revealNext = useCallback(() => {
    const all = allItemsRef.current;
    const idx = revealIndexRef.current;

    if (idx >= all.length) {
      // All revealed, stop timer
      if (revealTimerRef.current) {
        clearInterval(revealTimerRef.current);
        revealTimerRef.current = null;
      }
      return;
    }

    // Reveal one item: prepend to displayItems (the item being revealed is older than what's already shown)
    const item = all[all.length - 1 - idx];
    revealIndexRef.current = idx + 1;

    setDisplayItems(prev => {
      const next = [item, ...prev];
      // 300-item FIFO cap: drop oldest from bottom
      if (next.length > 300) {
        next.length = 300;
      }
      return next;
    });

    if (revealIndexRef.current >= all.length) {
      if (revealTimerRef.current) {
        clearInterval(revealTimerRef.current);
        revealTimerRef.current = null;
      }
    }
  }, []);

  // Start reveal animation
  const startReveal = useCallback(() => {
    // Clear any existing reveal timer
    if (revealTimerRef.current) {
      clearInterval(revealTimerRef.current);
    }

    const all = allItemsRef.current;
    if (all.length === 0) return;

    // If we have many items cached, reveal them staggered
    revealTimerRef.current = setInterval(revealNext, 6000);
    // Immediately reveal first (oldest) item
    revealNext();
  }, [revealNext]);

  // Add new items to cache (from SSE or polling) — prepend to top, don't clear existing
  const addToCache = useCallback((incoming: any[]) => {
    const novel = incoming.filter((item: any) => {
      const key = itemKey(item);
      if (seenRef.current.has(key)) return false;
      seenRef.current.add(key);
      return true;
    });

    if (novel.length === 0) return;

    const merged = sortDesc([...allItemsRef.current, ...novel]);
    allItemsRef.current = merged;

    // Prepend novel items at top (they're newer than existing displayItems)
    // Don't reset reveal — keep revealing older items from bottom
    setDisplayItems((prev) => {
      // Novel items are newest → go at top
      const novelSorted = sortDesc(novel);
      const next = [...novelSorted, ...prev];
      if (next.length > 300) next.length = 300;
      return next;
    });

    // revealIndexRef stays unchanged — novel items insert at top, end positions don't shift
  }, []);

  // Set initial cache
  const setInitialCache = useCallback((items: any[]) => {
    for (const item of items) {
      seenRef.current.add(itemKey(item));
    }
    const sorted = sortDesc(items);
    allItemsRef.current = sorted;
    revealIndexRef.current = 0;
    setDisplayItems([]);
    setLoading(false);

    if (revealTimerRef.current) {
      clearInterval(revealTimerRef.current);
    }
    revealTimerRef.current = setInterval(revealNext, 6000);
    revealNext();
  }, [revealNext]);

  // Fallback: REST polling
  const fetchFallback = useCallback(async (isRefresh = false) => {
    try {
      const url = isRefresh && updatedAt
        ? `/api/news/timeline?limit=300&since=${updatedAt}`
        : '/api/news/timeline?limit=300';
      const r = await fetch(url);
      const d = await r.json();
      if (d.code === 0) {
        if (isRefresh && d.data.items.length > 0) {
          addToCache(d.data.items);
        } else if (!isRefresh) {
          setInitialCache(d.data.items);
        }
        setUpdatedAt(d.data.updatedAt);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [updatedAt, addToCache, setInitialCache]);

  // Connect SSE
  const connectSSE = useCallback(() => {
    const es = new EventSource('/api/news/stream');
    esRef.current = es;

    es.onopen = () => {
      setMode('sse');
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    es.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.items?.length > 0) {
          addToCache(payload.items);
          setLoading(false);
        }
        if (payload.init && payload.items.length === 0) {
          fetchFallback();
        }
        if (payload.updatedAt) setUpdatedAt(payload.updatedAt);
      } catch {
        // invalid payload
      }
    };

    es.onerror = () => {
      es.close();
      esRef.current = null;
      setMode('fallback');
      fetchFallback();
      if (!timerRef.current) {
        timerRef.current = setInterval(() => fetchFallback(true), 30_000);
      }
    };
  }, [fetchFallback, addToCache]);

  // On mount: try SSE first
  useEffect(() => {
    connectSSE();
    return () => {
      if (esRef.current) esRef.current.close();
      if (timerRef.current) clearInterval(timerRef.current);
      if (revealTimerRef.current) clearInterval(revealTimerRef.current);
    };
  }, []);

  if (loading) return <TimelineSkeleton />;

  return (
    <div className="h-full overflow-y-auto overscroll-contain">
      {mode === 'fallback' && (
        <div className="sticky top-0 z-10 h-6 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-center gap-1.5 text-[10px] text-amber-600/80 font-medium backdrop-blur-sm">
          <Loader2 className="w-3 h-3 animate-spin" />
          {t('timeline:updating')}
        </div>
      )}
      <div className="px-2 py-3">
        {displayItems.length === 0 && allItemsRef.current.length === 0 && (
          <div className="text-muted-foreground text-xs text-center py-12 font-medium">
            {t('timeline:newsPlaceholder')}
          </div>
        )}
        <div className="relative pl-5">
          <div className="absolute left-[7px] top-1 bottom-1 w-px bg-border/60" />
          {displayItems.map((item: any, idx: number) => {
            const color = item.sourceColor || 'gray';
            const dotClass = sourceColorMap[color] || 'bg-gray-500';
            return (
              <a
                key={`${item.sourceId}-${item.id}`}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative block pb-3 last:pb-0 group animate-timeline-node"
              >
                <span
                  className={cn(
                    'absolute left-[-13px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-background ring-1 ring-border/40 animate-dot-pop',
                    dotClass,
                  )}
                />
                <div className="overflow-hidden">
                  <div className="pl-3">
                    <TypewriterText
                      text={item.title}
                      className="text-xs text-foreground/85 font-medium line-clamp-2 leading-snug group-hover:text-foreground transition-colors"
                    />
                    {item.extra?.hover && (
                      <div className="text-[11px] text-muted-foreground/60 mt-0.5 line-clamp-1">
                        {item.extra.hover}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted/60 text-muted-foreground">
                        {item.sourceName}
                      </span>
                      {item.pubDate && (
                        <span className="text-[10px] text-muted-foreground/50">
                          {relativeTime(item.pubDate)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TimelineSkeleton() {
  return (
    <div className="p-3 space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-2 p-3">
          <Skeleton className="h-3 w-1/3 rounded-md" />
          <Skeleton className="h-3 w-full rounded-md" />
          <Skeleton className="h-3 w-2/3 rounded-md" />
        </div>
      ))}
    </div>
  );
}
