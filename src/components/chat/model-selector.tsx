'use client';

import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronDown } from 'lucide-react';

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
      <SelectTrigger className="w-44 h-8 bg-accent/50 border-transparent text-foreground/70 text-xs font-medium rounded-lg hover:bg-accent/80 hover:text-foreground transition-all duration-fast">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="glass border-border/60 shadow-lg-soft rounded-xl p-1 animate-scale-in">
        {models.map((model) => (
          <SelectItem
            key={model.value}
            value={model.value}
            className="text-foreground hover:bg-accent/60 text-xs rounded-lg cursor-pointer transition-colors duration-fast"
          >
            <div className="flex items-center justify-between w-full gap-3">
              <span className="font-medium">{t(model.labelKey)}</span>
              <span className="text-muted-foreground/60 text-[10px] tracking-wide">
                {t(model.providerKey)}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
