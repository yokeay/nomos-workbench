'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTerminalStore } from '@/stores';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

export function TerminalCard() {
  const { t } = useTranslation();
  const { close, toggleMaximize, isMaximized, bringToFront, zIndex } = useTerminalStore();
  const [isHovered, setIsHovered] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!terminalRef.current || xtermRef.current) return;

    // Initialize xterm.js with grayscale theme
    const xterm = new XTerm({
      theme: {
        background: '#1F1D2B',
        foreground: '#FFFFFF',
        cursor: '#FFFFFF',
        cursorAccent: '#1F1D2B',
        selectionBackground: '#1F1D2B',
        black: '#1F1D2B',
        red: '#EF4444',
        green: '#22C55E',
        yellow: '#EAB308',
        blue: '#3B82F6',
        magenta: '#A855F7',
        cyan: '#06B6D4',
        white: '#FFFFFF',
        brightBlack: '#4B5563',
        brightRed: '#F87171',
        brightGreen: '#4ADE80',
        brightYellow: '#FACC15',
        brightBlue: '#60A5FA',
        brightMagenta: '#C084FC',
        brightCyan: '#22D3EE',
        brightWhite: '#FFFFFF',
      },
      fontFamily: '"JetBrains Mono", "Fira Code", monospace',
      fontSize: 13,
      cursorBlink: true,
      cursorStyle: 'bar',
    });

    const fitAddon = new FitAddon();
    xterm.loadAddon(fitAddon);
    xterm.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = xterm;

    // Handle terminal input
    xterm.onData((data) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(data);
      }
    });

    // Connect to gotty WebSocket (placeholder - would be configured via env)
    const wsUrl = process.env.NEXT_PUBLIC_TERMINAL_WS_URL || 'ws://localhost:8080';
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      xterm.writeln('\x1b[1;32mConnected to terminal server\x1b[0m\r\n');
    };

    ws.onmessage = (event) => {
      xterm.write(event.data);
    };

    ws.onclose = () => {
      xterm.writeln('\r\n\x1b[1;33mConnection closed\x1b[0m\r\n');
    };

    ws.onerror = () => {
      xterm.writeln('\r\n\x1b[1;31mConnection error\x1b[0m\r\n');
    };

    // Handle resize
    const handleResize = () => {
      fitAddon.fit();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      ws.close();
      xterm.dispose();
      xtermRef.current = null;
    };
  }, []);

  return (
    <div
      className={`relative bg-muted rounded-lg border border-border shadow-lg overflow-hidden transition-all ${
        isMaximized ? 'fixed inset-4 z-50' : ''
      }`}
      style={{ zIndex }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={bringToFront}
    >
      {/* Title Bar */}
      <div className="h-8 bg-muted/80 flex items-center justify-between px-3 cursor-move select-none">
        <span className="text-sm text-foreground">{t('terminal.title')}</span>
        <div className="flex items-center gap-2">
          {isHovered && (
            <>
              <button
                onClick={toggleMaximize}
                className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                title="Maximize"
              >
                {isMaximized ? '❐' : '⛶'}
              </button>
              <button
                onClick={close}
                className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-red-500 rounded transition-colors"
                title="Close"
              >
                ✕
              </button>
            </>
          )}
        </div>
      </div>

      {/* Terminal Content */}
      <div ref={terminalRef} className="h-64 p-2" />
    </div>
  );
}