'use client'

import { cn } from '@/lib/utils'

interface SystemInfo {
  hostname: string
  ip: string
  os: string
  cpuPercent: number
  memPercent: number
  diskPercent: number
  netDown: string
  netUp: string
  processes: number
  loadAvg: string
  uptime: string
  cpuHistory: number[]
  memHistory: number[]
}

const PLACEHOLDER: SystemInfo = {
  hostname: '—',
  ip: '—',
  os: '—',
  cpuPercent: 0,
  memPercent: 0,
  diskPercent: 0,
  netDown: '—',
  netUp: '—',
  processes: 0,
  loadAvg: '—',
  uptime: '—',
  cpuHistory: [],
  memHistory: [],
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) {
    return <div className="h-8 flex items-center justify-center text-[10px] text-white/10">—</div>
  }
  const max = Math.max(...data, 1)
  const w = 100
  const h = 32
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-8" preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  )
}

function BarMeter({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden flex-1">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${Math.min(value, 100)}%`, backgroundColor: color }}
      />
    </div>
  )
}

interface SysInfoPanelProps {
  info?: Partial<SystemInfo>
  connectionStatus?: 'connecting' | 'connected' | 'disconnected' | 'error'
  wsUrl?: string
}

export function SysInfoPanel({ info, connectionStatus, wsUrl }: SysInfoPanelProps) {
  const d = { ...PLACEHOLDER, ...info }

  const statusDot = {
    connecting: 'bg-yellow-500',
    connected: 'bg-emerald-500',
    disconnected: 'bg-red-500',
    error: 'bg-red-500',
  }[connectionStatus || 'disconnected']

  const statusText = {
    connecting: '连接中...',
    connected: '已连接',
    disconnected: '未连接',
    error: '连接失败',
  }[connectionStatus || 'disconnected']

  return (
    <div className="bg-[#1A1A26] rounded-xl border border-white/[0.04] divide-y divide-white/[0.04]">
      {/* Row: host / IP / OS */}
      <div className="flex items-center gap-6 px-4 py-2.5">
        <InfoItem label="主机名" value={d.hostname} />
        <InfoItem label="网络地址" value={d.ip} mono />
        <InfoItem label="操作系统" value={d.os} />
      </div>

      {/* Row: CPU / Mem / Disk meters + sparklines */}
      <div className="px-4 py-3 space-y-2.5">
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-white/25 w-8 shrink-0">CPU</span>
          <BarMeter value={d.cpuPercent} color="#5CBF7B" />
          <span className="text-[10px] text-white/40 font-mono w-8 text-right shrink-0">{d.cpuPercent}%</span>
          <div className="w-28 shrink-0">
            <Sparkline data={d.cpuHistory} color="#5CBF7B" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-white/25 w-8 shrink-0">MEM</span>
          <BarMeter value={d.memPercent} color="#5C8BF2" />
          <span className="text-[10px] text-white/40 font-mono w-8 text-right shrink-0">{d.memPercent}%</span>
          <div className="w-28 shrink-0">
            <Sparkline data={d.memHistory} color="#5C8BF2" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-white/25 w-8 shrink-0">DISK</span>
          <BarMeter value={d.diskPercent} color="#B07FF2" />
          <span className="text-[10px] text-white/40 font-mono w-8 text-right shrink-0">{d.diskPercent}%</span>
          <div className="w-28 shrink-0" />
        </div>
      </div>

      {/* Row: network + system info */}
      <div className="flex items-center gap-6 px-4 py-2.5">
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-white/25">网络</span>
          <div className="flex items-center gap-1.5">
            <svg className="w-3 h-3 text-emerald-400/60" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v10M4 8l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[10px] text-white/40 font-mono">{d.netDown}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-3 h-3 text-blue-400/60" viewBox="0 0 16 16" fill="none">
              <path d="M8 14V4M4 8l4-4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[10px] text-white/40 font-mono">{d.netUp}</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[10px]">
          <span className="text-white/25">进程 <span className="text-white/40 font-mono ml-1">{d.processes}</span></span>
          <span className="text-white/25">负载 <span className="text-white/40 font-mono ml-1">{d.loadAvg}</span></span>
          <span className="text-white/25">运行 <span className="text-white/40 font-mono ml-1">{d.uptime}</span></span>
        </div>
      </div>

      {/* Connection status */}
      <div className="flex items-center gap-2 px-4 py-2">
        <div className={cn('w-1.5 h-1.5 rounded-full shrink-0', statusDot)} />
        <span className="text-[10px] text-white/30">{statusText}</span>
        {wsUrl && <span className="text-[10px] text-white/15 ml-auto font-mono truncate">{wsUrl}</span>}
      </div>
    </div>
  )
}

function InfoItem({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <span className="text-[10px] text-white/25 shrink-0">{label}</span>
      <span className={cn('text-xs text-white/60 truncate', mono && 'font-mono text-[11px]')}>{value}</span>
    </div>
  )
}
