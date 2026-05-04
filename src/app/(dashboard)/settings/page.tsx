'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '@/stores';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { User, Palette, Globe, Key, HardDrive, Save } from 'lucide-react';

export default function SettingsPage() {
  const { t } = useTranslation();
  const { theme, toggleTheme, locale, setLocale } = useSettingsStore();
  const toast = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    fetch('/api/settings/profile')
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 0) {
          setName(d.data.name || '');
          setEmail(d.data.email || '');
        }
      })
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
    } catch {
      toast.error(t('common.error') as string);
    }
  };

  return (
    <div className="h-full p-6 overflow-auto">
      <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-accent/60 flex items-center justify-center">
            <User className="w-5 h-5 text-foreground/60" />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{t('settings.title')}</h1>
        </div>

        {/* Profile */}
        <Card className="bg-card/60 border-border/60 shadow-sm-soft rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <User className="w-4 h-4 text-foreground/50" />
              {t('settings.profile')}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground/70">
              Manage your personal information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">{t('settings.name')}</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 bg-muted/50 border-border/60 rounded-xl text-sm focus:bg-input-background focus:border-border focus:ring-1 focus:ring-ring/20 transition-all duration-normal"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">{t('settings.email')}</label>
              <Input
                value={email}
                disabled
                className="h-10 bg-muted/30 border-border/40 rounded-xl text-sm opacity-50"
              />
            </div>
            <Button
              onClick={handleSave}
              className="rounded-xl h-10 px-5 gap-2"
            >
              <Save className="w-4 h-4" />
              {t('common.confirm')}
            </Button>
          </CardContent>
        </Card>

        {/* Theme */}
        <Card className="bg-card/60 border-border/60 shadow-sm-soft rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Palette className="w-4 h-4 text-foreground/50" />
              {t('settings.theme')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                onClick={toggleTheme}
                className="rounded-xl h-10 px-5 text-sm font-medium transition-all duration-normal"
              >
                {t('settings.dark')}
              </Button>
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                onClick={toggleTheme}
                className="rounded-xl h-10 px-5 text-sm font-medium transition-all duration-normal"
              >
                {t('settings.light')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Language */}
        <Card className="bg-card/60 border-border/60 shadow-sm-soft rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Globe className="w-4 h-4 text-foreground/50" />
              {t('settings.language')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                variant={locale === 'zh' ? 'default' : 'outline'}
                onClick={() => setLocale('zh')}
                className="rounded-xl h-10 px-5 text-sm font-medium transition-all duration-normal"
              >
                中文
              </Button>
              <Button
                variant={locale === 'en' ? 'default' : 'outline'}
                onClick={() => setLocale('en')}
                className="rounded-xl h-10 px-5 text-sm font-medium transition-all duration-normal"
              >
                English
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* API Keys */}
        <Card className="bg-card/60 border-border/60 shadow-sm-soft rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Key className="w-4 h-4 text-foreground/50" />
              {t('settings.apiKeys')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ApiKeysManager />
          </CardContent>
        </Card>

        {/* Backup */}
        <Card className="bg-card/60 border-border/60 shadow-sm-soft rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-foreground/50" />
              {t('settings.backup')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BackupManager />
          </CardContent>
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
      if (d.code === 0) {
        setApiKey('');
        fetchKeys();
        toast.success(t('common.success') as string);
      } else toast.error(d.message || t('common.error') as string);
    } catch {
      toast.error(t('common.error') as string);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">
            {t('settings.provider')}
          </label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="w-full h-9 px-3 rounded-xl bg-muted/50 border border-border/60 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring/20 transition-all duration-fast"
          >
            <option value="anthropic">{t('models.anthropic')}</option>
            <option value="openai">{t('models.openai')}</option>
            <option value="ollama">{t('models.ollama')}</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">
            {t('settings.model')}
          </label>
          <Input
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="h-9 bg-muted/50 border-border/60 rounded-xl text-sm focus:bg-input-background focus:border-border focus:ring-1 focus:ring-ring/20 transition-all duration-normal"
          />
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1.5">{t('settings.apiKey')}</label>
        <Input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="h-9 bg-muted/50 border-border/60 rounded-xl text-sm focus:bg-input-background focus:border-border focus:ring-1 focus:ring-ring/20 transition-all duration-normal"
          placeholder="sk-..."
        />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1.5">{t('settings.baseUrl')}</label>
        <Input
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          className="h-9 bg-muted/50 border-border/60 rounded-xl text-sm focus:bg-input-background focus:border-border focus:ring-1 focus:ring-ring/20 transition-all duration-normal"
        />
      </div>
      <Button
        onClick={handleSave}
        disabled={saving || !apiKey.trim()}
        className="rounded-xl h-9 px-4 text-sm font-medium transition-all duration-normal"
      >
        {saving ? t('settings.saving') : t('settings.save')}
      </Button>

      {/* Existing keys */}
      {keys.length > 0 && (
        <div className="space-y-1.5 mt-3">
          {keys.map((k: any) => (
            <div
              key={k.id}
              className="flex items-center justify-between text-xs text-muted-foreground p-3 rounded-xl bg-muted/30 border border-border/30"
            >
              <span className="font-medium">{k.provider} / {k.model}</span>
              <span>{k.hasKey ? '••••' : t('settings.apiKeyNone')}</span>
            </div>
          ))}
        </div>
      )}
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

  useEffect(() => {
    listBackups();
  }, []);

  const createBackup = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/backup', { method: 'POST' });
      const d = await res.json();
      if (d.code === 0) {
        listBackups();
        toast.success(t('common.success') as string);
      }
    } catch {
      toast.error(t('common.error') as string);
    }
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
    } catch {
      toast.error(t('common.error') as string);
    }
  };

  return (
    <div className="space-y-3">
      <Button
        onClick={createBackup}
        disabled={loading}
        className="rounded-xl h-9 px-4 text-sm font-medium transition-all duration-normal"
      >
        {loading ? t('settings.backupCreating') : t('settings.backupCreate')}
      </Button>
      <div className="space-y-1.5">
        {backups.map((b: any) => (
          <div
            key={b.name}
            className="flex items-center justify-between text-xs text-muted-foreground p-3 rounded-xl bg-muted/30 border border-border/30"
          >
            <span className="font-medium">{b.name} ({(b.size / 1024).toFixed(1)} KB)</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => restore(b.name)}
              className="h-7 px-3 rounded-lg text-xs hover:bg-accent/60 transition-all duration-fast"
            >
              {t('settings.backupRestore')}
            </Button>
          </div>
        ))}
        {backups.length === 0 && (
          <span className="text-xs text-muted-foreground/50 font-medium">{t('settings.backupNone')}</span>
        )}
      </div>
    </div>
  );
}
