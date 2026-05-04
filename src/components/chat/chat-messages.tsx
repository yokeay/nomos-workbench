'use client';

import { useTranslation } from 'react-i18next';
import { useChatStore } from '@/stores';
import { MessageBubble } from './message-bubble';
import { Sparkles } from 'lucide-react';

export function ChatMessages() {
  const { t } = useTranslation();
  const { messages, currentSessionId, isStreaming, streamingContent } = useChatStore();
  const sessionMessages = messages.get(currentSessionId || 'default') || [];

  return (
    <div className="flex flex-col gap-5">
      {sessionMessages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {isStreaming && streamingContent && (
        <div className="flex items-start gap-3 animate-slide-up">
          <div className="w-8 h-8 rounded-xl bg-accent/60 flex items-center justify-center flex-shrink-0 ring-1 ring-border/30 shadow-subtle">
            <Sparkles className="w-4 h-4 text-foreground/50" />
          </div>
          <div className="flex-1 bg-muted/40 rounded-2xl rounded-tl-md px-4 py-3 border border-border/30">
            <div className="text-foreground/85 text-sm leading-relaxed [&_pre]:bg-black/10 [&_pre]:p-3 [&_pre]:rounded-xl [&_pre]:overflow-x-auto [&_code]:text-sm [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded-md [&_pre_code]:bg-transparent [&_pre_code]:p-0">
              {streamingContent}
              <span className="inline-block w-0.5 h-4 bg-foreground/50 ml-0.5 animate-pulse align-middle" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
