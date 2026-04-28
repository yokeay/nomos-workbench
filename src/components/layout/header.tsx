'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '@/stores';
import { VERSION } from '@/constants/version';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function Header() {
  const { t } = useTranslation();
  const { theme, toggleTheme, locale, setLocale } = useSettingsStore();
  const [currentDate, setCurrentDate] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    const now = new Date();
    setCurrentDate(
      now.toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    );
    const timer = setTimeout(() => {
      setCurrentDate(
        new Date().toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })
      );
    }, 3600000);
    return () => clearTimeout(timer);
  }, [locale]);

  return (
    <header className="h-14 bg-background border-b border-border flex items-center px-4">
      <div className="w-48 flex-shrink-0">
        <span className="text-foreground font-bold text-xl tracking-tight">NOMOS</span>
        <span className="text-muted-foreground text-[10px] ml-1.5 self-center mt-1">v{VERSION}</span>
      </div>

      <div className="flex-1 flex justify-center px-8">
        <div className="w-full max-w-md relative">
          <Input
            type="search"
            placeholder={t('header.search')}
            className={`w-full bg-muted/50 border-border text-muted-foreground placeholder:text-muted-foreground/50 pl-10 pr-4 ${
              searchFocused ? 'ring-2 ring-ring' : ''
            }`}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50">
            🔍
          </span>
        </div>
      </div>

      <div className="w-48 flex items-center justify-end gap-4">
        <span className="text-muted-foreground text-sm">{currentDate}</span>

        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <Avatar className="w-8 h-8 bg-primary text-primary-foreground cursor-pointer hover:opacity-80 transition-opacity">
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                U
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-popover text-popover-foreground border-border">
            <DropdownMenuItem className="text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer">
              {t('common.profile')}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? t('header.lightMode') : t('header.darkMode')}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem
              className="text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
              onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')}
            >
              {locale === 'zh' ? t('header.english') : t('header.chinese')}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem className="text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer">
              {t('common.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
