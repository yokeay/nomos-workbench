'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useTerminalStore } from '@/stores';
import { Globe, LayoutDashboard, Calendar, Settings, Terminal } from 'lucide-react';

export function Sidebar() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const { isOpen, open } = useTerminalStore();

  const handleTerminalClick = () => {
    open();
    if (pathname !== '/dashboard') {
      router.push('/dashboard');
    }
  };

  const navItems = [
    { href: '/', label: '首页', icon: Globe },
    { href: '/tags', label: t('sidebar:tags'), icon: LayoutDashboard },
    { href: '/memos', label: t('sidebar:calendar'), icon: Calendar },
    { href: '/settings', label: t('sidebar:settings'), icon: Settings },
  ];

  const handleNavClick = (href: string) => {
    if (pathname === href) {
      router.back();
    } else {
      router.push(href);
    }
  };

  return (
    <aside className="w-16 bg-sidebar border-r border-sidebar-border flex flex-col h-full shrink-0 z-20">
      {/* Navigation */}
      <nav className="flex-1 pt-1 pb-3 space-y-1 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <button
              key={item.href}
              onClick={() => handleNavClick(item.href)}
              title={item.label}
              className={cn(
                'relative flex items-center justify-center h-11 rounded-xl transition-all duration-normal w-full',
                isActive
                  ? 'bg-sidebar-active text-sidebar-foreground shadow-subtle'
                  : 'text-muted-foreground/60 hover:text-sidebar-foreground/80 hover:bg-sidebar-hover'
              )}
            >
              <Icon className="w-5 h-5" />
            </button>
          );
        })}

        {/* Terminal Toggle — inline with nav items */}
        <button
          onClick={handleTerminalClick}
          title={t('sidebar:terminal')}
          className={cn(
            'relative flex items-center justify-center h-11 rounded-xl transition-all duration-normal w-full',
            isOpen
              ? 'bg-sidebar-active text-sidebar-foreground shadow-subtle'
              : 'text-muted-foreground/60 hover:text-sidebar-foreground/80 hover:bg-sidebar-hover'
          )}
        >
          <Terminal className="w-5 h-5" />
        </button>
      </nav>
    </aside>
  );
}
