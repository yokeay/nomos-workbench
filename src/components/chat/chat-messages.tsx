'use client';

import { useTranslation } from 'react-i18next';
import { useChatStore } from '@/stores';
import { MessageBubble } from './message-bubble';
import { cn } from '@/lib/utils';

export function ChatMessages() {
  const { t } = useTranslation();
  const { messages, currentSessionId, isStreaming, streamingContent } = useChatStore();
  const sessionMessages = messages.get(currentSessionId || 'default') || [];

  return (
    <div className="flex flex-col gap-4">
      {sessionMessages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {isStreaming && streamingContent && (
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-sm font-medium">
            {t('chat.aiLabel')}
          </div>
          <div className="flex-1 bg-muted/50 rounded-lg p-3">
            <div className={cn(
              "text-foreground text-sm leading-relaxed",
              "[&_pre]:bg-muted [&_pre]:p-3 [&_pre]:rounded [&_pre]:overflow-x-auto",
              "[&_code]:text-muted-foreground [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded",
              "[&_pre_code]:bg-transparent [&_pre_code]:p-0"
            )}>
              {streamingContent}
              <span className="animate-pulse">▊</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
