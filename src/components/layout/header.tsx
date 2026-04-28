'use client';

import { useState, useRef, useEffect } from 'react';
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
  const { theme, toggleTheme } = useSettingsStore();
  const [currentDate, setCurrentDate] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    // Set current date on mount
    const now = new Date();
    setCurrentDate(
      now.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    );

    // Update date at midnight
    const updateDate = () => {
      const now = new Date();
      setCurrentDate(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })
      );
    };

    const timer = setTimeout(updateDate, 1000 * 60 * 60); // Check every hour
    return () => clearTimeout(timer);
  }, []);

  return (
    <header className="h-14 bg-background border-b border-border flex items-center px-4">
      {/* Logo */}
      <div className="w-48 flex-shrink-0">
        <span className="text-foreground font-bold text-xl tracking-tight">NOMOS</span>
        <span className="text-muted-foreground text-[10px] ml-1.5 self-center mt-1">v{VERSION}</span>
      </div>

      {/* Search */}
      <div className="flex-1 flex justify-center px-8">
        <div className="w-full max-w-md relative">
          <Input
            type="search"
            placeholder="Search anything..."
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

      {/* Right Section */}
      <div className="w-48 flex items-center justify-end gap-4">
        {/* Date */}
        <span className="text-muted-foreground text-sm">{currentDate}</span>

        {/* User Menu */}
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
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem className="text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer">
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
