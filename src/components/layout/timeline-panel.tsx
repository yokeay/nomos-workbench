'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useTimelineStore } from '@/stores';
import { cn } from '@/lib/utils';
import { Bot, Newspaper } from 'lucide-react';

export function TimelinePanel() {
  const { t } = useTranslation();
  const { activeChannel, setActiveChannel } = useTimelineStore();

  return (
    <aside className="w-80 bg-sidebar border-l border-sidebar-border flex flex-col h-full shrink-0 z-10">
      {/* Tab Header */}
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
              {t('timeline.ai')}
            </TabsTrigger>
            <TabsTrigger
              value="news"
              className="flex-1 gap-1.5 rounded-lg text-xs font-medium text-muted-foreground/60 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-subtle transition-all duration-normal"
            >
              <Newspaper className="w-3.5 h-3.5" />
              {t('timeline.news')}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
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
            {t('timeline.aiPlaceholder')}
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

  useEffect(() => {
    fetch('/api/news/fetch', { method: 'POST' })
      .then(() => fetch('/api/news/list'))
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 0) setItems(d.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <TimelineSkeleton />;

  return (
    <ScrollArea className="h-full">
      <div className="p-3 space-y-2">
        {items.length === 0 && (
          <div className="text-muted-foreground text-xs text-center py-12 font-medium">
            {t('timeline.newsPlaceholder')}
          </div>
        )}
        {items.slice(0, 30).map((item: any, i: number) => (
          <a
            key={i}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 rounded-xl bg-card/60 border border-border/40 hover:border-border hover:bg-card hover:shadow-sm-soft transition-all duration-normal"
          >
            <div className="text-xs text-foreground/85 font-medium line-clamp-2 leading-snug">
              {item.title}
            </div>
            {item.summary && (
              <div className="text-[11px] text-muted-foreground/70 mt-1.5 line-clamp-2 leading-relaxed">
                {item.summary}
              </div>
            )}
            <div className="text-[10px] text-muted-foreground/50 mt-2 font-medium tracking-wide">
              {item.source} · {new Date(item.publishedAt).toLocaleDateString()}
            </div>
          </a>
        ))}
      </div>
    </ScrollArea>
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
