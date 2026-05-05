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
          <TabsList className="w-full bg-muted/50 h-9 rounded-xl p-0.5">
            <TabsTrigger
              value="ai"
              className="flex-1 gap-1.5 rounded-lg text-xs font-medium text-muted-foreground/60 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-subtle transition-all duration-normal"
            >
              <Bot className="w-3.5 h-3.5" />
              {t('timeline:ai')}
            </TabsTrigger>
            <TabsTrigger
              value="news"
              className="flex-1 gap-1.5 rounded-lg text-xs font-medium text-muted-foreground/60 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-subtle transition-all duration-normal"
            >
              <Newspaper className="w-3.5 h-3.5" />
              {t('timeline:news')}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeChannel === 'ai' ? <AITimeline /> : <NewsTimeline />}
      </div>
    </aside>
  );
}

function AITimeline() {
  const { t } = useTranslation();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/timeline/ai')
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 0) setEvents(d.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
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
              className="group px-3 py-2.5 rounded-xl hover:bg-accent/40 transition-colors duration-fast"
            >
              <div className="text-muted-foreground/70 text-[10px] font-medium mb-1 tracking-wide">
                {date}
              </div>
              <div className="text-foreground/85 text-xs leading-relaxed line-clamp-3 group-hover:text-foreground transition-colors">
                {content.message}
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
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'sse' | 'fallback'>('sse');
  const [updatedAt, setUpdatedAt] = useState<number>(0);
  const esRef = useRef<EventSource | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Per-source top 5 merge helper
  const mergeItems = useCallback((incoming: any[], prev: any[]) => {
    const existing = new Set(prev.map(i => `${i.sourceId}-${i.id}`));
    const novel = incoming.filter((i: any) => !existing.has(`${i.sourceId}-${i.id}`));
    if (novel.length === 0) return prev;

    const sourceLatest: Record<string, any[]> = {};
    for (const item of [...novel, ...prev]) {
      if (!sourceLatest[item.sourceId]) sourceLatest[item.sourceId] = [];
      sourceLatest[item.sourceId].push(item);
    }
    const merged: any[] = [];
    for (const [, srcItems] of Object.entries(sourceLatest)) {
      srcItems.sort((a, b) => {
        const da = a.pubDate ?? 0;
        const db = b.pubDate ?? 0;
        return (db as number) - (da as number) || 0;
      });
      merged.push(...srcItems.slice(0, 5));
    }
    merged.sort((a, b) => {
      const da = a.pubDate ?? 0;
      const db = b.pubDate ?? 0;
      return (db as number) - (da as number) || 0;
    });
    return merged;
  }, []);

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
          setItems(prev => mergeItems(d.data.items, prev));
        } else if (!isRefresh) {
          setItems(d.data.items);
        }
        setUpdatedAt(d.data.updatedAt);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [updatedAt, mergeItems]);

  // Connect SSE (runs once on mount)
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
          setItems(prev => prev.length === 0 ? payload.items : mergeItems(payload.items, prev));
        }
        if (payload.init && payload.items.length === 0) {
          fetchFallback();
        }
        if (payload.updatedAt) setUpdatedAt(payload.updatedAt);
        setLoading(false);
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
  }, [fetchFallback, mergeItems]);

  // On mount: try SSE first
  useEffect(() => {
    connectSSE();
    return () => {
      if (esRef.current) esRef.current.close();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (loading) return <TimelineSkeleton />;

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto overscroll-contain">
      {mode === 'fallback' && (
        <div className="sticky top-0 z-10 h-6 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-center gap-1.5 text-[10px] text-amber-600/80 font-medium backdrop-blur-sm">
          <Loader2 className="w-3 h-3 animate-spin" />
          {t('timeline:updating')}
        </div>
      )}
      <div className="px-2 py-3">
        {items.length === 0 && (
          <div className="text-muted-foreground text-xs text-center py-12 font-medium">
            {t('timeline:newsPlaceholder')}
          </div>
        )}
        <div className="relative pl-5">
          <div className="absolute left-[7px] top-1 bottom-1 w-px bg-border/60" />
          {items.map((item: any, idx: number) => {
            const color = item.sourceColor || 'gray';
            const dotClass = sourceColorMap[color] || 'bg-gray-500';
            return (
              <a
                key={`${item.sourceId}-${item.id}-${idx}`}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative block pb-3 last:pb-0 group"
              >
                <span
                  className={cn(
                    'absolute left-[-13px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-background ring-1 ring-border/40',
                    dotClass,
                  )}
                />
                <div className="pl-3">
                  <div className="text-xs text-foreground/85 font-medium line-clamp-2 leading-snug group-hover:text-foreground transition-colors">
                    {item.title}
                  </div>
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
