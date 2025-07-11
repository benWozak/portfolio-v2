export interface HeroPartialBlock {
  blockType: 'heroPartial'
  title: string
  subtitle?: string
  ctaText?: string
  ctaUrl?: string
  backgroundImage?: any
}

export interface AboutSectionBlock {
  blockType: 'aboutSection'
  title: string
  content: any
  image?: any
  imagePosition?: 'left' | 'right' | 'above' | 'below'
}

export type ContentBlock = HeroPartialBlock | AboutSectionBlock

export interface BlogPage {
  id: string
  title: string
  contentBlocks?: ContentBlock[]
  showFeaturedSection?: boolean
  featuredSectionTitle?: string
  allPostsTitle?: string
  enableSearch?: boolean
  enableTagFiltering?: boolean
  createdAt: string
  updatedAt: string
}