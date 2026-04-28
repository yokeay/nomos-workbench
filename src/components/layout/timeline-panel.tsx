'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTimelineStore } from '@/stores';
import { cn } from '@/lib/utils';

export function TimelinePanel() {
  const { activeChannel, setActiveChannel } = useTimelineStore();

  return (
    <aside className="w-80 bg-muted/50 border-l border-border flex flex-col h-full">
      {/* Channel Tabs */}
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
              AI
            </TabsTrigger>
            <TabsTrigger
              value="news"
              className={cn(
                'data-[state=active]:bg-foreground data-[state=active]:text-background text-muted-foreground text-sm px-4',
                activeChannel === 'news' && 'bg-foreground text-background'
              )}
            >
              News
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Timeline Content */}
      <div className="flex-1 overflow-hidden">
        {activeChannel === 'ai' ? <AITimeline /> : <NewsTimeline />}
      </div>
    </aside>
  );
}

function AITimeline() {
  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        {/* AI Timeline content will be implemented with SSE */}
        <div className="text-muted-foreground text-sm text-center py-8">
          AI events will appear here in real-time
        </div>
        {/* Timeline items would be rendered here with animation */}
      </div>
    </ScrollArea>
  );
}

function NewsTimeline() {
  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        {/* News Timeline content will be implemented with SSE */}
        <div className="text-muted-foreground text-sm text-center py-8">
          News items will appear here in real-time
        </div>
        {/* News cards would be rendered here with FanJi style */}
      </div>
    </ScrollArea>
  );
}
