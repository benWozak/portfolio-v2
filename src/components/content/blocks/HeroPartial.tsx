import React from 'react'
import Image from 'next/image'
import { AnimatedSection } from '@/components/layout/section/AnimatedSection'
import { Button } from '@/components/ui/Button'
import type { HeroPartialBlock } from '@/types/blogPage'

interface HeroPartialProps {
  block: HeroPartialBlock
}

export const HeroPartial: React.FC<HeroPartialProps> = ({ block }) => {
  const { title, subtitle, ctaText, ctaUrl, backgroundImage } = block

  return (
    <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
      {backgroundImage && typeof backgroundImage === 'object' && (
        <div className="absolute inset-0 z-0">
          <Image
            src={backgroundImage.url || ''}
            alt={backgroundImage.alt || ''}
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-background/60" />
        </div>
      )}
      
      <div className="container mx-auto px-4 relative z-10">
        <AnimatedSection>
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-foreground">
              {title}
            </h1>
            
            {subtitle && (
              <p className="text-xl lg:text-2xl text-muted-foreground mb-8 leading-relaxed">
                {subtitle}
              </p>
            )}
            
            {ctaText && ctaUrl && (
              <div className="mt-8">
                <Button 
                  href={ctaUrl}
                  label={ctaText}
                  variant="primary"
                  className="text-lg px-8 py-3"
                />
              </div>
            )}
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}