import type { CollectionConfig } from 'payload'

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'status', 'updatedAt'],
    livePreview: {
      url: ({ data }) => {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
        const slug = data.name?.toLowerCase().replace(/\s+/g, '-')
        return `${baseUrl}/api/preview?collection=projects&slug=${slug}`
      },
    },
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Project name as displayed on the website',
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Web',
          value: 'web',
        },
        {
          label: 'Native',
          value: 'native',
        },
      ],
      admin: {
        description: 'Project type - web or native application',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        {
          label: 'In Progress',
          value: 'In Progress',
        },
        {
          label: 'Prototype',
          value: 'Prototype',
        },
        {
          label: 'Professional',
          value: 'Professional',
        },
      ],
      admin: {
        description: 'Current status of the project',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Brief description of the project',
      },
    },
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Video showcasing the project (MP4 format recommended)',
      },
    },
    {
      name: 'staticImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Static image/screenshot of the project',
      },
    },
    {
      name: 'liveUrl',
      type: 'text',
      admin: {
        description: 'Live URL where the project can be viewed (optional)',
      },
    },
    {
      name: 'githubUrl',
      type: 'text',
      admin: {
        description: 'GitHub repository URL (optional)',
      },
    },
    {
      name: 'content',
      type: 'group',
      fields: [
        {
          name: 'concept',
          type: 'textarea',
          required: true,
          admin: {
            description: 'Description of the project concept and problem it solves',
          },
        },
        {
          name: 'solution',
          type: 'textarea',
          required: true,
          admin: {
            description: 'Description of the solution and technical implementation',
          },
        },
      ],
    },
    // SEO and metadata fields
    {
      name: 'seo',
      type: 'group',
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          admin: {
            description: 'Custom title for search engines (auto-generated from name if empty)',
          },
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          admin: {
            description: 'Description for search engines and social media (auto-generated from description if empty)',
          },
        },
        {
          name: 'ogImage',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Image for social media sharing (auto-set to staticImage if empty)',
          },
        },
      ],
    },
  ],
  timestamps: true,
}