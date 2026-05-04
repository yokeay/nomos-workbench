'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useTerminalStore } from '@/stores';
import { LayoutDashboard, Calendar, Settings, Terminal } from 'lucide-react';

export function Sidebar() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { isOpen, open } = useTerminalStore();

  const navItems = [
    { href: '/dashboard', label: t('sidebar.dashboard'), icon: LayoutDashboard },
    { href: '/calendar', label: t('sidebar.calendar'), icon: Calendar },
    { href: '/settings', label: t('sidebar.settings'), icon: Settings },
  ];

  return (
    <aside className="w-16 bg-sidebar border-r border-sidebar-border flex flex-col h-full shrink-0 z-20">
      {/* Logo */}
      <div className="h-14 flex items-center justify-center border-b border-sidebar-border">
        <span className="text-foreground font-bold text-lg tracking-tight select-none">
          N
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 space-y-1 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={cn(
                'relative flex items-center justify-center h-11 rounded-xl transition-all duration-normal',
                isActive
                  ? 'bg-sidebar-active text-sidebar-foreground shadow-subtle'
                  : 'text-muted-foreground/60 hover:text-sidebar-foreground/80 hover:bg-sidebar-hover'
              )}
            >
              <Icon className="w-5 h-5" />
            </Link>
          );
        })}
      </nav>

      {/* Terminal Toggle */}
      <div className="py-3 px-2 border-t border-sidebar-border">
        <button
          onClick={() => !isOpen && open()}
          title={t('sidebar.terminal')}
          className={cn(
            'w-full h-11 flex items-center justify-center rounded-xl transition-all duration-normal',
            isOpen
              ? 'bg-sidebar-active text-sidebar-foreground shadow-subtle'
              : 'text-muted-foreground/60 hover:text-sidebar-foreground/80 hover:bg-sidebar-hover'
          )}
        >
          <Terminal className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
}
