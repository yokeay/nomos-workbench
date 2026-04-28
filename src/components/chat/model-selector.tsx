'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const models = [
  { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
  { value: 'gpt-4o', label: 'GPT-4o', provider: 'OpenAI' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo', provider: 'OpenAI' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', provider: 'OpenAI' },
  { value: 'llama3', label: 'Llama 3', provider: 'Ollama' },
  { value: 'qwen2', label: 'Qwen 2', provider: 'Ollama' },
];

export function ModelSelector({ value, onChange }: ModelSelectorProps) {
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
              <span>{model.label}</span>
              <span className="text-muted-foreground ml-2">{model.provider}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}