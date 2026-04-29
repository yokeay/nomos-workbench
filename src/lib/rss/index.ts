import Parser from 'rss-parser';
import { db, newsItems, newsSources } from '@/lib/db';
import { eq, and, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import type { InferInsertModel } from 'drizzle-orm';

const parser = new Parser<{ published: string; 'media:content'?: any }>({
  customFields: {
    item: ['media:content'],
  },
});

export async function fetchNews(userId: string) {
  const sources = await db
    .select()
    .from(newsSources)
    .where(and(eq(newsSources.userId, userId), eq(newsSources.isActive, 1)));

  const allItems: InferInsertModel<typeof newsItems>[] = [];
  const today = new Date().toISOString().split('T')[0];

  for (const source of sources) {
    try {
      const feed = await parser.parseURL(source.url);
      const existing = await db
        .select({ url: newsItems.url })
        .from(newsItems)
        .where(eq(newsItems.eventDate, today));

      const existingUrls = new Set(existing.map((e) => e.url));

      for (const item of feed.items.slice(0, 20)) {
        const url = item.link ?? '';
        if (existingUrls.has(url)) continue;

        allItems.push({
          id: uuidv4(),
          userId,
          title: item.title ?? '',
          summary: item.contentSnippet ?? '',
          url,
          source: source.name,
          publishedAt: item.pubDate ? new Date(item.pubDate).getTime() : Date.now(),
          eventDate: today,
          createdAt: Date.now(),
        });
      }

      await db
        .update(newsSources)
        .set({ lastFetchAt: Date.now() })
        .where(eq(newsSources.id, source.id));
    } catch {
      // Skip failed sources
    }
  }

  if (allItems.length > 0) {
    await db.insert(newsItems).values(allItems);
  }

  return allItems.length;
}

export async function getNewsItems(userId: string, _days = 7) {
  return await db
    .select()
    .from(newsItems)
    .where(eq(newsItems.userId, userId))
    .orderBy((t) => desc(t.publishedAt))
    .limit(50);
}

export async function seedDefaultSources(userId: string) {
  const existing = await db
    .select({ id: newsSources.id })
    .from(newsSources)
    .where(eq(newsSources.userId, userId));

  if (existing.length > 0) return;

  const defaults = [
    { name: 'Hacker News', url: 'https://hnrss.org/frontpage', category: 'tech' },
    { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', category: 'tech' },
    { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', category: 'tech' },
    { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index', category: 'tech' },
    { name: 'MIT Tech Review', url: 'https://www.technologyreview.com/feed/', category: 'ai' },
  ];

  const now = Date.now();
  await db.insert(newsSources).values(
    defaults.map((s) => ({
      id: uuidv4(),
      userId,
      name: s.name,
      url: s.url,
      category: s.category,
      isActive: 1,
      fetchInterval: 300,
      createdAt: now,
      updatedAt: now,
    }))
  );
}
