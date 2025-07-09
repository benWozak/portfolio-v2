import type { CollectionConfig } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL-friendly version of the category name',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Optional description for the category',
      },
    },
    {
      name: 'color',
      type: 'text',
      admin: {
        description: 'Hex color code for the category badge (e.g., #FF6B35)',
      },
    },
  ],
  timestamps: true,
}