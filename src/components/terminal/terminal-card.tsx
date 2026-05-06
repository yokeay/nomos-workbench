'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTerminalStore } from '@/stores';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { Minus, X, Maximize2, Minimize2, Terminal } from 'lucide-react';

export function TerminalCard() {
  const { t } = useTranslation();
  const { close, toggleMaximize, isMaximized, bringToFront, zIndex } = useTerminalStore();
  const [isHovered, setIsHovered] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!terminalRef.current || xtermRef.current) return;

    const xterm = new XTerm({
      theme: {
        background: '#0F0F13',
        foreground: '#E4E4E9',
        cursor: '#E4E4E9',
        cursorAccent: '#0F0F13',
        selectionBackground: '#2D2D3A',
        black: '#1A1A26',
        red: '#F25C5C',
        green: '#5CBF7B',
        yellow: '#E5C94D',
        blue: '#5C8BF2',
        magenta: '#B07FF2',
        cyan: '#4DD4D4',
        white: '#E4E4E9',
        brightBlack: '#4D4D5E',
        brightRed: '#F78C8C',
        brightGreen: '#7DD694',
        brightYellow: '#EDD971',
        brightBlue: '#8CB0F7',
        brightMagenta: '#C9A6F7',
        brightCyan: '#73DFDF',
        brightWhite: '#F5F5FA',
      },
      fontFamily: '"JetBrains Mono", "Fira Code", monospace',
      fontSize: 13,
      cursorBlink: true,
      cursorStyle: 'bar',
      allowTransparency: true,
    });

    const fitAddon = new FitAddon();
    xterm.loadAddon(fitAddon);
    xterm.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = xterm;

    xterm.onData((data) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(data);
      }
    });

    const stored = typeof window !== 'undefined' ? localStorage.getItem('nomos_terminal_ws_url') : null;
    const wsUrl = stored || process.env.NEXT_PUBLIC_TERMINAL_WS_URL || 'ws://localhost:8080';
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    const msg = (text: string, color: string) => `\x1b[${color}m${text}\x1b[0m\r\n`;

    ws.onopen = () => xterm.writeln(msg(t('terminal:connected'), '1;32'));
    ws.onclose = () => xterm.writeln(msg(t('terminal:disconnected'), '1;33'));
    ws.onerror = () => xterm.writeln(msg(t('terminal:connectError'), '1;31'));
    ws.onmessage = (event) => xterm.write(event.data);

    const handleResize = () => fitAddon.fit();
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
      className={`relative bg-[#0F0F13] overflow-hidden transition-all duration-normal animate-slide-up ${
        isMaximized ? 'fixed inset-4 z-50 rounded-2xl border border-border/40 shadow-xl-soft' : ''
      }`}
      style={{ zIndex }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={bringToFront}
    >
      {/* Title bar — macOS window chrome style */}
      <div className="h-9 bg-[#1A1A26] flex items-center justify-between px-3 cursor-move select-none border-b border-white/[0.04]">
        <div className="flex items-center gap-2">
          {/* Traffic light dots */}
          <div className="flex items-center gap-1.5 mr-2">
            <button
              onClick={close}
              className="w-3 h-3 rounded-full bg-[#F25C5C] hover:bg-[#F78C8C] transition-colors flex items-center justify-center"
              title={t('terminal:close')}
            >
              {isHovered && <X className="w-2 h-2 text-[#4D0000]" />}
            </button>
            <button
              onClick={toggleMaximize}
              className="w-3 h-3 rounded-full bg-[#E5C94D] hover:bg-[#EDD971] transition-colors flex items-center justify-center"
              title={t('terminal:maximize')}
            >
              {isHovered && (
                isMaximized
                  ? <Minimize2 className="w-2 h-2 text-[#4D3A00]" />
                  : <Maximize2 className="w-2 h-2 text-[#4D3A00]" />
              )}
            </button>
            <div className="w-3 h-3 rounded-full bg-[#5CBF7B] hover:bg-[#7DD694] transition-colors flex items-center justify-center">
              {isHovered && <Minus className="w-2 h-2 text-[#003A15]" />}
            </div>
          </div>
          <Terminal className="w-3.5 h-3.5 text-white/40" />
          <span className="text-xs text-white/50 font-medium tracking-wide">
            {t('terminal:title')}
          </span>
        </div>
      </div>

      {/* Terminal body */}
      <div ref={terminalRef} className="h-64 p-2" />
    </div>
  );
}
