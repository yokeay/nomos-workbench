'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useChatStore } from '@/stores';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChatMessages } from './chat-messages';
import { ModelSelector } from './model-selector';
import { Message } from '@/types/ai';
import { ArrowUp, Sparkles } from 'lucide-react';

export function ChatContainer() {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('claude-3-5-sonnet-20241022');
  const { isStreaming, streamingContent, addMessage, setStreaming, updateStreamingMessage, resetStreaming } =
    useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [streamingContent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      createdAt: Date.now(),
    };

    const sessionId = useChatStore.getState().currentSessionId || 'default';
    addMessage(sessionId, userMessage);

    setInput('');
    setStreaming(true);
    updateStreamingMessage('');

    try {
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          model: selectedModel,
          sessionId,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullContent += chunk;
        updateStreamingMessage(fullContent);
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: fullContent,
        createdAt: Date.now(),
      };
      addMessage(sessionId, assistantMessage);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      resetStreaming();
    }
  };

  return (
    <div className="h-full flex flex-col bg-card/40 rounded-2xl border border-border/60 shadow-sm-soft overflow-hidden">
      {/* Header */}
      <div className="h-13 flex items-center justify-between px-5 border-b border-border/50 glass">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-accent/60 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-foreground/70" />
          </div>
          <span className="text-foreground text-sm font-semibold tracking-tight">
            {t('chat:title')}
          </span>
        </div>
        <ModelSelector value={selectedModel} onChange={setSelectedModel} />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <ChatMessages />
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-border/50 bg-background/40">
        <div className="flex gap-2 items-center">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('chat:placeholder')}
            disabled={isStreaming}
            className="flex-1 h-12 px-4 bg-muted/60 border-transparent rounded-xl text-sm text-foreground placeholder:text-muted-foreground/40 focus:bg-input-background focus:border-border focus:ring-1 focus:ring-ring/20 transition-all duration-normal"
          />
          <Button
            type="submit"
            disabled={isStreaming || !input.trim()}
            size="icon"
            className="h-12 w-12 rounded-xl bg-foreground text-background hover:bg-foreground/90 hover:shadow-md-soft disabled:opacity-30 transition-all duration-normal"
          >
            <ArrowUp className="w-5 h-5" />
          </Button>
        </div>
      </form>
    </div>
  );
}
