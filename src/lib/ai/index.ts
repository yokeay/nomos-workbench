import { Message } from '@/types/ai';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

// Provider configuration
export interface AIProviderConfig {
  provider: 'anthropic' | 'openai' | 'ollama' | 'groq' | 'siliconflow' | 'custom';
  model: string;
  apiKey?: string;
  baseUrl?: string;
}

// Structured error for AI calls
export class AIError extends Error {
  constructor(
    message: string,
    public code: string,
    public provider: string
  ) {
    super(message);
    this.name = 'AIError';
  }
}

// Response types
export interface AIResponse {
  content: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
  stopReason?: string;
}

export interface AIStreamResponse {
  content: string;
  done: boolean;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

/**
 * Base AI Provider interface
 */
export interface AIProvider {
  chat(messages: Message[], systemPrompt?: string): Promise<AIResponse>;
  chatStream(
    messages: Message[],
    systemPrompt?: string,
    onChunk?: (chunk: AIStreamResponse) => void
  ): Promise<void>;
}

/**
 * Anthropic Provider
 */
export class AnthropicProvider implements AIProvider {
  private client: Anthropic;

  constructor(config: AIProviderConfig) {
    this.client = new Anthropic({
      apiKey: config.apiKey,
    });
  }

  async chat(messages: Message[], systemPrompt?: string): Promise<AIResponse> {
    try {
      const response = await this.client.messages.create({
        model: this.extractModelName(),
        max_tokens: 4096,
        system: systemPrompt,
        messages: this.formatMessages(messages),
      });

      const content = response.content[0];
      const textContent = content.type === 'text' ? content.text : '';

      return {
        content: textContent,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        },
        stopReason: response.stop_reason ?? undefined,
      };
    } catch (err: any) {
      const status = err?.status ?? err?.response?.status;
      if (status === 401) throw new AIError('Invalid API key', 'AUTH_ERROR', 'anthropic');
      if (status === 429) throw new AIError('Rate limit exceeded, please try again later', 'RATE_LIMIT', 'anthropic');
      throw new AIError(err?.message ?? 'Anthropic API error', status?.toString() ?? 'UNKNOWN', 'anthropic');
    }
  }

  async chatStream(
    messages: Message[],
    systemPrompt?: string,
    onChunk?: (chunk: AIStreamResponse) => void
  ): Promise<void> {
    const stream = await this.client.messages.stream({
      model: this.extractModelName(),
      max_tokens: 4096,
      system: systemPrompt,
      messages: this.formatMessages(messages),
    });

    for await (const event of stream) {
      // Handle content block delta (text chunks)
      if (event.type === 'content_block_delta' && onChunk) {
        const delta = event.delta as { type?: string; text?: string };
        const text = delta?.text ?? '';
        onChunk({
          content: text,
          done: false,
        });
      }

      // Handle message delta (final message)
      if (event.type === 'message_delta' && onChunk) {
        const delta = event.delta as { stop_reason?: string; usage?: { input_tokens?: number; output_tokens?: number } };
        // This is the final delta, we already processed content via content_block_delta
        onChunk({
          content: '',
          done: delta?.stop_reason === 'end_turn',
          usage: delta?.usage ? {
            inputTokens: delta.usage.input_tokens ?? 0,
            outputTokens: delta.usage.output_tokens ?? 0,
          } : undefined,
        });
      }
    }
  }

  private extractModelName(): string {
    // Model names for Anthropic are already the full name
    return this.client.baseURL.includes('anthropic') ? 'claude-3-5-sonnet-20241022' : '';
  }

  private formatMessages(messages: Message[]) {
    return messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));
  }
}

/**
 * OpenAI Compatible Provider
 */
export class OpenAIProvider implements AIProvider {
  private client: OpenAI;
  private config: AIProviderConfig;

  constructor(config: AIProviderConfig) {
    this.config = config;
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
    });
  }

  async chat(messages: Message[], systemPrompt?: string): Promise<AIResponse> {
    const allMessages = systemPrompt
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages;

    try {
      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages: allMessages as OpenAI.Chat.ChatCompletionMessageParam[],
      });

      const content = response.choices[0]?.message?.content ?? '';

      return {
        content,
        usage: response.usage
          ? {
              inputTokens: response.usage.prompt_tokens,
              outputTokens: response.usage.completion_tokens,
            }
          : undefined,
      };
    } catch (err: any) {
      const status = err?.status ?? err?.response?.status;
      if (status === 401) throw new AIError('Invalid API key', 'AUTH_ERROR', this.config.provider);
      if (status === 429) throw new AIError('Rate limit exceeded, please try again later', 'RATE_LIMIT', this.config.provider);
      throw new AIError(err?.message ?? 'OpenAI-compatible API error', status?.toString() ?? 'UNKNOWN', this.config.provider);
    }
  }

  async chatStream(
    messages: Message[],
    systemPrompt?: string,
    onChunk?: (chunk: AIStreamResponse) => void
  ): Promise<void> {
    const allMessages = systemPrompt
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages;

    const stream = await this.client.chat.completions.create({
      model: this.config.model,
      messages: allMessages as OpenAI.Chat.ChatCompletionMessageParam[],
      stream: true,
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content ?? '';
      if (onChunk) {
        onChunk({
          content: text,
          done: chunk.choices[0]?.finish_reason === 'stop',
          usage: chunk.usage
            ? {
                inputTokens: chunk.usage.prompt_tokens ?? 0,
                outputTokens: chunk.usage.completion_tokens ?? 0,
              }
            : undefined,
        });
      }
    }
  }
}

/**
 * Ollama Provider (local)
 */
export class OllamaProvider implements AIProvider {
  private baseUrl: string;
  private model: string;

  constructor(config: AIProviderConfig) {
    this.baseUrl = config.baseUrl || 'http://localhost:11434';
    this.model = config.model;
  }

  async chat(messages: Message[], systemPrompt?: string): Promise<AIResponse> {
    const allMessages = systemPrompt
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages;

    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        messages: allMessages,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new AIError(`Ollama API error: ${response.statusText}`, response.status.toString(), 'ollama');
    }

    const data = await response.json();
    return {
      content: data.message?.content ?? '',
    };
  }

  async chatStream(
    messages: Message[],
    systemPrompt?: string,
    onChunk?: (chunk: AIStreamResponse) => void
  ): Promise<void> {
    const allMessages = systemPrompt
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages;

    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        messages: allMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new AIError(`Ollama API error: ${response.statusText}`, response.status.toString(), 'ollama');
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const data = JSON.parse(line);
          if (onChunk) {
            onChunk({
              content: data.message?.content ?? '',
              done: data.done ?? false,
            });
          }
        } catch {
          // Skip invalid JSON
        }
      }
    }
  }
}

/**
 * Factory function to create AI provider based on config
 */
export function createAIProvider(config: AIProviderConfig): AIProvider {
  switch (config.provider) {
    case 'anthropic':
      return new AnthropicProvider(config);
    case 'openai':
    case 'groq':
    case 'siliconflow':
    case 'custom':
      return new OpenAIProvider({ ...config, baseUrl: config.baseUrl });
    case 'ollama':
      return new OllamaProvider(config);
    default:
      throw new Error(`Unsupported provider: ${config.provider}`);
  }
}

/**
 * Default system prompt for AI chat
 */
export function buildSystemPrompt(knowledgeContent?: string): string {
  let prompt = `You are a helpful AI assistant in the NOMOS Workbench.

Your responses should be clear, helpful, and well-formatted using Markdown when appropriate.
`;

  if (knowledgeContent) {
    prompt += `
You have access to the following knowledge base. Use this information to answer questions accurately:

${knowledgeContent}
`;
  }

  return prompt;
}