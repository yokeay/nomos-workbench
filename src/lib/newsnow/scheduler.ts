import { sources } from './sources';
import { getCache, setCache, isFresh, isWithin24h } from './cache';
import { db, newsTimeline } from '@/lib/db';
import type { TimelineItem, NewsItem } from './types';

interface SSEClient {
  controller: ReadableStreamDefaultController;
  encoder: TextEncoder;
}

// Prevent unhandled rejections from crashing the server
process.on('unhandledRejection', (reason) => {
  console.error('newsnow: unhandled rejection', reason);
});
process.on('uncaughtException', (err) => {
  console.error('newsnow: uncaught exception', err);
});

// Use globalThis to survive Next.js hot reload in dev
const g = globalThis as unknown as {
  __newsnow_clients?: Set<SSEClient>;
  __newsnow_timer?: ReturnType<typeof setInterval> | null;
  __newsnow_running?: boolean;
};

const clients: Set<SSEClient> = g.__newsnow_clients ?? (g.__newsnow_clients = new Set());
let timer = g.__newsnow_timer ?? null;

function broadcast(data: object) {
  const message = `data: ${JSON.stringify(data)}\n\n`;
  for (const client of clients) {
    try {
      client.controller.enqueue(client.encoder.encode(message));
    } catch {
      clients.delete(client);
    }
  }
}

async function fetchAndBroadcast() {
  try {
  const sourceIDs = Array.from(sources.keys());
  const staleIDs = sourceIDs.filter(id => {
    const sourceMeta = sources.get(id);
    if (!sourceMeta) return false;
    return !isFresh(id, sourceMeta.definition.interval);
  });

  if (staleIDs.length === 0) return;

  const results = await Promise.allSettled(
    staleIDs.map(async (id) => {
      const sourceMeta = sources.get(id);
      if (!sourceMeta) return null;
      try {
        const items = await sourceMeta.getter();
        setCache(id, items);
        return { id, items, sourceMeta };
      } catch {
        const cached = getCache(id);
        return cached ? { id, items: cached.items, sourceMeta } : null;
      }
    }),
  );

  const freshItems: TimelineItem[] = [];
  const perSource = 5;

  for (const result of results) {
    if (result.status === 'fulfilled' && result.value) {
      const { id, items, sourceMeta } = result.value;
      const sorted = [...items].sort((a, b) => {
        const da = a.pubDate ?? 0;
        const db = b.pubDate ?? 0;
        return (db as number) - (da as number) || 0;
      });
      for (const item of sorted.slice(0, perSource)) {
        if (!isWithin24h(item)) continue;
        freshItems.push({
          ...item,
          sourceId: id,
          sourceName: sourceMeta.definition.name,
          sourceColor: sourceMeta.definition.color || 'gray',
          sourcePriority: sourceMeta.definition.priority ?? 99,
        });
      }
    }
  }

  if (freshItems.length === 0) return;

  // Persist to DB (upsert), skip errors
  const now = Date.now();
  for (const item of freshItems) {
    const compositeId = `${item.sourceId}-${item.id}`;
    try {
      const dbAny = db as any;
      await dbAny.insert(newsTimeline).values({
        id: compositeId,
        sourceId: item.sourceId,
        sourceName: item.sourceName,
        sourceColor: item.sourceColor,
        title: item.title,
        url: item.url,
        extra: item.extra ? JSON.stringify(item.extra) : null,
        pubDate: typeof item.pubDate === 'string' ? Date.parse(item.pubDate) : (item.pubDate ?? 0) as number,
        createdAt: now,
      }).onConflictDoNothing().execute();
    } catch (e: any) {
      console.error('DB insert error:', e?.message || e, 'compositeId:', compositeId);
    }
  }

  // Broadcast to SSE clients
  if (clients.size > 0) {
    freshItems.sort((a, b) => {
      const pa = a.sourcePriority ?? 99;
      const pb = b.sourcePriority ?? 99;
      if (pa !== pb) return pa - pb;
      const da = a.pubDate ?? 0;
      const db = b.pubDate ?? 0;
      return (db as number) - (da as number) || 0;
    });
    broadcast({ items: freshItems, updatedAt: now });
  }
} catch (err) {
  console.error('fetchAndBroadcast error:', err);
}
}

function buildSnapshot(): TimelineItem[] {
  const allItems: TimelineItem[] = [];
  const perSource = 5;

  for (const [id, sourceMeta] of sources) {
    const cached = getCache(id);
    if (!cached || cached.items.length === 0) continue;
    const sorted = [...cached.items].sort((a, b) => {
      const da = a.pubDate ?? 0;
      const db = b.pubDate ?? 0;
      return (db as number) - (da as number) || 0;
    });
    for (const item of sorted.slice(0, perSource)) {
      if (!isWithin24h(item)) continue;
      allItems.push({
        ...item,
        sourceId: id,
        sourceName: sourceMeta.definition.name,
        sourceColor: sourceMeta.definition.color || 'gray',
        sourcePriority: sourceMeta.definition.priority ?? 99,
      });
    }
  }

  allItems.sort((a, b) => {
    const pa = a.sourcePriority ?? 99;
    const pb = b.sourcePriority ?? 99;
    if (pa !== pb) return pa - pb;
    const da = a.pubDate ?? 0;
    const db = b.pubDate ?? 0;
    return (db as number) - (da as number) || 0;
  });

  // Dedup
  const seen = new Set<string>();
  return allItems.filter(item => {
    const key = `${item.sourceId}-${item.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function addClient(controller: ReadableStreamDefaultController) {
  const encoder = new TextEncoder();
  const client: SSEClient = { controller, encoder };

  // Send initial heartbeat
  controller.enqueue(encoder.encode(':ok\n\n'));
  clients.add(client);

  // Send current cached state as initial data (always, even if empty)
  const snapshot = buildSnapshot();
  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ items: snapshot, updatedAt: Date.now(), init: true })}\n\n`));

  // Start scheduler on first client
  if (!timer) {
    // Initial fetch for stale sources
    fetchAndBroadcast();
    // Schedule periodic fetch (check every 30s, each source has its own TTL)
    timer = setInterval(fetchAndBroadcast, 30_000);
    g.__newsnow_timer = timer;
  }
}

export function removeClient(controller: ReadableStreamDefaultController) {
  for (const client of clients) {
    if (client.controller === controller) {
      clients.delete(client);
      break;
    }
  }
  // Stop scheduler when no clients
  if (clients.size === 0 && timer) {
    clearInterval(timer);
    timer = null;
    g.__newsnow_timer = null;
  }
}
