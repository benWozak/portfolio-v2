import type { CollectionConfig } from 'payload'
import { blogBeforeChangeHook } from './hooks/blogHooks'

export const Blog: CollectionConfig = {
  slug: 'blog',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'publishedAt', 'updatedAt'],
  },
  access: {
    read: ({ req: { user } }) => {
      if (user) {
        return true
      }
      return {
        status: {
          equals: 'published',
        },
      }
    },
  },
  hooks: {
    beforeChange: [blogBeforeChangeHook],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL-friendly version of the title (auto-generated if empty)',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Brief description for blog post previews (auto-generated from content if empty)',
      },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media' as any,
      admin: {
        description: 'Main image for the blog post',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        {
          label: 'Draft',
          value: 'draft',
        },
        {
          label: 'Published',
          value: 'published',
        },
      ],
      defaultValue: 'draft',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Feature this post on the blog homepage',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users' as any,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories' as any,
      hasMany: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags' as any,
      hasMany: true,
      admin: {
        position: 'sidebar',
      },
    },
    // SEO Fields
    {
      name: 'seo',
      type: 'group',
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          admin: {
            description: 'Custom title for search engines (auto-generated from title if empty)',
          },
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          admin: {
            description: 'Description for search engines and social media (auto-generated from excerpt if empty)',
          },
        },
        {
          name: 'ogImage',
          type: 'upload',
          relationTo: 'media' as any,
          admin: {
            description: 'Image for social media sharing (auto-set to featured image if empty)',
          },
        },
      ],
    },
  ],
  timestamps: true,
}