'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '@/stores';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { t } = useTranslation();
  const { theme, toggleTheme, locale, setLocale } = useSettingsStore();
  const toast = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    fetch('/api/settings/profile')
      .then(r => r.json())
      .then(d => { if (d.code === 0) { setName(d.data.name || ''); setEmail(d.data.email || ''); } })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    try {
      const res = await fetch('/api/settings/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const d = await res.json();
      if (d.code === 0) toast.success(t('common.success') as string);
      else toast.error(d.message || t('common.error') as string);
    } catch { toast.error(t('common.error') as string); }
  };

  return (
    <div className="h-full p-6 overflow-auto">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-6">{t('settings.title')}</h1>

        {/* Profile */}
        <Card className="bg-background border-border p-5 mb-6">
          <h2 className="text-base font-semibold text-foreground mb-4">{t('settings.profile')}</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-muted-foreground block mb-1">{t('settings.name')}</label>
              <Input value={name} onChange={e => setName(e.target.value)} className="bg-muted/50 border-border" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground block mb-1">{t('settings.email')}</label>
              <Input value={email} disabled className="bg-muted/50 border-border opacity-60" />
            </div>
            <Button onClick={handleSave}>{t('common.confirm')}</Button>
          </div>
        </Card>

        {/* Theme */}
        <Card className="bg-background border-border p-5 mb-6">
          <h2 className="text-base font-semibold text-foreground mb-4">{t('settings.theme')}</h2>
          <div className="flex gap-3">
            <Button variant={theme === 'dark' ? 'default' : 'outline'} onClick={toggleTheme}>
              {t('settings.dark')}
            </Button>
            <Button variant={theme === 'light' ? 'default' : 'outline'} onClick={toggleTheme}>
              {t('settings.light')}
            </Button>
          </div>
        </Card>

        {/* Language */}
        <Card className="bg-background border-border p-5 mb-6">
          <h2 className="text-base font-semibold text-foreground mb-4">{t('settings.language')}</h2>
          <div className="flex gap-3">
            <Button variant={locale === 'zh' ? 'default' : 'outline'} onClick={() => setLocale('zh')}>中文</Button>
            <Button variant={locale === 'en' ? 'default' : 'outline'} onClick={() => setLocale('en')}>English</Button>
          </div>
        </Card>

        {/* API Keys */}
        <Card className="bg-background border-border p-5 mb-6">
          <h2 className="text-base font-semibold text-foreground mb-4">{t('settings.apiKeys')}</h2>
          <ApiKeysManager />
        </Card>

        {/* Backup */}
        <Card className="bg-background border-border p-5">
          <h2 className="text-base font-semibold text-foreground mb-4">{t('settings.backup')}</h2>
          <BackupManager />
        </Card>
      </div>
    </div>
  );
}

function ApiKeysManager() {
  const { t } = useTranslation();
  const [keys, setKeys] = useState<any[]>([]);
  const [provider, setProvider] = useState('anthropic');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('claude-3-5-sonnet-20241022');
  const [baseUrl, setBaseUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const res = await fetch('/api/settings/api-keys');
      const d = await res.json();
      if (d.code === 0) setKeys(d.data);
    } catch {}
  };

  const handleSave = async () => {
    if (!apiKey.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/settings/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, apiKey, model, baseUrl }),
      });
      const d = await res.json();
      if (d.code === 0) { setApiKey(''); fetchKeys(); toast.success(t('common.success') as string); }
      else toast.error(d.message || t('common.error') as string);
    } catch { toast.error(t('common.error') as string); }
    setSaving(false);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-muted-foreground block mb-1">{t('settings.provider')}</label>
          <select value={provider} onChange={e => setProvider(e.target.value)} className="w-full h-8 px-2 rounded-md bg-muted/50 border border-border text-sm text-foreground">
            <option value="anthropic">{t('models.anthropic')}</option>
            <option value="openai">{t('models.openai')}</option>
            <option value="ollama">{t('models.ollama')}</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-muted-foreground block mb-1">{t('settings.model')}</label>
          <Input value={model} onChange={e => setModel(e.target.value)} className="bg-muted/50 border-border" />
        </div>
      </div>
      <div>
        <label className="text-sm text-muted-foreground block mb-1">{t('settings.apiKey')}</label>
        <Input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} className="bg-muted/50 border-border" placeholder="sk-..." />
      </div>
      <div>
        <label className="text-sm text-muted-foreground block mb-1">{t('settings.baseUrl')}</label>
        <Input value={baseUrl} onChange={e => setBaseUrl(e.target.value)} className="bg-muted/50 border-border" />
      </div>
      <Button onClick={handleSave} disabled={saving || !apiKey.trim()}>
        {saving ? t('settings.saving') : t('settings.save')}
      </Button>
      <div className="mt-3 space-y-1">
        {keys.map((k: any) => (
          <div key={k.id} className="flex items-center justify-between text-sm text-muted-foreground p-2 rounded bg-muted/30">
            <span>{k.provider} / {k.model} {k.isActive ? t('settings.apiKeyActive') : ''}</span>
            <span>{k.hasKey ? '••••' : t('settings.apiKeyNone')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BackupManager() {
  const { t } = useTranslation();
  const [backups, setBackups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const listBackups = async () => {
    try {
      const res = await fetch('/api/backup');
      const d = await res.json();
      if (d.code === 0) setBackups(d.data);
    } catch {}
  };

  useEffect(() => { listBackups(); }, []);

  const createBackup = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/backup', { method: 'POST' });
      const d = await res.json();
      if (d.code === 0) { listBackups(); toast.success(t('common.success') as string); }
    } catch { toast.error(t('common.error') as string); }
    setLoading(false);
  };

  const restore = async (name: string) => {
    if (!confirm(t('settings.backupConfirm', { name }))) return;
    try {
      const res = await fetch('/api/backup', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backupName: name }),
      });
      const d = await res.json();
      if (d.code === 0) {
        toast.success(t('settings.backupRestored') as string);
        setTimeout(() => location.reload(), 1500);
      }
    } catch { toast.error(t('common.error') as string); }
  };

  return (
    <div className="space-y-3">
      <Button onClick={createBackup} disabled={loading}>{loading ? t('settings.backupCreating') : t('settings.backupCreate')}</Button>
      <div className="space-y-1">
        {backups.map((b: any) => (
          <div key={b.name} className="flex items-center justify-between text-sm text-muted-foreground p-2 rounded bg-muted/30">
            <span>{b.name} ({(b.size / 1024).toFixed(1)} KB)</span>
            <Button size="xs" variant="ghost" onClick={() => restore(b.name)}>{t('settings.backupRestore')}</Button>
          </div>
        ))}
        {backups.length === 0 && <span className="text-xs text-muted-foreground">{t('settings.backupNone')}</span>}
      </div>
    </div>
  );
}
