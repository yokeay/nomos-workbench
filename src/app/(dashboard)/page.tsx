'use client';

import { useTerminalStore } from '@/stores';
import { TerminalCard } from '@/components/terminal/terminal-card';
import { ChatContainer } from '@/components/chat/chat-container';

export default function DashboardPage() {
  const { isOpen: terminalOpen } = useTerminalStore();

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Terminal Card */}
      {terminalOpen && (
        <div className="flex-shrink-0">
          <TerminalCard />
        </div>
      )}

      {/* AI Chat Area */}
      <div className="flex-1 min-h-0">
        <ChatContainer />
      </div>
    </div>
  );
}
