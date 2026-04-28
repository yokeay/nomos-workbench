'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useTerminalStore } from '@/stores';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/calendar', label: 'Calendar', icon: '📅' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isOpen, open } = useTerminalStore();

  return (
    <aside className="w-16 bg-muted border-r border-border flex flex-col h-full">
      {/* Logo */}
      <div className="h-14 flex items-center justify-center border-b border-border">
        <span className="text-foreground font-bold text-lg tracking-tight">N</span>
      </div>

      {/* Navigation */}
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

      {/* Terminal Button */}
      <div className="py-4 border-t border-border">
        <button
          onClick={() => !isOpen && open()}
          className={cn(
            'w-full h-12 flex items-center justify-center transition-colors',
            isOpen
              ? 'text-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          )}
          title="Terminal"
        >
          <span className="text-xl">⌨️</span>
        </button>
      </div>
    </aside>
  );
}
