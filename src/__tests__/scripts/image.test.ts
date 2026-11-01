// src/__tests__/scripts/image.test.ts
import { describe, it, expect } from 'vitest'
import sharp from 'sharp'
import { describeImage, toPublicFilename } from '../../../scripts/content/image'

describe('describeImage', () => {
  it('returns dimensions and a webp blur data URI', async () => {
    const png = await sharp({ create: { width: 64, height: 32, channels: 3, background: '#f26322' } }).png().toBuffer()
    const meta = await describeImage(png)
    expect(meta.width).toBe(64)
    expect(meta.height).toBe(32)
    expect(meta.blurDataURL.startsWith('data:image/webp;base64,')).toBe(true)
    expect(meta.blurDataURL.length).toBeLessThan(2000)
  })
})

describe('toPublicFilename', () => {
  it('lower-cases and hyphenates whitespace', () => {
    expect(toPublicFilename('Recipe App Final.PNG')).toBe('recipe-app-final.png')
  })

  it('collapses unsafe characters without leaving hyphens next to the dot', () => {
    expect(toPublicFilename('My Shot #1 (Final).PNG')).toBe('my-shot-1-final.png')
    expect(toPublicFilename('Screenshot 2026-10-31 at 9.41.12 PM.png')).toBe('screenshot-2026-10-31-at-9.41.12-pm.png')
  })
})
