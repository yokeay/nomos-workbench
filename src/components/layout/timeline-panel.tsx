'use client';

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
  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        <div className="text-muted-foreground text-sm text-center py-8">
          {t('timeline.aiPlaceholder')}
        </div>
      </div>
    </ScrollArea>
  );
}

function NewsTimeline() {
  const { t } = useTranslation();
  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        <div className="text-muted-foreground text-sm text-center py-8">
          {t('timeline.newsPlaceholder')}
        </div>
      </div>
    </ScrollArea>
  );
}
