import { TagGridView } from '@/components/tag-grid/tag-grid-view'
import { mockCategories } from '@/lib/tag-grid/mock-data'

export default function TagsPage() {
  return (
    <div className="h-full">
      <TagGridView categories={mockCategories} />
    </div>
  )
}
