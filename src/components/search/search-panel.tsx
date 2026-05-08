'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Globe, ArrowUpRight, Hash, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { mockCategories } from '@/lib/tag-grid/mock-data';
import type { TagItem } from '@/lib/tag-grid/types';
import {
  DEFAULT_SEARCH_ENGINES,
  buildSearchUrl,
  type SearchEngine,
} from '@/lib/search-engines';

function getAllTags(): TagItem[] {
  const tags: TagItem[] = [];
  for (const cat of mockCategories) {
    for (const sub of cat.subCategories) {
      for (const tag of sub.tags) {
        tags.push(tag);
      }
    }
  }
  return tags;
}

const allTags = getAllTags();

interface SearchPanelProps {
  open: boolean;
  onClose: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

export function SearchPanel({ open, onClose, inputRef }: SearchPanelProps) {
  const { t } = useTranslation();
  const { isLoggedIn } = useAuth();
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const [engines, setEngines] = useState<SearchEngine[]>(DEFAULT_SEARCH_ENGINES);
  const [selectedEngine, setSelectedEngine] = useState<SearchEngine>(DEFAULT_SEARCH_ENGINES[0]);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open || !isLoggedIn) {
      setEngines(DEFAULT_SEARCH_ENGINES);
      return;
    }
    fetch('/api/settings/preferences')
      .then(r => r.json())
      .then(d => {
        if (d.code === 0 && d.data?.searchEngines) {
          try {
            const custom: SearchEngine[] = JSON.parse(d.data.searchEngines);
            setEngines([...DEFAULT_SEARCH_ENGINES, ...custom]);
          } catch { /* */ }
        }
      })
      .catch(() => {});
  }, [open, isLoggedIn]);

  // On open: copy header value, focus panel input
  useEffect(() => {
    if (open) {
      setQuery(inputRef.current?.value || '');
      setSelectedIdx(-1);
      setTimeout(() => panelInputRef.current?.focus(), 50);
    }
  }, [open, inputRef]);

  // Sync panel input back to header input (for visual consistency)
  const updateQuery = useCallback((val: string) => {
    setQuery(val);
    if (inputRef.current) inputRef.current.value = val;
  }, [inputRef]);

  const filteredTags = useMemo(() => {
    if (!query.trim()) return allTags.slice(0, 8);
    const q = query.toLowerCase();
    return allTags
      .filter(t => t.name.toLowerCase().includes(q) || (t.description?.toLowerCase().includes(q)))
      .slice(0, 8);
  }, [query]);

  const totalItems = 1 + filteredTags.length;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIdx(prev => Math.min(prev + 1, totalItems - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIdx(prev => Math.max(prev - 1, -1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const q = query.trim();
        if (!q) return;
        if (selectedIdx === -1) {
          window.open(buildSearchUrl(selectedEngine, q), '_blank');
        } else {
          const tag = filteredTags[selectedIdx];
          if (tag?.url) window.open(tag.url, '_blank');
        }
        onClose();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    },
    [selectedIdx, totalItems, query, selectedEngine, filteredTags, onClose],
  );

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handler);
    }, 100);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handler);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      className="absolute top-full right-0 mt-2 w-80 bg-popover border border-border/50 shadow-lg-soft rounded-2xl overflow-hidden z-50 animate-scale-in"
    >
      {/* Internal search input */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border/30">
        <Search className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
        <input
          ref={panelInputRef}
          type="text"
          value={query}
          onChange={(e) => updateQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('header:search')}
          className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground/40"
        />
      </div>

      {/* Engine selector row */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border/30 overflow-x-auto no-scrollbar">
        <Globe className="w-3 h-3 text-muted-foreground/50 shrink-0" />
        {engines.map((engine) => (
          <button
            key={engine.id}
            onMouseDown={(e) => {
              e.preventDefault();
              setSelectedEngine(engine);
              panelInputRef.current?.focus();
            }}
            className={`shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium transition-all duration-fast ${
              selectedEngine.id === engine.id
                ? 'bg-primary/15 text-primary border border-primary/30'
                : 'bg-muted/40 text-muted-foreground/70 border border-transparent hover:bg-muted/60'
            }`}
          >
            {engine.name}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="max-h-64 overflow-y-auto no-scrollbar">
        {query.trim() && (
          <div className="px-3 py-2 border-b border-border/20">
            <p className="text-[10px] text-muted-foreground/40">
              Enter 使用 <span className="text-foreground/60 font-medium">{selectedEngine.name}</span> 搜索 "{query}"
            </p>
          </div>
        )}

        {filteredTags.map((tag, idx) => (
          <button
            key={tag.id}
            onMouseDown={(e) => {
              e.preventDefault();
              if (tag.url) {
                window.open(tag.url, '_blank');
                onClose();
              }
            }}
            onMouseEnter={() => setSelectedIdx(idx)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-fast ${
              selectedIdx === idx ? 'bg-accent/60' : 'hover:bg-muted/30'
            }`}
          >
            <Hash
              className="w-3.5 h-3.5 shrink-0"
              style={{ color: tag.color || 'var(--muted-foreground)' }}
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground/80 truncate">{tag.name}</div>
              {tag.description && (
                <div className="text-[11px] text-muted-foreground/50 truncate">{tag.description}</div>
              )}
            </div>
            <ArrowUpRight className="w-3 h-3 text-muted-foreground/20 shrink-0" />
          </button>
        ))}

        {filteredTags.length === 0 && query.trim() && (
          <div className="px-4 py-6 text-center">
            <Search className="w-5 h-5 text-muted-foreground/20 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground/50">未找到匹配的标签</p>
            <p className="text-[10px] text-muted-foreground/30 mt-1">按 Enter 使用外网搜索</p>
          </div>
        )}

        {!query.trim() && (
          <div className="px-4 py-8 text-center">
            <Search className="w-5 h-5 text-muted-foreground/20 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground/40">输入关键词搜索标签或使用搜索引擎</p>
          </div>
        )}
      </div>

      {/* Footer hints */}
      <div className="flex items-center gap-4 px-4 py-2 border-t border-border/30 bg-muted/20 text-[10px] text-muted-foreground/40">
        <span>↑↓ 导航</span>
        <span>Enter 打开</span>
        <span>Esc 关闭</span>
      </div>
    </div>
  );
}
