'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useChatStore } from '@/stores';
import { ChatMessages } from './chat-messages';
import { ModelSelector } from './model-selector';
import { Message } from '@/types/ai';


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

  const sendMessage = async () => {
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <ChatMessages />
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="relative flex-shrink-0 border-t border-border/50">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('chat:placeholder')}
          disabled={isStreaming}
          className="w-full h-36 px-4 pt-3 pb-10 bg-background text-sm text-foreground placeholder:text-muted-foreground/40 resize-none border-0 focus:outline-none focus:ring-0"
        />
        <div className="absolute bottom-2 right-2">
          <ModelSelector value={selectedModel} onChange={setSelectedModel} />
        </div>
      </div>
    </div>
  );
}
