'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '@/stores';
import { useAuth } from '@/hooks/use-auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { User, Palette, Globe, Key, HardDrive, Save, Server, Terminal as TerminalIcon, LogIn, Filter, AlertTriangle } from 'lucide-react';
import { sources } from '@/lib/newsnow/sources';
import { useNewsFilterStore, batchPersist, deselectAllSources } from '@/stores/news-filter';

export default function SettingsPage() {
  const { t } = useTranslation();
  const { theme, toggleTheme, locale, setLocale } = useSettingsStore();
  const { isLoggedIn } = useAuth();
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
      if (d.code === 0) toast.success(t('common:success') as string);
      else toast.error(d.message || t('common:error') as string);
    } catch {
      toast.error(t('common:error') as string);
    }
  };

  return (
    <div className="h-full p-6 overflow-auto no-scrollbar">
      <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-accent/60 flex items-center justify-center">
            <User className="w-5 h-5 text-foreground/60" />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{t('settings:title')}</h1>
        </div>

        {/* Login gate */}
        {!isLoggedIn && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/30 border border-border/30 text-xs text-muted-foreground/60">
            <LogIn className="w-3.5 h-3.5 shrink-0" />
            <span>请先登录后修改设置</span>
            <a href="/login" className="ml-auto text-primary/60 hover:text-primary/80 underline underline-offset-2">前往登录</a>
          </div>
        )}

        {/* Profile */}
        <Card className="bg-card/60 border-border/60 shadow-sm-soft rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <User className="w-4 h-4 text-foreground/50" />
              {t('settings:profile')}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground/70">
              Manage your personal information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">{t('settings:name')}</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!isLoggedIn}
                className="h-10 bg-muted/50 border-border/60 rounded-xl text-sm focus:bg-input-background focus:border-border focus:ring-1 focus:ring-ring/20 transition-all duration-normal"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">{t('settings:email')}</label>
              <Input
                value={email}
                disabled
                className="h-10 bg-muted/30 border-border/40 rounded-xl text-sm opacity-50"
              />
            </div>
            <Button
              onClick={handleSave}
              disabled={!isLoggedIn}
              className="rounded-xl h-10 px-5 gap-2"
            >
              <Save className="w-4 h-4" />
              {t('common:confirm')}
            </Button>
          </CardContent>
        </Card>

        {/* Theme */}
        <Card className="bg-card/60 border-border/60 shadow-sm-soft rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Palette className="w-4 h-4 text-foreground/50" />
              {t('settings:theme')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                onClick={toggleTheme}
                className="rounded-xl h-10 px-5 text-sm font-medium transition-all duration-normal"
              >
                {t('settings:dark')}
              </Button>
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                onClick={toggleTheme}
                className="rounded-xl h-10 px-5 text-sm font-medium transition-all duration-normal"
              >
                {t('settings:light')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Language */}
        <Card className="bg-card/60 border-border/60 shadow-sm-soft rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Globe className="w-4 h-4 text-foreground/50" />
              {t('settings:language')}
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
              {t('settings:apiKeys')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ApiKeysManager />
          </CardContent>
        </Card>

        {/* Storage */}
        <Card className="bg-card/60 border-border/60 shadow-sm-soft rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Server className="w-4 h-4 text-foreground/50" />
              {t('settings:storage')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StorageManager />
          </CardContent>
        </Card>

        {/* Terminal */}
        <Card className="bg-card/60 border-border/60 shadow-sm-soft rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TerminalIcon className="w-4 h-4 text-foreground/50" />
              {t('settings:terminal')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TerminalManager />
          </CardContent>
        </Card>

        {/* News Filter */}
        <Card className="bg-card/60 border-border/60 shadow-sm-soft rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Filter className="w-4 h-4 text-foreground/50" />
              {t('settings:newsFilter')}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground/70">
              {t('settings:newsFilterDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NewsFilterManager />
          </CardContent>
        </Card>

        {/* Backup */}
        <Card className="bg-card/60 border-border/60 shadow-sm-soft rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-foreground/50" />
              {t('settings:backup')}
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
  const { isLoggedIn } = useAuth();
  const [keys, setKeys] = useState<any[]>([]);
  const [provider, setProvider] = useState('anthropic');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('claude-3-5-sonnet-20241022');
  const [baseUrl, setBaseUrl] = useState('');
  const [saving, setSaving] = useState(false);
  // Custom provider: fetched model list + selected models
  const [customModels, setCustomModels] = useState<string[]>([]);
  const [selectedModels, setSelectedModels] = useState<Set<string>>(new Set());
  const [fetchingModels, setFetchingModels] = useState(false);
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

  // Reset custom state when provider changes
  useEffect(() => {
    if (provider !== 'custom') {
      setCustomModels([]);
      setSelectedModels(new Set());
    }
  }, [provider]);

  const handleFetchModels = async () => {
    if (!baseUrl.trim() || !apiKey.trim()) {
      toast.error('请先填写 Base URL 和 API 密钥');
      return;
    }
    setFetchingModels(true);
    try {
      const res = await fetch('/api/settings/fetch-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseUrl: baseUrl.trim(), apiKey: apiKey.trim() }),
      });
      const d = await res.json();
      if (d.code === 0 && d.data?.length > 0) {
        setCustomModels(d.data);
        // Pre-select all models by default
        setSelectedModels(new Set(d.data));
        toast.success(`已加载 ${d.data.length} 个模型`);
      } else {
        toast.error(d.message || '未获取到模型列表');
      }
    } catch {
      toast.error('获取模型列表失败');
    }
    setFetchingModels(false);
  };

  const toggleModel = (m: string) => {
    setSelectedModels(prev => {
      const next = new Set(prev);
      if (next.has(m)) next.delete(m); else next.add(m);
      return next;
    });
  };

  const handleSave = async () => {
    if (!apiKey.trim()) return;
    setSaving(true);
    try {
      const body: any = { provider, apiKey, model, baseUrl };
      if (provider === 'custom' && selectedModels.size > 0) {
        body.modelsJson = [...selectedModels];
        body.model = 'custom'; // placeholder, real model picked in chat
      }
      const res = await fetch('/api/settings/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const d = await res.json();
      if (d.code === 0) {
        setApiKey('');
        setCustomModels([]);
        setSelectedModels(new Set());
        fetchKeys();
        toast.success(t('common:success') as string);
      } else toast.error(d.message || t('common:error') as string);
    } catch {
      toast.error(t('common:error') as string);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">
            {t('settings:provider')}
          </label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            disabled={!isLoggedIn}
            className="w-full h-9 px-3 rounded-xl bg-muted/50 border border-border/60 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring/20 transition-all duration-fast disabled:opacity-50"
          >
            <option value="anthropic">{t('models:anthropic')}</option>
            <option value="openai">{t('models:openai')}</option>
            <option value="ollama">{t('models:ollama')}</option>
            <option value="custom">{t('models:custom')}</option>
          </select>
        </div>
        {provider !== 'custom' ? (
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">
              {t('settings:model')}
            </label>
            <Input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              disabled={!isLoggedIn}
              className="h-9 bg-muted/50 border-border/60 rounded-xl text-sm focus:bg-input-background focus:border-border focus:ring-1 focus:ring-ring/20 transition-all duration-normal"
            />
          </div>
        ) : null}
      </div>
      {provider === 'custom' && (
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">Base URL</label>
          <Input
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            disabled={!isLoggedIn}
            placeholder="https://api.example.com"
            className="h-9 bg-muted/50 border-border/60 rounded-xl text-sm focus:bg-input-background focus:border-border focus:ring-1 focus:ring-ring/20 transition-all duration-normal"
          />
        </div>
      )}
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1.5">{t('settings:apiKey')}</label>
        <Input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          disabled={!isLoggedIn}
          className="h-9 bg-muted/50 border-border/60 rounded-xl text-sm focus:bg-input-background focus:border-border focus:ring-1 focus:ring-ring/20 transition-all duration-normal"
          placeholder="sk-..."
        />
      </div>
      {provider !== 'custom' && (
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">{t('settings:baseUrl')}</label>
          <Input
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            disabled={!isLoggedIn}
            className="h-9 bg-muted/50 border-border/60 rounded-xl text-sm focus:bg-input-background focus:border-border focus:ring-1 focus:ring-ring/20 transition-all duration-normal"
          />
        </div>
      )}

      {/* Custom: fetch models button + model list */}
      {provider === 'custom' && (
        <div className="space-y-3">
          <Button
            onClick={handleFetchModels}
            disabled={fetchingModels || !baseUrl.trim() || !apiKey.trim() || !isLoggedIn}
            variant="secondary"
            className="rounded-xl h-9 px-4 text-sm font-medium transition-all duration-normal"
          >
            {fetchingModels ? '加载中...' : '刷新模型列表'}
          </Button>

          {customModels.length > 0 && (
            <div className="p-3 rounded-xl bg-muted/20 border border-border/30 max-h-48 overflow-y-auto">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                已选中 {selectedModels.size}/{customModels.length} 个模型
              </p>
              <div className="space-y-1">
                {customModels.map(m => (
                  <label key={m} className="flex items-center gap-2 cursor-pointer text-xs py-1">
                    <input
                      type="checkbox"
                      checked={selectedModels.has(m)}
                      onChange={() => toggleModel(m)}
                      className="rounded accent-foreground"
                    />
                    <span className="text-foreground/80">{m}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!isLoggedIn && (
        <p className="text-[10px] text-muted-foreground/40 flex items-center gap-1">
          <LogIn className="w-3 h-3" />
          请先登录后管理 API 密钥
        </p>
      )}
      <Button
        onClick={handleSave}
        disabled={saving || !apiKey.trim() || !isLoggedIn}
        className="rounded-xl h-9 px-4 text-sm font-medium transition-all duration-normal"
      >
        {saving ? t('settings:saving') : t('settings:save')}
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
              <span>{k.hasKey ? '••••' : t('settings:apiKeyNone')}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StorageManager() {
  const { t } = useTranslation();
  const { isLoggedIn } = useAuth();
  const [provider, setProvider] = useState('local');
  const [s3Endpoint, setS3Endpoint] = useState('');
  const [s3Region, setS3Region] = useState('');
  const [s3Bucket, setS3Bucket] = useState('');
  const [s3AccessKey, setS3AccessKey] = useState('');
  const [s3SecretKey, setS3SecretKey] = useState('');
  const [s3PublicUrl, setS3PublicUrl] = useState('');
  const [dufsUrl, setDufsUrl] = useState('');
  const [dufsKey, setDufsKey] = useState('');
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetch('/api/settings/preferences')
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 0 && d.data) {
          setProvider(d.data.storageProvider || 'local');
          let c: any = {};
          try { c = JSON.parse(d.data.storageConfig || '{}'); } catch { /* */ }
          if (d.data.storageProvider === 's3') {
            setS3Endpoint(c.endpoint || '');
            setS3Region(c.region || '');
            setS3Bucket(c.bucket || '');
            setS3AccessKey(c.accessKey || '');
            setS3SecretKey(c.secretKey || '');
            setS3PublicUrl(c.publicUrl || '');
          } else if (d.data.storageProvider === 'dufs') {
            setDufsUrl(c.serverUrl || '');
            setDufsKey(c.authKey || '');
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      let config: any = {};
      if (provider === 's3') {
        config = { endpoint: s3Endpoint, region: s3Region, bucket: s3Bucket, accessKey: s3AccessKey, secretKey: s3SecretKey, publicUrl: s3PublicUrl };
      } else if (provider === 'dufs') {
        config = { serverUrl: dufsUrl, authKey: dufsKey };
      }

      const res = await fetch('/api/settings/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storageProvider: provider, storageConfig: JSON.stringify(config) }),
      });
      const d = await res.json();
      if (d.code === 0) toast.success(t('common:success') as string);
      else toast.error(d.message || t('common:error') as string);
    } catch {
      toast.error(t('common:error') as string);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      {/* Provider selector */}
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-2">
          {t('settings:storageProvider')}
        </label>
        <div className="flex gap-2">
          {(['local', 's3', 'dufs'] as const).map((p) => (
            <Button
              key={p}
              variant={provider === p ? 'default' : 'outline'}
              onClick={() => setProvider(p)}
              disabled={!isLoggedIn}
              className="rounded-xl h-9 px-4 text-sm font-medium transition-all duration-normal"
            >
              {p === 'local' ? t('settings:storageLocal') : p === 's3' ? t('settings:storageS3') : t('settings:storageDufs')}
            </Button>
          ))}
        </div>
      </div>

      {/* Local desc */}
      {provider === 'local' && (
        <p className="text-xs text-muted-foreground/50">{t('settings:storageLocalDesc')}</p>
      )}

      {/* S3 config */}
      {provider === 's3' && (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">{t('settings:storageEndpoint')}</label>
            <Input
              value={s3Endpoint}
              onChange={(e) => setS3Endpoint(e.target.value)}
              disabled={!isLoggedIn}
              placeholder="https://s3.amazonaws.com"
              className="h-9 bg-muted/50 border-border/60 rounded-xl text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">{t('settings:storageRegion')}</label>
              <Input
                value={s3Region}
                onChange={(e) => setS3Region(e.target.value)}
                disabled={!isLoggedIn}
                placeholder="us-east-1"
                className="h-9 bg-muted/50 border-border/60 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">{t('settings:storageBucket')}</label>
              <Input
                value={s3Bucket}
                onChange={(e) => setS3Bucket(e.target.value)}
                disabled={!isLoggedIn}
                placeholder="my-bucket"
                className="h-9 bg-muted/50 border-border/60 rounded-xl text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">{t('settings:storageAccessKey')}</label>
              <Input
                value={s3AccessKey}
                onChange={(e) => setS3AccessKey(e.target.value)}
                disabled={!isLoggedIn}
                className="h-9 bg-muted/50 border-border/60 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">{t('settings:storageSecretKey')}</label>
              <Input
                type="password"
                value={s3SecretKey}
                onChange={(e) => setS3SecretKey(e.target.value)}
                disabled={!isLoggedIn}
                className="h-9 bg-muted/50 border-border/60 rounded-xl text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">{t('settings:storagePublicUrl')}</label>
            <Input
              value={s3PublicUrl}
              onChange={(e) => setS3PublicUrl(e.target.value)}
              disabled={!isLoggedIn}
              placeholder="https://cdn.example.com"
              className="h-9 bg-muted/50 border-border/60 rounded-xl text-sm"
            />
          </div>
        </div>
      )}

      {/* DUFS config */}
      {provider === 'dufs' && (
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">{t('settings:storageServerUrl')}</label>
          <Input
            value={dufsUrl}
            onChange={(e) => setDufsUrl(e.target.value)}
            disabled={!isLoggedIn}
            placeholder="http://192.168.1.100:5000"
            className="h-9 bg-muted/50 border-border/60 rounded-xl text-sm"
          />
          <p className="text-[10px] text-muted-foreground/40 mt-1">{t('settings:storageServerUrlDesc')}</p>

          <label className="text-xs font-medium text-muted-foreground block mt-3 mb-1.5">{t('settings:storageDufsAuthKey')}</label>
          <Input
            value={dufsKey}
            onChange={(e) => setDufsKey(e.target.value)}
            disabled={!isLoggedIn}
            type="password"
            placeholder="请输入 DUFS 认证密钥"
            className="h-9 bg-muted/50 border-border/60 rounded-xl text-sm"
          />
          <p className="text-[10px] text-muted-foreground/40 mt-1">{t('settings:storageDufsAuthKeyDesc')}</p>
        </div>
      )}

      {!isLoggedIn && (
        <p className="text-[10px] text-muted-foreground/40 flex items-center gap-1">
          <LogIn className="w-3 h-3" />
          请先登录后管理存储设置
        </p>
      )}

      <Button
        onClick={handleSave}
        disabled={saving || !isLoggedIn}
        className="rounded-xl h-9 px-4 text-sm font-medium transition-all duration-normal"
      >
        {saving ? t('settings:saving') : t('settings:save')}
      </Button>
    </div>
  );
}

function TerminalManager() {
  const { t } = useTranslation();
  const { isLoggedIn } = useAuth();
  const [wsUrl, setWsUrl] = useState('');
  const [initialized, setInitialized] = useState(false);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetch('/api/settings/preferences')
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 0 && d.data?.terminalWsUrl) {
          setWsUrl(d.data.terminalWsUrl);
        } else {
          const stored = localStorage.getItem('nomos_terminal_ws_url');
          if (stored) setWsUrl(stored);
        }
      })
      .catch(() => {
        const stored = localStorage.getItem('nomos_terminal_ws_url');
        if (stored) setWsUrl(stored);
      })
      .finally(() => setInitialized(true));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const url = wsUrl.trim() || '';
    localStorage.setItem('nomos_terminal_ws_url', url);
    const ok = await fetch('/api/settings/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ terminalWsUrl: url }),
    }).then(r => r.json()).then(d => d.code === 0).catch(() => false);
    if (ok) toast.success(t('common:success') as string);
    else toast.error(t('common:error') as string);
    setSaving(false);
  };

  if (!initialized) return null;

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1.5">{t('settings:terminalWsUrl')}</label>
        <Input
          value={wsUrl}
          onChange={(e) => setWsUrl(e.target.value)}
          disabled={!isLoggedIn}
          placeholder="ws://192.168.1.100:8080"
          className="h-9 bg-muted/50 border-border/60 rounded-xl text-sm"
        />
        <p className="text-[10px] text-muted-foreground/40 mt-1">{t('settings:terminalWsUrlDesc')}</p>
      </div>
      {!isLoggedIn && (
        <p className="text-[10px] text-muted-foreground/40 flex items-center gap-1">
          <LogIn className="w-3 h-3" />
          请先登录后配置终端
        </p>
      )}
      <Button
        onClick={handleSave}
        disabled={!isLoggedIn || saving}
        className="rounded-xl h-9 px-4 text-sm font-medium transition-all duration-normal"
      >
        {saving ? t('settings:saving') : t('settings:save')}
      </Button>
    </div>
  );
}

function BackupManager() {
  const { t } = useTranslation();
  const { isLoggedIn } = useAuth();
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
        toast.success(t('common:success') as string);
      }
    } catch {
      toast.error(t('common:error') as string);
    }
    setLoading(false);
  };

  const restore = async (name: string) => {
    if (!confirm(t('settings:backupConfirm', { name }))) return;
    try {
      const res = await fetch('/api/backup', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backupName: name }),
      });
      const d = await res.json();
      if (d.code === 0) {
        toast.success(t('settings:backupRestored') as string);
        setTimeout(() => location.reload(), 1500);
      }
    } catch {
      toast.error(t('common:error') as string);
    }
  };

  return (
    <div className="space-y-3">
      {!isLoggedIn && (
        <p className="text-[10px] text-muted-foreground/40 flex items-center gap-1">
          <LogIn className="w-3 h-3" />
          请先登录后管理备份
        </p>
      )}
      <Button
        onClick={createBackup}
        disabled={loading || !isLoggedIn}
        className="rounded-xl h-9 px-4 text-sm font-medium transition-all duration-normal"
      >
        {loading ? t('settings:backupCreating') : t('settings:backupCreate')}
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
              disabled={!isLoggedIn}
              className="h-7 px-3 rounded-lg text-xs hover:bg-accent/60 transition-all duration-fast"
            >
              {t('settings:backupRestore')}
            </Button>
          </div>
        ))}
        {backups.length === 0 && (
          <span className="text-xs text-muted-foreground/50 font-medium">{t('settings:backupNone')}</span>
        )}
      </div>
    </div>
  );
}

const COLUMN_LABELS: Record<string, string> = {
  tech: 'settings:newsFilterColumnTech',
  china: 'settings:newsFilterColumnChina',
  finance: 'settings:newsFilterColumnFinance',
  world: 'settings:newsFilterColumnWorld',
}

function NewsFilterManager() {
  const { t } = useTranslation()
  const store = useNewsFilterStore()
  const toast = useToast()
  const [mounted, setMounted] = useState(false)
  const [localDisabled, setLocalDisabled] = useState<Set<string>>(new Set())
  const [serverDisabled, setServerDisabled] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // Load from server on mount, fall back to store
  useEffect(() => {
    if (!mounted) return
    fetch('/api/settings/preferences')
      .then(r => r.json())
      .then(d => {
        if (d.code === 0 && d.data?.newsFilter) {
          try {
            const arr = JSON.parse(d.data.newsFilter)
            if (Array.isArray(arr)) {
              const s = new Set(arr)
              setLocalDisabled(s)
              setServerDisabled(s)
              return
            }
          } catch { /* */ }
        }
        // Fall back to store
        const fromStore = new Set(store.disabledSourceIds)
        setLocalDisabled(fromStore)
        setServerDisabled(fromStore)
      })
      .catch(() => {
        const fromStore = new Set(store.disabledSourceIds)
        setLocalDisabled(fromStore)
        setServerDisabled(fromStore)
      })
  }, [mounted])

  if (!mounted) return null

  const allIDs = Array.from(sources.keys())
  const hasChanges = !setsEqual(localDisabled, serverDisabled)

  // Group by column
  const groups: Record<string, typeof allIDs> = { other: [] }
  for (const id of allIDs) {
    const meta = sources.get(id)
    const col = meta?.definition.column || 'other'
    const key = COLUMN_LABELS[col] ? col : 'other'
    if (!groups[key]) groups[key] = []
    groups[key].push(id)
  }

  const enabledCount = allIDs.filter((id) => !localDisabled.has(id)).length

  const toggleLocal = (id: string) => {
    setLocalDisabled((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAllLocal = () => setLocalDisabled(new Set())
  const deselectAllLocal = () => setLocalDisabled(new Set(allIDs))

  const handleSave = () => {
    setSaving(true)
    batchPersist(localDisabled)
    setServerDisabled(new Set(localDisabled))
    toast.success(t('common:success') as string)
    setSaving(false)
  }

  return (
    <div className="space-y-3">
      {/* Summary + actions */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground/60">
          {t('settings:newsFilterEnabled')}: {enabledCount}/{allIDs.length}
        </span>
        <div className="flex gap-1.5">
          <button
            onClick={selectAllLocal}
            className="text-[10px] px-2 py-1 rounded-lg bg-muted/50 border border-border/40 text-muted-foreground/70 hover:text-foreground/80 transition-colors"
          >
            {t('settings:newsFilterSelectAll')}
          </button>
          <button
            onClick={deselectAllLocal}
            className="text-[10px] px-2 py-1 rounded-lg bg-muted/50 border border-border/40 text-muted-foreground/70 hover:text-foreground/80 transition-colors"
          >
            {t('settings:newsFilterDeselectAll')}
          </button>
        </div>
      </div>

      {/* Columns */}
      {Object.entries(groups).map(([col, ids]) => {
        if (ids.length === 0) return null
        const labelKey = COLUMN_LABELS[col] || 'settings:newsFilterColumnOther'
        return (
          <div key={col}>
            <div className="text-[10px] font-medium text-muted-foreground/50 mb-1.5 uppercase tracking-wider">
              {t(labelKey)}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ids.map((id) => {
                const meta = sources.get(id)
                const name = meta?.definition.name || id
                const enabled = !localDisabled.has(id)
                return (
                  <button
                    key={id}
                    onClick={() => toggleLocal(id)}
                    className={`
                      text-[10px] px-2.5 py-1 rounded-full border transition-all duration-fast
                      ${enabled
                        ? 'bg-accent/40 border-border/50 text-foreground/70 hover:bg-accent/60'
                        : 'bg-transparent border-border/20 text-muted-foreground/30 hover:border-border/40 line-through'
                      }
                    `}
                  >
                    {name}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Unsaved changes indicator */}
      {hasChanges && (
        <div className="flex items-center gap-1.5 text-[11px] text-amber-500/80">
          <AlertTriangle className="w-3 h-3" />
          有未保存的更改
        </div>
      )}

      {/* Save button */}
      <Button
        onClick={handleSave}
        disabled={saving || !hasChanges}
        className="rounded-xl h-9 px-4 text-sm font-medium transition-all duration-normal gap-2"
      >
        <Save className="w-3.5 h-3.5" />
        {saving ? '保存中...' : '保存更改'}
      </Button>
    </div>
  )
}

function setsEqual(a: Set<string>, b: Set<string>) {
  if (a.size !== b.size) return false
  for (const x of a) if (!b.has(x)) return false
  return true
}
