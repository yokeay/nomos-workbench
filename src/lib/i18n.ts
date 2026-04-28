'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { LOCALES, DEFAULT_LOCALE, TRANSLATIONS } from '@/i18n/config';

void i18n.use(initReactI18next).init({
  resources: TRANSLATIONS as any,
  lng: DEFAULT_LOCALE,
  fallbackLng: DEFAULT_LOCALE,
  supportedLngs: Object.keys(LOCALES) as ['zh', 'en'],
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
