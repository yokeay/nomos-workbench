'use client';

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

const providerGroups = [
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

export function ModelSelector({ value, onChange }: ModelSelectorProps) {
  const { t } = useTranslation();

  const displayLabel = value && shortLabels[value]
    ? t(shortLabels[value])
    : t('chat:modelSelector');

  return (
    <Select value={value} onValueChange={(v) => v && onChange(v)}>
      <SelectTrigger className="w-[110px] h-8 bg-accent/50 border-transparent text-foreground/70 text-xs font-medium rounded-lg hover:bg-accent/80 hover:text-foreground transition-all duration-fast">
        <span className="text-xs font-medium whitespace-nowrap">
          {displayLabel}
        </span>
      </SelectTrigger>
      <SelectContent className="glass border-border/60 shadow-lg-soft rounded-xl p-1 animate-scale-in min-w-[200px]">
        {providerGroups.map((group) => (
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
