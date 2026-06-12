import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    defaultColumns: ['filename', 'alt', 'mimeType', 'filesize', 'updatedAt'],
  },
  access: {
    read: () => true,
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
