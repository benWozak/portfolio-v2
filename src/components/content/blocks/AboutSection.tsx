import React from 'react'
import Image from 'next/image'
import { AnimatedSection } from '@/components/layout/section/AnimatedSection'
import { SectionHeading } from '@/components/layout/section/SectionHeading'
import { renderLexicalContent } from '@/utils/lexicalRenderer'
import type { AboutSectionBlock } from '@/types/blogPage'

interface AboutSectionProps {
  block: AboutSectionBlock
}

export const AboutSection: React.FC<AboutSectionProps> = ({ block }) => {
  const { title, content, image, imagePosition = 'right' } = block

  const renderContent = () => (
    <div className="prose prose-lg dark:prose-invert max-w-none">
      {renderLexicalContent(content)}
    </div>
  )

  const renderImage = () => {
    if (!image || typeof image !== 'object') return null
    
    return (
      <div className="relative">
        <Image
          src={image.url || ''}
          alt={image.alt || title}
          width={600}
          height={400}
          className="rounded-lg shadow-lg object-cover w-full h-auto"
        />
      </div>
    )
  }

  const getLayoutClasses = () => {
    switch (imagePosition) {
      case 'left':
        return 'lg:grid-cols-2 lg:gap-12'
      case 'right':
        return 'lg:grid-cols-2 lg:gap-12'
      case 'above':
        return 'grid-cols-1 gap-8'
      case 'below':
        return 'grid-cols-1 gap-8'
      default:
        return 'lg:grid-cols-2 lg:gap-12'
    }
  }

  const shouldReverseOrder = imagePosition === 'left'

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <AnimatedSection>
          <SectionHeading title={title} />
          
          <div className={`grid ${getLayoutClasses()} items-center`}>
            {imagePosition === 'above' && renderImage()}
            
            <div className={`${shouldReverseOrder ? 'lg:order-2' : ''}`}>
              {renderContent()}
            </div>
            
            {(imagePosition === 'left' || imagePosition === 'right') && (
              <div className={`${shouldReverseOrder ? 'lg:order-1' : ''}`}>
                {renderImage()}
              </div>
            )}
            
            {imagePosition === 'below' && renderImage()}
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}