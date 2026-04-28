'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useChatStore } from '@/stores';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChatMessages } from './chat-messages';
import { ModelSelector } from './model-selector';
import { Message } from '@/types/ai';

export function ChatContainer() {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('claude-3-5-sonnet-20241022');
  const { isStreaming, streamingContent, addMessage, setStreaming, updateStreamingMessage, resetStreaming } = useChatStore();
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
    <div className="h-full flex flex-col bg-background rounded-lg border border-border overflow-hidden">
      <div className="h-12 border-b border-border flex items-center justify-between px-4">
        <span className="text-foreground text-sm font-medium">{t('chat.title')}</span>
        <ModelSelector value={selectedModel} onChange={setSelectedModel} />
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <ChatMessages />
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('chat.placeholder')}
            disabled={isStreaming}
            className="flex-1 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/50"
          />
          <Button
            type="submit"
            disabled={isStreaming || !input.trim()}
          >
            {isStreaming ? t('chat.streaming') : t('common.send')}
          </Button>
        </div>
      </form>
    </div>
  );
}
