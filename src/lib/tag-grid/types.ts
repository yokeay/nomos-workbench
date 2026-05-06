export interface TagItem {
  id: string
  name: string
  icon?: string
  color?: string
  description?: string
  url?: string
}

export interface SubCategory {
  id: string
  name: string
  tags: TagItem[]
}

export interface Category {
  id: string
  name: string
  icon?: string
  subCategories: SubCategory[]
}
