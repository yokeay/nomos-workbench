'use client'

import { useEffect, useRef, useCallback } from 'react'
import { Terminal as XTerm } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'

interface TerminalPanelProps {
  className?: string
  onStatusChange?: (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void
}

export function TerminalPanel({ className, onStatusChange }: TerminalPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<XTerm | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)

  const dispose = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    if (xtermRef.current) {
      xtermRef.current.dispose()
      xtermRef.current = null
    }
    fitAddonRef.current = null
  }, [])

  useEffect(() => {
    if (!containerRef.current || xtermRef.current) return

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
    })

    const fitAddon = new FitAddon()
    xterm.loadAddon(fitAddon)
    xterm.open(containerRef.current)
    fitAddon.fit()
    fitAddonRef.current = fitAddon

    xtermRef.current = xterm

    xterm.onData((data) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(data)
      }
    })

    const stored = typeof window !== 'undefined' ? localStorage.getItem('nomos_terminal_ws_url') : null
    const wsUrl = stored || process.env.NEXT_PUBLIC_TERMINAL_WS_URL || 'ws://localhost:8080'

    onStatusChange?.('connecting')

    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      xterm.writeln('\x1b[1;32m●\x1b[0m 已连接到终端服务器')
      onStatusChange?.('connected')
    }
    ws.onclose = () => {
      xterm.writeln('\x1b[1;33m●\x1b[0m 连接已断开')
      onStatusChange?.('disconnected')
    }
    ws.onerror = () => {
      xterm.writeln('\x1b[1;31m●\x1b[0m 连接错误')
      onStatusChange?.('error')
    }
    ws.onmessage = (event) => xterm.write(event.data)

    const ro = new ResizeObserver(() => {
      fitAddon.fit()
    })
    ro.observe(containerRef.current)

    return () => {
      ro.disconnect()
      dispose()
    }
  }, [dispose, onStatusChange])

  return (
    <div
      ref={containerRef}
      className={className}
    />
  )
}
