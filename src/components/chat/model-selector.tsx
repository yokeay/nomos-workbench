'use client';

import { useTranslation } from 'react-i18next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const models = [
  { value: 'claude-3-5-sonnet-20241022', labelKey: 'models.claude35sonnet', providerKey: 'models.anthropic' },
  { value: 'gpt-4o', labelKey: 'models.gpt4o', providerKey: 'models.openai' },
  { value: 'gpt-4-turbo', labelKey: 'models.gpt4turbo', providerKey: 'models.openai' },
  { value: 'gpt-3.5-turbo', labelKey: 'models.gpt35turbo', providerKey: 'models.openai' },
  { value: 'llama3', labelKey: 'models.llama3', providerKey: 'models.ollama' },
  { value: 'qwen2', labelKey: 'models.qwen2', providerKey: 'models.ollama' },
];

export function ModelSelector({ value, onChange }: ModelSelectorProps) {
  const { t } = useTranslation();

  return (
    <Select value={value} onValueChange={(v) => v && onChange(v)}>
      <SelectTrigger className="w-48 h-8 bg-muted/50 border-border text-foreground text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-background border-border">
        {models.map((model) => (
          <SelectItem
            key={model.value}
            value={model.value}
            className="text-foreground hover:bg-muted text-xs"
          >
            <div className="flex items-center justify-between w-full">
              <span>{t(model.labelKey)}</span>
              <span className="text-muted-foreground ml-2">{t(model.providerKey)}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
