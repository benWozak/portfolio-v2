import type { CollectionConfig } from 'payload'
import { authenticated } from '../access'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'System',
    defaultColumns: ['filename', 'alt', 'mimeType', 'filesize', 'updatedAt'],
  },
  access: {
    read: () => true,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: {
    // next/image already serves responsive variants from the original, so
    // Payload-side imageSizes would only add blob storage cost.
    mimeTypes: ['image/*', 'video/mp4', 'video/webm'],
  },
}
