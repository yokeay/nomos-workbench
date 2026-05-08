const PREFERENCES_URL = '/api/settings/preferences';

export interface UserPreferences {
  theme?: 'dark' | 'light';
  locale?: 'zh' | 'en';
  newsFilter?: string;
  terminalWsUrl?: string;
  storageProvider?: string;
  storageConfig?: string;
  searchEngines?: string;
}

export async function fetchPreferences(): Promise<UserPreferences | null> {
  try {
    const r = await fetch(PREFERENCES_URL);
    const d = await r.json();
    if (d.code === 0 && d.data) return d.data;
    return null;
  } catch {
    return null;
  }
}

export async function savePreferences(prefs: Partial<UserPreferences>): Promise<boolean> {
  try {
    const r = await fetch(PREFERENCES_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prefs),
    });
    const d = await r.json();
    return d.code === 0;
  } catch {
    return false;
  }
}
