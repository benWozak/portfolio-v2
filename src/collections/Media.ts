import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
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
    imageSizes: [
      { name: 'thumbnail', width: 320, height: 180, position: 'centre' },
      { name: 'card', width: 640, height: 360, position: 'centre' },
      { name: 'hero', width: 1280, position: 'centre' },
    ],
  },
}
