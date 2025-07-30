import type { CollectionConfig } from 'payload'

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'status', 'order', 'featured', 'updatedAt'],
    defaultSort: 'order',
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
      name: 'overview',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Detailed overview of the project and your role',
      },
    },
    {
      name: 'challenge',
      type: 'textarea',
      required: true,
      admin: {
        description: 'The main challenge or problem this project addressed',
      },
    },
    {
      name: 'solution',
      type: 'textarea',
      required: true,
      admin: {
        description: 'How you solved the challenge and technical implementation details',
      },
    },
    {
      name: 'keyTakeaways',
      type: 'textarea',
      required: true,
      admin: {
        description: 'What you learned from this project and its impact',
      },
    },
    {
      name: 'techStack',
      type: 'group',
      fields: [
        {
          name: 'frontend',
          type: 'array',
          fields: [
            {
              name: 'technology',
              type: 'text',
              required: true,
            },
          ],
          admin: {
            description: 'Frontend technologies used',
          },
        },
        {
          name: 'backend',
          type: 'array',
          fields: [
            {
              name: 'technology',
              type: 'text',
              required: true,
            },
          ],
          admin: {
            description: 'Backend technologies used',
          },
        },
        {
          name: 'other',
          type: 'array',
          fields: [
            {
              name: 'technology',
              type: 'text',
              required: true,
            },
          ],
          admin: {
            description: 'Other tools and technologies used',
          },
        },
      ],
    },
    {
      name: 'media',
      type: 'group',
      fields: [
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
          name: 'video',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Video showcasing the project (MP4 format recommended)',
          },
        },
      ],
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
      name: 'order',
      type: 'number',
      admin: {
        position: 'sidebar',
        description: 'Display order (lower numbers appear first)',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Mark as featured project',
      },
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