'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useTerminalStore } from '@/stores';

export function Sidebar() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { isOpen, open } = useTerminalStore();

  const navItems = [
    { href: '/dashboard', label: t('sidebar.dashboard'), icon: '📊' },
    { href: '/calendar', label: t('sidebar.calendar'), icon: '📅' },
    { href: '/settings', label: t('sidebar.settings'), icon: '⚙️' },
  ];

  return (
    <aside className="w-16 bg-muted border-r border-border flex flex-col h-full">
      <div className="h-14 flex items-center justify-center border-b border-border">
        <span className="text-foreground font-bold text-lg tracking-tight">N</span>
      </div>

      <nav className="flex-1 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex items-center justify-center h-12 text-muted-foreground hover:text-foreground transition-colors',
                isActive && 'text-foreground'
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-foreground rounded-r" />
              )}
              <span className="text-xl">{item.icon}</span>
            </Link>
          );
        })}
      </nav>

      <div className="py-4 border-t border-border">
        <button
          onClick={() => !isOpen && open()}
          className={cn(
            'w-full h-12 flex items-center justify-center transition-colors',
            isOpen
              ? 'text-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          )}
          title={t('sidebar.terminal')}
        >
          <span className="text-xl">⌨️</span>
        </button>
      </div>
    </aside>
  );
}
