'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Category, TagItem } from '@/lib/tag-grid/types'

const ROWS_PER_PAGE = 4
const ITEM_MIN_WIDTH = 88

function TagCard({ tag }: { tag: TagItem }) {
  return (
    <a
      href={tag.url || '#'}
      target={tag.url ? '_blank' : undefined}
      rel={tag.url ? 'noopener noreferrer' : undefined}
      className={cn(
        'flex flex-col items-center gap-1.5 p-2.5 rounded-2xl',
        'hover:bg-accent/50 transition-all duration-fast',
        'cursor-pointer select-none group',
        'min-w-0'
      )}
      title={tag.description}
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-base font-bold shadow-sm-soft transition-transform duration-normal group-hover:scale-105"
        style={{ backgroundColor: tag.color || '#6b7280' }}
      >
        {tag.name.charAt(0)}
      </div>
      <span className="text-[11px] text-muted-foreground text-center leading-tight line-clamp-2 max-w-[68px]">
        {tag.name}
      </span>
    </a>
  )
}

interface PaginatedGridProps {
  tags: TagItem[]
}

function PaginatedGrid({ tags }: PaginatedGridProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [columns, setColumns] = useState(5)
  const [page, setPage] = useState(0)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const calc = () => {
      const w = el.clientWidth
      setColumns(Math.max(3, Math.floor(w / ITEM_MIN_WIDTH)))
    }
    calc()
    const obs = new ResizeObserver(calc)
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const itemsPerPage = columns * ROWS_PER_PAGE
  const totalPages = Math.max(1, Math.ceil(tags.length / itemsPerPage))
  const safePage = Math.min(page, totalPages - 1)

  // Reset page when tags change
  useEffect(() => {
    setPage(0)
  }, [tags])

  const pageTags = tags.slice(safePage * itemsPerPage, (safePage + 1) * itemsPerPage)

  const goPrev = useCallback(() => setPage((p) => Math.max(0, p - 1)), [])
  const goNext = useCallback(() => setPage((p) => Math.min(totalPages - 1, p + 1)), [totalPages])

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (totalPages <= 1) return
      e.preventDefault()
      // Trackpad horizontal swipe
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 10) {
        if (e.deltaX > 0) goNext()
        else goPrev()
        return
      }
      // Mouse wheel vertical scroll
      if (Math.abs(e.deltaY) > 10) {
        if (e.deltaY > 0) goNext()
        else goPrev()
      }
    },
    [totalPages, goNext, goPrev]
  )

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Grid area — vertically centered */}
      <div className="flex-1 flex items-center" onWheel={handleWheel}>
        <div ref={containerRef} className="flex-1 flex items-center gap-2 px-1">
          {/* Left arrow */}
          {totalPages > 1 && (
            <button
              onClick={goPrev}
              disabled={safePage === 0}
              className="p-1 rounded-lg text-muted-foreground/30 hover:text-muted-foreground hover:bg-accent/40 disabled:opacity-15 disabled:cursor-default transition-colors duration-fast shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {/* Grid */}
          <div
            className="flex-1 grid gap-2 content-center justify-items-center"
            style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          >
            {pageTags.map((tag) => (
              <TagCard key={tag.id} tag={tag} />
            ))}
            {/* Fill empty slots in last row */}
            {Array.from({ length: Math.max(0, itemsPerPage - pageTags.length) }).map((_, i) => (
              <div key={`ph-${i}`} aria-hidden />
            ))}
          </div>

          {/* Right arrow */}
          {totalPages > 1 && (
            <button
              onClick={goNext}
              disabled={safePage === totalPages - 1}
              className="p-1 rounded-lg text-muted-foreground/30 hover:text-muted-foreground hover:bg-accent/40 disabled:opacity-15 disabled:cursor-default transition-colors duration-fast shrink-0"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Page indicator */}
      <div className="flex items-center justify-center gap-2 pb-2 shrink-0">
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i)}
            className={cn(
              'rounded-full transition-all duration-fast',
              i === safePage
                ? 'w-2 h-2 bg-muted-foreground/50'
                : 'w-2 h-2 border border-muted-foreground/25 hover:border-muted-foreground/50'
            )}
          />
        ))}
      </div>
    </div>
  )
}

interface TagGridViewProps {
  categories: Category[]
}

export function TagGridView({ categories }: TagGridViewProps) {
  const [activeCategory, setActiveCategory] = useState('__all__')
  const [activeSub, setActiveSub] = useState('__all__')

  const allTags = useMemo(() => {
    const seen = new Set<string>()
    const result: TagItem[] = []
    for (const cat of categories) {
      for (const sub of cat.subCategories) {
        for (const tag of sub.tags) {
          if (!seen.has(tag.id)) {
            seen.add(tag.id)
            result.push(tag)
          }
        }
      }
    }
    return result
  }, [categories])

  const category = useMemo(() => {
    if (activeCategory === '__all__') return null
    return categories.find((c) => c.id === activeCategory) || null
  }, [categories, activeCategory])

  const allSubTags = useMemo(() => {
    if (!category) return []
    const seen = new Set<string>()
    const result: TagItem[] = []
    for (const sub of category.subCategories) {
      for (const tag of sub.tags) {
        if (!seen.has(tag.id)) {
          seen.add(tag.id)
          result.push(tag)
        }
      }
    }
    return result
  }, [category])

  const currentSub = useMemo(() => {
    if (activeCategory === '__all__') return null
    if (activeSub === '__all__') return null
    if (!category) return null
    return category.subCategories.find((s) => s.id === activeSub) || null
  }, [category, activeSub, activeCategory])

  const displayTags: TagItem[] = (() => {
    if (activeCategory === '__all__') return allTags
    if (activeSub === '__all__') return allSubTags
    return currentSub?.tags || allSubTags
  })()

  const handleCategoryChange = useCallback((id: string) => {
    setActiveCategory(id)
    setActiveSub('__all__')
  }, [])

  return (
    <div className="h-full flex flex-col">
      {/* Level 1: Category tabs */}
      <div className="flex items-center gap-1 px-5 pt-4 pb-0 shrink-0 overflow-x-auto no-scrollbar">
        <button
          onClick={() => handleCategoryChange('__all__')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-fast',
            activeCategory === '__all__'
              ? 'bg-sidebar-active text-sidebar-foreground shadow-subtle'
              : 'text-muted-foreground/60 hover:text-muted-foreground hover:bg-accent/40'
          )}
        >
          全部
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
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
        {activeCategory === '__all__' ? (
          <span className="px-3 py-1.5 rounded-md text-xs font-medium text-muted-foreground/30">
            全部标签
          </span>
        ) : (
          <>
            <button
              onClick={() => setActiveSub('__all__')}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all duration-fast',
                activeSub === '__all__'
                  ? 'bg-accent text-foreground'
                  : 'text-muted-foreground/50 hover:text-muted-foreground/80 hover:bg-accent/30'
              )}
            >
              全部
              <span className="ml-1.5 text-muted-foreground/30 text-[10px]">
                {allSubTags.length}
              </span>
            </button>
            {category?.subCategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setActiveSub(sub.id)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all duration-fast',
                  activeSub === sub.id
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
          </>
        )}
      </div>

      {/* Divider */}
      <div className="mx-5 mt-1 border-t border-border/30" />

      {/* Tag grid — 4 rows, paginated */}
      <PaginatedGrid tags={displayTags} />
    </div>
  )
}
