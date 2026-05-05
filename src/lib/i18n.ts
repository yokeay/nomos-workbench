'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { LOCALES, DEFAULT_LOCALE, TRANSLATIONS } from '@/i18n/config';

const getInitialLocale = (): 'zh' | 'en' => {
  if (typeof document !== 'undefined') {
    const stored = localStorage.getItem('nomos_locale');
    if (stored === 'zh' || stored === 'en') return stored;
  }
  return DEFAULT_LOCALE;
};

void i18n.use(initReactI18next).init({
  resources: TRANSLATIONS as any,
  lng: getInitialLocale(),
  fallbackLng: DEFAULT_LOCALE,
  supportedLngs: Object.keys(LOCALES) as ['zh', 'en'],
  ns: ['common', 'chat', 'sidebar', 'header', 'timeline', 'terminal', 'calendar', 'settings', 'models'],
  defaultNS: 'common',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
