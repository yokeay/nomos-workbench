'use client'

import { useState, useMemo, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Category, TagItem } from '@/lib/tag-grid/types'

const ITEMS_PER_PAGE = 20

function TagCard({ tag }: { tag: TagItem }) {
  return (
    <a
      href={tag.url || '#'}
      target={tag.url ? '_blank' : undefined}
      rel={tag.url ? 'noopener noreferrer' : undefined}
      className={cn(
        'flex flex-col items-center gap-2 p-3 rounded-2xl',
        'hover:bg-accent/50 transition-all duration-fast',
        'cursor-pointer select-none group',
        'min-w-0'
      )}
      title={tag.description}
    >
      {/* Icon */}
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-bold shadow-sm-soft transition-transform duration-normal group-hover:scale-105"
        style={{ backgroundColor: tag.color || '#6b7280' }}
      >
        {tag.name.charAt(0)}
      </div>
      {/* Name */}
      <span className="text-xs text-muted-foreground text-center leading-tight line-clamp-2 max-w-[72px]">
        {tag.name}
      </span>
    </a>
  )
}

interface TagGridProps {
  tags: TagItem[]
  className?: string
}

function TagGrid({ tags, className }: TagGridProps) {
  const [page, setPage] = useState(0)
  const totalPages = Math.max(1, Math.ceil(tags.length / ITEMS_PER_PAGE))

  // Reset page when tags change
  const safePage = Math.min(page, totalPages - 1)
  if (safePage !== page) {
    setPage(safePage)
  }

  const pageTags = tags.slice(
    safePage * ITEMS_PER_PAGE,
    (safePage + 1) * ITEMS_PER_PAGE
  )

  const goPrev = useCallback(() => setPage((p) => Math.max(0, p - 1)), [])
  const goNext = useCallback(() => setPage((p) => Math.min(totalPages - 1, p + 1)), [totalPages])

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Grid area */}
      <div className="flex-1 flex items-center justify-center px-6">
        {/* Left arrow */}
        {totalPages > 1 && (
          <button
            onClick={goPrev}
            disabled={safePage === 0}
            className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-muted-foreground hover:bg-accent/40 disabled:opacity-20 disabled:cursor-default transition-colors duration-fast shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Grid */}
        <div className="flex-1 grid grid-cols-5 gap-3 content-center justify-items-center max-w-2xl mx-auto">
          {pageTags.map((tag) => (
            <TagCard key={tag.id} tag={tag} />
          ))}
          {/* Fill remaining slots to maintain grid stability */}
          {Array.from({ length: ITEMS_PER_PAGE - pageTags.length }).map((_, i) => (
            <div key={`placeholder-${i}`} className="invisible" />
          ))}
        </div>

        {/* Right arrow */}
        {totalPages > 1 && (
          <button
            onClick={goNext}
            disabled={safePage === totalPages - 1}
            className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-muted-foreground hover:bg-accent/40 disabled:opacity-20 disabled:cursor-default transition-colors duration-fast shrink-0"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Page indicator dots */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 pb-3">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={cn(
                'w-1.5 h-1.5 rounded-full transition-all duration-fast',
                i === safePage
                  ? 'bg-muted-foreground/50 w-2.5'
                  : 'bg-muted-foreground/20 hover:bg-muted-foreground/40'
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface TagGridViewProps {
  categories: Category[]
}

export function TagGridView({ categories }: TagGridViewProps) {
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || '')
  const [activeSub, setActiveSub] = useState<string | null>(null)

  const category = useMemo(
    () => categories.find((c) => c.id === activeCategory) || categories[0],
    [categories, activeCategory]
  )

  // Auto-select first sub-category when category changes
  const currentSub = useMemo(() => {
    if (!category) return null
    if (activeSub && category.subCategories.some((s) => s.id === activeSub)) {
      return category.subCategories.find((s) => s.id === activeSub)!
    }
    return category.subCategories[0] || null
  }, [category, activeSub])

  const tags = currentSub?.tags || []

  if (!category) return null

  return (
    <div className="h-full flex flex-col">
      {/* Level 1: Category tabs */}
      <div className="flex items-center gap-1 px-5 pt-4 pb-0 shrink-0 overflow-x-auto no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-fast',
              activeCategory === cat.id
                ? 'bg-sidebar-active text-sidebar-foreground shadow-subtle'
                : 'text-muted-foreground/60 hover:text-muted-foreground hover:bg-accent/40'
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Level 2: Sub-category tabs */}
      <div className="flex items-center gap-1 px-5 pt-2 pb-1 shrink-0 overflow-x-auto no-scrollbar">
        {category.subCategories.map((sub) => (
          <button
            key={sub.id}
            onClick={() => setActiveSub(sub.id)}
            className={cn(
              'px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all duration-fast',
              currentSub?.id === sub.id
                ? 'bg-accent text-foreground'
                : 'text-muted-foreground/50 hover:text-muted-foreground/80 hover:bg-accent/30'
            )}
          >
            {sub.name}
            <span className="ml-1.5 text-muted-foreground/30 text-[10px]">
              {sub.tags.length}
            </span>
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="mx-5 mt-1 border-t border-border/30" />

      {/* Tag grid */}
      <TagGrid tags={tags} className="flex-1 pt-4" />
    </div>
  )
}
