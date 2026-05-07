'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useSettingsStore } from '@/stores';
import { cn } from '@/lib/utils';
import {
  Globe, LayoutDashboard, Calendar, Settings, Terminal,
  User, Sun, Moon, Languages, LogOut, LogIn,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function Sidebar() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { theme, toggleTheme, locale, setLocale } = useSettingsStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const handleTerminalClick = () => {
    router.push('/terminal');
  };

  const navItems = [
    { href: '/', label: '首页', icon: Globe },
    { href: '/tags', label: t('sidebar:tags'), icon: LayoutDashboard },
    { href: '/memos', label: t('sidebar:calendar'), icon: Calendar },
  ];

  const handleNavClick = (href: string) => {
    if (pathname === href) {
      router.back();
    } else {
      router.push(href);
    }
  };

  const userInitial = session?.user?.name?.charAt(0)?.toUpperCase() || 'U';

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

        {/* Terminal Toggle */}
        <button
          onClick={handleTerminalClick}
          title={t('sidebar:terminal')}
          className={cn(
            'relative flex items-center justify-center h-11 rounded-xl transition-all duration-normal w-full',
            pathname === '/terminal'
              ? 'bg-sidebar-active text-sidebar-foreground shadow-subtle'
              : 'text-muted-foreground/60 hover:text-sidebar-foreground/80 hover:bg-sidebar-hover'
          )}
        >
          <Terminal className="w-5 h-5" />
        </button>
      </nav>

      {/* User avatar — bottom */}
      <div className="pb-3 px-2 flex justify-center" ref={menuRef}>
        {status === 'loading' ? (
          <div className="w-9 h-9 rounded-full bg-muted animate-pulse ring-1 ring-border/30" />
        ) : session?.user ? (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="group focus:outline-none"
              title={session.user.name || 'User'}
            >
              <Avatar className="w-9 h-9 ring-1 ring-border/50 ring-offset-1 ring-offset-transparent transition-all duration-normal group-hover:ring-border group-hover:shadow-md-soft">
                <AvatarImage src={session.user.image || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold uppercase">
                  {userInitial}
                </AvatarFallback>
              </Avatar>
            </button>

            {menuOpen && (
              <div className="absolute bottom-0 left-full ml-3 w-52 glass border border-border/60 shadow-lg-soft rounded-xl p-1 animate-scale-in z-50">
                <div className="px-3 py-2 border-b border-border/40 mb-1">
                  <p className="text-sm font-medium text-foreground truncate">
                    {session.user.name || 'User'}
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 truncate">
                    {session.user.email}
                  </p>
                </div>
                <div
                  className="flex items-center gap-3 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent/60 cursor-pointer transition-colors duration-fast px-3 py-2"
                  onClick={() => { setMenuOpen(false); }}
                >
                  <User className="w-4 h-4" />
                  {t('common:profile')}
                </div>
                <div
                  className="flex items-center gap-3 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent/60 cursor-pointer transition-colors duration-fast px-3 py-2"
                  onClick={() => { toggleTheme(); setMenuOpen(false); }}
                >
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4" />
                  ) : (
                    <Moon className="w-4 h-4" />
                  )}
                  {theme === 'dark' ? t('header:lightMode') : t('header:darkMode')}
                </div>
                <div className="border-t border-border/50 my-1" />
                <div
                  className="flex items-center gap-3 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent/60 cursor-pointer transition-colors duration-fast px-3 py-2"
                  onClick={() => { setLocale(locale === 'zh' ? 'en' : 'zh'); setMenuOpen(false); }}
                >
                  <Languages className="w-4 h-4" />
                  {locale === 'zh' ? t('header:english') : t('header:chinese')}
                </div>
                <div
                  className="flex items-center gap-3 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent/60 cursor-pointer transition-colors duration-fast px-3 py-2"
                  onClick={() => { router.push('/settings'); setMenuOpen(false); }}
                >
                  <Settings className="w-4 h-4" />
                  {t('common:settings')}
                </div>
                <div className="border-t border-border/50 my-1" />
                <div
                  className="flex items-center gap-3 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer transition-colors duration-fast px-3 py-2"
                  onClick={() => { setMenuOpen(false); signOut({ callbackUrl: '/login' }); }}
                >
                  <LogOut className="w-4 h-4" />
                  {t('common:logout')}
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => signIn(undefined, { callbackUrl: '/' })}
            title="登录"
            className="flex items-center justify-center h-9 w-9 rounded-xl text-muted-foreground/50 hover:text-sidebar-foreground/80 hover:bg-sidebar-hover transition-all duration-normal"
          >
            <LogIn className="w-5 h-5" />
          </button>
        )}
      </div>
    </aside>
  );
}
