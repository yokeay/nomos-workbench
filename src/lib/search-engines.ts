export interface SearchEngine {
  id: string;
  name: string;
  urlTemplate: string;
  icon?: string;
  isDefault: boolean;
}

export const DEFAULT_SEARCH_ENGINES: SearchEngine[] = [
  {
    id: 'google',
    name: 'Google',
    urlTemplate: 'https://www.google.com/search?q={query}',
    isDefault: true,
  },
  {
    id: 'bing',
    name: 'Bing',
    urlTemplate: 'https://www.bing.com/search?q={query}',
    isDefault: true,
  },
  {
    id: 'baidu',
    name: 'Baidu',
    urlTemplate: 'https://www.baidu.com/s?wd={query}',
    isDefault: true,
  },
  {
    id: 'duckduckgo',
    name: 'DuckDuckGo',
    urlTemplate: 'https://duckduckgo.com/?q={query}',
    isDefault: true,
  },
  {
    id: 'github',
    name: 'GitHub',
    urlTemplate: 'https://github.com/search?q={query}',
    isDefault: true,
  },
  {
    id: 'bilibili',
    name: 'Bilibili',
    urlTemplate: 'https://search.bilibili.com/all?keyword={query}',
    isDefault: true,
  },
];

export function buildSearchUrl(engine: SearchEngine, query: string): string {
  return engine.urlTemplate.replace('{query}', encodeURIComponent(query));
}
