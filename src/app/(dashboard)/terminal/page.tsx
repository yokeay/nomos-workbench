'use client'

import { useState } from 'react'
import { SysInfoPanel } from '@/components/terminal/sys-info-panel'
import { TerminalPanel } from '@/components/terminal/terminal-panel'

export default function TerminalPage() {
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected')

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#0F0F13] p-4 gap-4">
      {/* System info + resource monitoring */}
      <div className="shrink-0">
        <SysInfoPanel connectionStatus={connectionStatus} />
      </div>

      {/* Terminal — fills remaining space */}
      <TerminalPanel
        className="flex-1 min-h-0 rounded-xl overflow-hidden border border-white/[0.04]"
        onStatusChange={setConnectionStatus}
      />
    </div>
  )
}
