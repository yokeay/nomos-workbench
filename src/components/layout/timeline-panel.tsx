'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTimelineStore } from '@/stores';
import { cn } from '@/lib/utils';

export function TimelinePanel() {
  const { t } = useTranslation();
  const { activeChannel, setActiveChannel } = useTimelineStore();

  return (
    <aside className="w-80 bg-muted/50 border-l border-border flex flex-col h-full">
      <div className="h-12 border-b border-border flex items-center px-2">
        <Tabs
          value={activeChannel}
          onValueChange={(v) => setActiveChannel(v as 'ai' | 'news')}
        >
          <TabsList className="bg-muted/80 h-9">
            <TabsTrigger
              value="ai"
              className={cn(
                'data-[state=active]:bg-foreground data-[state=active]:text-background text-muted-foreground text-sm px-4',
                activeChannel === 'ai' && 'bg-foreground text-background'
              )}
            >
              {t('timeline.ai')}
            </TabsTrigger>
            <TabsTrigger
              value="news"
              className={cn(
                'data-[state=active]:bg-foreground data-[state=active]:text-background text-muted-foreground text-sm px-4',
                activeChannel === 'news' && 'bg-foreground text-background'
              )}
            >
              {t('timeline.news')}
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
      .then(r => r.json())
      .then(d => { if (d.code === 0) setEvents(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <ScrollArea className="h-full">
      <div className="p-4"><div className="text-muted-foreground text-sm text-center py-8">{t('common.loading')}</div></div>
    </ScrollArea>
  );

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-3">
        {events.length === 0 && (
          <div className="text-muted-foreground text-sm text-center py-8">{t('timeline.aiPlaceholder')}</div>
        )}
        {events.slice(0, 20).map((ev: any, i: number) => {
          const content = (() => { try { return JSON.parse(ev.content); } catch { return { message: ev.content }; } })();
          const date = new Date(ev.eventDate).toLocaleDateString();
          return (
            <div key={i} className="text-sm">
              <div className="text-muted-foreground text-xs mb-1">{date}</div>
              <div className="text-foreground line-clamp-3">{content.message}</div>
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
    // Fetch news then list
    fetch('/api/news/fetch', { method: 'POST' })
      .then(() => fetch('/api/news/list'))
      .then(r => r.json())
      .then(d => { if (d.code === 0) setItems(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <ScrollArea className="h-full">
      <div className="p-4"><div className="text-muted-foreground text-sm text-center py-8">{t('common.loading')}</div></div>
    </ScrollArea>
  );

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-3">
        {items.length === 0 && (
          <div className="text-muted-foreground text-sm text-center py-8">{t('timeline.newsPlaceholder')}</div>
        )}
        {items.slice(0, 30).map((item: any, i: number) => (
          <a
            key={i}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors border border-border/50"
          >
            <div className="text-sm text-foreground font-medium line-clamp-2">{item.title}</div>
            {item.summary && <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.summary}</div>}
            <div className="text-xs text-muted-foreground mt-1">{item.source} · {new Date(item.publishedAt).toLocaleDateString()}</div>
          </a>
        ))}
      </div>
    </ScrollArea>
  );
}
