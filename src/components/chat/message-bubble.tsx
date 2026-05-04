'use client';

import { useTranslation } from 'react-i18next';
import { Message } from '@/types/ai';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { User, Sparkles } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const { t } = useTranslation();
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex items-start gap-3', isUser && 'flex-row-reverse')}>
      {/* Avatar */}
      <div
        className={cn(
          'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ring-1 ring-border/30 shadow-subtle',
          isUser
            ? 'bg-foreground text-background'
            : 'bg-accent/60 text-foreground/50'
        )}
      >
        {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          'flex-1 max-w-[78%] px-4 py-3',
          isUser
            ? 'bg-foreground text-background rounded-2xl rounded-tr-md'
            : 'bg-muted/40 text-foreground/85 rounded-2xl rounded-tl-md border border-border/30'
        )}
      >
        {isUser ? (
          <p className="text-sm leading-relaxed">{message.content}</p>
        ) : (
          <div className="text-sm leading-relaxed [&_pre]:bg-black/10 [&_pre]:p-3 [&_pre]:rounded-xl [&_pre]:overflow-x-auto [&_code]:text-sm [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded-md [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_h1]:text-lg [&_h1]:font-bold [&_h2]:text-base [&_h2]:font-semibold [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
