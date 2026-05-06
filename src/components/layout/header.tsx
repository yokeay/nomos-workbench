'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { VERSION } from '@/constants/version';
import { Search, Command, Clock } from 'lucide-react';
import { WeatherWidget } from '@/components/weather/weather-widget';


function getTimeString(tz: string) {
  const now = new Date();
  const opts: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: tz,
  };
  return new Intl.DateTimeFormat('zh-CN', opts).format(now);
}

function getDateString(tz: string) {
  const now = new Date();
  const opts: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    timeZone: tz,
  };
  return new Intl.DateTimeFormat('zh-CN', opts).format(now);
}

const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

const ALL_ZONES = [
  { label: '本地', tz: localTz },
  { label: 'UTC', tz: 'UTC' },
  { label: '北京', tz: 'Asia/Shanghai' },
  { label: '东京', tz: 'Asia/Tokyo' },
  { label: '纽约', tz: 'America/New_York' },
  { label: '洛杉矶', tz: 'America/Los_Angeles' },
  { label: '伦敦', tz: 'Europe/London' },
];

// Deduplicate if local matches a listed zone
const seen = new Set<string>();
const TIMEZONES = ALL_ZONES.filter((z) => {
  if (seen.has(z.tz)) return false;
  seen.add(z.tz);
  return true;
});

export function Header() {
  const { t } = useTranslation();
  const [dateTop, setDateTop] = useState('');
  const [dateBottom, setDateBottom] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const [zoneTimes, setZoneTimes] = useState<{ label: string; date: string; time: string }[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);
  const timeTriggerRef = useRef<HTMLButtonElement>(null);
  const timePopoverRef = useRef<HTMLDivElement>(null);

  // Update local time display every second
  useEffect(() => {
    const fmt = () => {
      const now = new Date();
      const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      const y = now.getFullYear();
      const m = now.getMonth() + 1;
      const d = now.getDate();
      const w = weekdays[now.getDay()];
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');
      setDateTop(`${y}年${m}月${d}日`);
      setDateBottom(`${w} ${hh}:${mm}:${ss}`);
    };

    fmt();
    const timer = setInterval(fmt, 1000);
    return () => clearInterval(timer);
  }, []);

  // Update timezone times every second when popover is open
  useEffect(() => {
    if (!timeOpen) return;
    const fmt = () => {
      setZoneTimes(
        TIMEZONES.map((z) => ({
          label: z.label,
          date: getDateString(z.tz),
          time: getTimeString(z.tz),
        }))
      );
    };
    fmt();
    const timer = setInterval(fmt, 1000);
    return () => clearInterval(timer);
  }, [timeOpen]);

  // Close time popover on outside click
  useEffect(() => {
    if (!timeOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        timePopoverRef.current &&
        !timePopoverRef.current.contains(e.target as Node) &&
        timeTriggerRef.current &&
        !timeTriggerRef.current.contains(e.target as Node)
      ) {
        setTimeOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [timeOpen]);

  // Cmd/Ctrl+K to focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <header className="glass h-14 border-b flex items-center px-5 shrink-0 z-30">
      {/* Left: Brand */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="flex items-baseline gap-1.5">
          <span className="text-foreground font-bold text-xl tracking-tight select-none">
            NOMOS
          </span>
          <span className="text-muted-foreground/60 text-[10px] font-medium tracking-wide">
            v{VERSION}
          </span>
        </div>

        {/* Weather + Location */}
        <WeatherWidget />

        {/* Date + Time (clickable for multi-timezone popover) */}
        <div className="relative flex items-center">
          <button
            ref={timeTriggerRef}
            onClick={() => setTimeOpen(!timeOpen)}
            className="flex flex-col items-end select-none leading-tight cursor-pointer hover:opacity-80 transition-opacity"
          >
            <span className="text-foreground/80 text-[11px] font-medium tracking-wide tabular-nums">
              {dateTop}
            </span>
            <span className="text-muted-foreground/50 text-[10px] tabular-nums flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              {dateBottom}
            </span>
          </button>

          {/* Multi-timezone popover */}
          {timeOpen && (
              <div
                ref={timePopoverRef}
                className="absolute left-0 top-full mt-2 w-64 bg-popover border border-border/50 shadow-lg-soft rounded-2xl p-3 z-50 animate-scale-in"
              >
              <div className="text-xs font-semibold text-foreground mb-2 px-1">
                世界时钟
              </div>
              <div className="space-y-0.5">
                {zoneTimes.map((z) => (
                  <div
                    key={z.label}
                    className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-accent/40 transition-colors duration-fast"
                  >
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground/50 leading-tight">
                        {z.date}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-foreground tabular-nums">
                        {z.time}
                      </span>
                      <span className="text-[10px] text-muted-foreground/50 bg-muted/60 px-1.5 py-0.5 rounded">
                        {z.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right: Search */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="relative group">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40 pointer-events-none transition-colors group-hover:text-muted-foreground/60" />
          <input
            ref={searchRef}
            type="search"
            placeholder={t('header:search')}
            className="w-48 h-8 pl-8 pr-8 bg-muted/60 border border-transparent text-sm text-foreground placeholder:text-muted-foreground/40 rounded-lg transition-all duration-normal focus:outline-none focus:bg-input-background focus:border-border focus:ring-1 focus:ring-ring/20 focus:w-80"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 text-muted-foreground/30 text-[10px] pointer-events-none">
            <Command className="w-2.5 h-2.5" />
            <span>K</span>
          </div>
        </div>
      </div>
    </header>
  );
}
