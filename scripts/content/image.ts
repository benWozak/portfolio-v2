// scripts/content/image.ts
// Used by scripts/content/new-project.ts (chunk 08); chunk 01's export
// script also used it. Node-only (sharp).
import sharp from 'sharp'

export interface ProjectImageMeta {
  width: number
  height: number
  blurDataURL: string
}

export function toPublicFilename(filename: string): string {
  return filename.trim().toLowerCase().replace(/\s+/g, '-')
}

export async function describeImage(buffer: Buffer): Promise<ProjectImageMeta> {
  const meta = await sharp(buffer).metadata()
  if (!meta.width || !meta.height) throw new Error('could not read image dimensions')
  const blur = await sharp(buffer).resize(16, undefined, { fit: 'inside' }).webp({ quality: 40 }).toBuffer()
  return {
    width: meta.width,
    height: meta.height,
    blurDataURL: `data:image/webp;base64,${blur.toString('base64')}`,
  }
}
