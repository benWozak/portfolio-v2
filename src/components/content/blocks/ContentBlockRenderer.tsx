import React from 'react'
import { HeroPartial } from './HeroPartial'
import { AboutSection } from './AboutSection'
import type { BlogPage } from '@/types/blogPage'

interface ContentBlockRendererProps {
  blocks: BlogPage['contentBlocks']
}

export const ContentBlockRenderer: React.FC<ContentBlockRendererProps> = ({ blocks }) => {
  if (!blocks || !Array.isArray(blocks)) return null

  return (
    <>
      {blocks.map((block, index) => {
        switch (block.blockType) {
          case 'heroPartial':
            return <HeroPartial key={`hero-${index}`} block={block} />
          case 'aboutSection':
            return <AboutSection key={`about-${index}`} block={block} />
          default:
            console.warn(`Unknown block type: ${(block as any).blockType}`)
            return null
        }
      })}
    </>
  )
}