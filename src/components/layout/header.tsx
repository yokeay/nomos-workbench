'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '@/stores';
import { VERSION } from '@/constants/version';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Command, Sun, Moon, Languages, User, LogOut } from 'lucide-react';

export function Header() {
  const { t } = useTranslation();
  const { theme, toggleTheme, locale, setLocale } = useSettingsStore();
  const [currentDate, setCurrentDate] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fmt = () =>
      new Date().toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });

    setCurrentDate(fmt());
    const timer = setInterval(() => setCurrentDate(fmt()), 3600000);
    return () => clearInterval(timer);
  }, [locale]);

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
      {/* Left: Brand + Search */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="flex items-baseline gap-1.5">
          <span className="text-foreground font-bold text-xl tracking-tight select-none">
            NOMOS
          </span>
          <span className="text-muted-foreground/60 text-[10px] font-medium tracking-wide">
            v{VERSION}
          </span>
        </div>
        <div className="relative group">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40 pointer-events-none transition-colors group-hover:text-muted-foreground/60" />
          <input
            ref={searchRef}
            type="search"
            placeholder={t('header:search')}
            className="w-40 h-8 pl-8 pr-8 bg-muted/60 border border-transparent text-sm text-foreground placeholder:text-muted-foreground/40 rounded-lg transition-all duration-normal focus:outline-none focus:bg-input-background focus:border-border focus:ring-1 focus:ring-ring/20 focus:w-56"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 text-muted-foreground/30 text-[10px] pointer-events-none">
            <Command className="w-2.5 h-2.5" />
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right section */}
      <div className="flex items-center gap-5 flex-shrink-0">
        <span className="text-muted-foreground/70 text-xs font-medium tracking-wide select-none">
          {currentDate}
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none group">
            <Avatar className="w-8 h-8 ring-1 ring-border/50 ring-offset-1 ring-offset-transparent transition-all duration-normal group-hover:ring-border group-hover:shadow-md-soft">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold uppercase tracking-wide">
                U
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-52 glass border-border/60 shadow-lg-soft rounded-xl p-1 animate-scale-in"
          >
            <DropdownMenuItem className="gap-3 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent/60 cursor-pointer transition-colors duration-fast">
              <User className="w-4 h-4" />
              {t('common:profile')}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-3 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent/60 cursor-pointer transition-colors duration-fast"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
              {theme === 'dark' ? t('header:lightMode') : t('header:darkMode')}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/50 my-1" />
            <DropdownMenuItem
              className="gap-3 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent/60 cursor-pointer transition-colors duration-fast"
              onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')}
            >
              <Languages className="w-4 h-4" />
              {locale === 'zh' ? t('header:english') : t('header:chinese')}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/50 my-1" />
            <DropdownMenuItem className="gap-3 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer transition-colors duration-fast">
              <LogOut className="w-4 h-4" />
              {t('common:logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
