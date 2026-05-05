import { addClient, removeClient } from '@/lib/newsnow/scheduler';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  let controller: ReadableStreamDefaultController | null = null;

  const stream = new ReadableStream({
    start(c) {
      controller = c;
      addClient(c);
    },
    cancel() {
      if (controller) removeClient(controller);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
