'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useSettingsStore } from '@/stores';
import { useNewsFilterStore } from '@/stores/news-filter';
import { fetchPreferences } from '@/lib/preferences-client';

let serverLoaded = false;

export function SettingsInit() {
  const { isLoggedIn } = useAuth();
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (!isLoggedIn || attemptedRef.current || serverLoaded) return;
    attemptedRef.current = true;
    serverLoaded = true;

    fetchPreferences().then((prefs) => {
      if (!prefs) return;

      // Theme
      if (prefs.theme) {
        useSettingsStore.getState().setTheme(prefs.theme);
      }

      // Locale
      if (prefs.locale) {
        useSettingsStore.getState().setLocale(prefs.locale);
      }

      // News filter
      if (prefs.newsFilter) {
        try {
          const arr = JSON.parse(prefs.newsFilter);
          if (Array.isArray(arr)) {
            useNewsFilterStore.getState().loadFromServer(new Set(arr));
          }
        } catch { /* ignore */ }
      }
    }).catch(() => {
      serverLoaded = false;
    });
  }, [isLoggedIn]);

  return null;
}
