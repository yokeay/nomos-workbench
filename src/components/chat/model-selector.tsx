'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from '@/components/ui/select';

interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const shortLabels: Record<string, string> = {
  'claude-3-5-sonnet-20241022': 'models:claude35sonnetShort',
  'gpt-4o': 'models:gpt4oShort',
  'gpt-4-turbo': 'models:gpt4turboShort',
  'gpt-3.5-turbo': 'models:gpt35turboShort',
  'llama3': 'models:llama3Short',
  'qwen2': 'models:qwen2Short',
};

const builtinGroups = [
  {
    providerKey: 'models:anthropic',
    models: [
      { value: 'claude-3-5-sonnet-20241022', labelKey: 'models:claude35sonnet' },
    ],
  },
  {
    providerKey: 'models:openai',
    models: [
      { value: 'gpt-4o', labelKey: 'models:gpt4o' },
      { value: 'gpt-4-turbo', labelKey: 'models:gpt4turbo' },
      { value: 'gpt-3.5-turbo', labelKey: 'models:gpt35turbo' },
    ],
  },
  {
    providerKey: 'models:ollama',
    models: [
      { value: 'llama3', labelKey: 'models:llama3' },
      { value: 'qwen2', labelKey: 'models:qwen2' },
    ],
  },
];

type ModelDef = { value: string; labelKey: string };
type ProviderGroup = { providerKey: string; models: ModelDef[] };

export function ModelSelector({ value, onChange }: ModelSelectorProps) {
  const { t } = useTranslation();
  const [customGroups, setCustomGroups] = useState<ProviderGroup[]>([]);

  useEffect(() => {
    fetch('/api/settings/api-keys')
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 0 && Array.isArray(d.data)) {
          const groups: ProviderGroup[] = [];
          for (const cfg of d.data) {
            if (cfg.provider === 'custom' && Array.isArray(cfg.models) && cfg.models.length > 0) {
              groups.push({
                providerKey: 'models:custom',
                models: cfg.models.map((m: string) => ({ value: m, labelKey: m })),
              });
            }
          }
          setCustomGroups(groups);
        }
      })
      .catch(() => {});
  }, []);

  const mergedShort: Record<string, string> = { ...shortLabels };
  for (const g of customGroups) {
    for (const m of g.models) {
      mergedShort[m.value] = m.value;
    }
  }

  const allGroups = [...builtinGroups, ...customGroups];

  const displayLabel = value && mergedShort[value]
    ? t(mergedShort[value])
    : t('chat:modelSelector');

  return (
    <Select value={value} onValueChange={(v) => v && onChange(v)}>
      <SelectTrigger className="w-[110px] h-8 bg-accent/50 border-transparent text-foreground/70 text-xs font-medium rounded-lg hover:bg-accent/80 hover:text-foreground transition-all duration-fast">
        <span className="text-xs font-medium whitespace-nowrap">
          {displayLabel}
        </span>
      </SelectTrigger>
      <SelectContent className="glass border-border/60 shadow-lg-soft rounded-xl p-1 animate-scale-in min-w-[200px]">
        {allGroups.map((group) => (
          <SelectGroup key={group.providerKey}>
            <SelectLabel>{t(group.providerKey)}</SelectLabel>
            {group.models.map((model) => (
              <SelectItem
                key={model.value}
                value={model.value}
                className="text-foreground hover:bg-accent/60 text-xs rounded-lg cursor-pointer transition-colors duration-fast"
              >
                <span className="font-medium">{t(model.labelKey)}</span>
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}
