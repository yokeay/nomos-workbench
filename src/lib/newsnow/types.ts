export interface NewsItem {
  id: string | number
  title: string
  url: string
  mobileUrl?: string
  pubDate?: number | string
  extra?: {
    hover?: string
    date?: number | string
    info?: false | string
    icon?: false | string | {
      url: string
      scale: number
    }
  }
}

export interface TimelineItem extends NewsItem {
  sourceId: string
  sourceName: string
  sourceColor: string
  sourceColumn?: string
  sourcePriority?: number
}

export type SourceGetter = () => Promise<NewsItem[]>

export interface SourceDefinition {
  name: string
  interval?: number
  color?: string
  title?: string
  desc?: string
  type?: "hottest" | "realtime"
  column?: string
  home?: string
  disable?: boolean | "cf"
  redirect?: string
  priority?: number
  subNames?: Record<string, string>
}
