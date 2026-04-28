import { auth } from '@/lib/auth';
import { db, aiConfigs, chatSessions, chatMessages, timelineAiEvents } from '@/lib/db';
import { createAIProvider, buildSystemPrompt, AIError } from '@/lib/ai';
import { decrypt } from '@/lib/crypto';
import { loadKnowledgeFiles } from '@/lib/knowledge';
import { eq, and, desc } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import type { InferInsertModel } from 'drizzle-orm';
import type { TimelineAiEvent } from '@/lib/db/schema';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { code: 1001, message: 'Unauthorized', data: null },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const { message, model, sessionId } = await request.json();
    if (!message?.trim()) {
      return NextResponse.json(
        { code: 400, message: 'Message is required', data: null },
        { status: 400 }
      );
    }

    // Find active AI config for the user
    const [aiConfig] = await db
      .select()
      .from(aiConfigs)
      .where(and(eq(aiConfigs.userId, userId), eq(aiConfigs.isActive, 1)))
      .limit(1);

    if (!aiConfig) {
      return NextResponse.json(
        { code: 2002, message: 'AI model not configured', data: null },
        { status: 400 }
      );
    }

    // Create AI provider with decrypted API key
    const provider = createAIProvider({
      provider: aiConfig.provider as 'anthropic' | 'openai' | 'ollama' | 'groq' | 'siliconflow' | 'custom',
      model: model || aiConfig.model,
      apiKey: aiConfig.apiKey ? decrypt(aiConfig.apiKey) : undefined,
      baseUrl: aiConfig.baseUrl || undefined,
    });

    // Load knowledge files
    const knowledgeContent = await loadKnowledgeFiles(userId);

    // Build system prompt with knowledge
    const systemPrompt = buildSystemPrompt(knowledgeContent);

    // Get or create chat session
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      // Create new session with truncated title from first message
      const title = message.slice(0, 30) + (message.length > 30 ? '...' : '');
      currentSessionId = uuidv4();
      const now = Date.now();

      await db.insert(chatSessions).values({
        id: currentSessionId,
        userId: userId,
        title,
        model: model || aiConfig.model,
        createdAt: now,
        updatedAt: now,
      });
    }

    // Get existing messages for context
    const existingMessages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, currentSessionId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(20);

    // Convert to Message format (reverse to get chronological order)
    const historyMessages = existingMessages.reverse().map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let fullContent = '';

        try {
          await provider.chatStream(
            [...historyMessages, { role: 'user' as const, content: message }],
            systemPrompt,
            (chunk) => {
              fullContent += chunk.content;
              controller.enqueue(encoder.encode(chunk.content));
            }
          );

          // Save messages to database
          const now = Date.now();

          // Save user message
          await db.insert(chatMessages).values({
            id: uuidv4(),
            sessionId: currentSessionId!,
            role: 'user',
            content: message,
            createdAt: now,
          });

          // Save assistant message
          await db.insert(chatMessages).values({
            id: uuidv4(),
            sessionId: currentSessionId!,
            role: 'assistant',
            content: fullContent,
            createdAt: now,
          });

          // Create AI timeline event
          const eventDate = new Date().toISOString().split('T')[0];
          const eventData: InferInsertModel<typeof timelineAiEvents> = {
            id: uuidv4(),
            userId: userId,
            type: 'ai_response',
            content: JSON.stringify({
              message: fullContent.slice(0, 200) + (fullContent.length > 200 ? '...' : ''),
              model: model || aiConfig.model,
              sessionId: currentSessionId,
            }),
            eventDate,
            createdAt: now,
          };
          await db.insert(timelineAiEvents).values(eventData);

          // Update session timestamp
          await db
            .update(chatSessions)
            .set({ updatedAt: now })
            .where(eq(chatSessions.id, currentSessionId!));

        } catch (error) {
          console.error('AI streaming error:', error);
          const errMsg = error instanceof AIError ? error.message : 'AI error';
          controller.enqueue(encoder.encode(`\n\nError: ${errMsg}`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });

  } catch (error) {
    console.error('Chat API error:', error);
    if (error instanceof AIError) {
      const codeMap: Record<string, number> = { AUTH_ERROR: 2003, RATE_LIMIT: 2004, UNKNOWN: 2001 };
      const statusMap: Record<string, number> = { AUTH_ERROR: 401, RATE_LIMIT: 429, UNKNOWN: 500 };
      const code = codeMap[error.code] ?? 2001;
      const status = statusMap[error.code] ?? 500;
      return NextResponse.json(
        { code, message: error.message, provider: error.provider, data: null },
        { status }
      );
    }
    return NextResponse.json(
      { code: 2001, message: 'AI provider error', data: null },
      { status: 500 }
    );
  }
}