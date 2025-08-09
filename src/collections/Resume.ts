import type { CollectionConfig } from 'payload'

async function revalidateResume() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const secret = process.env.REVALIDATION_SECRET
  
  if (!secret) {
    console.warn('REVALIDATION_SECRET not set, skipping cache revalidation')
    return
  }

  try {
    const response = await fetch(`${baseUrl}/api/revalidate?secret=${secret}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        collection: 'resume',
        tag: 'resume-data',
        path: '/resume'
      }),
    })

    if (response.ok) {
      const data = await response.json()
      console.log('Resume cache revalidation successful:', data)
    } else {
      console.error('Resume cache revalidation failed:', response.status, response.statusText)
    }
  } catch (error) {
    console.error('Error revalidating resume cache:', error)
  }
}

// Hook to ensure only one resume can be active at a time
const ensureSingleActiveResume = async ({ data, operation, req }: { data: any, operation: string, req: any }) => {
  if (operation === 'create' || operation === 'update') {
    // Ensure arrays are properly formatted
    if (!Array.isArray(data.skills)) {
      data.skills = []
    }
    if (!Array.isArray(data.experience)) {
      data.experience = []
    }
    
    if (data.isActive) {
      // If setting this resume as active, deactivate all others
      await req.payload.update({
        collection: 'resume' as any,
        where: {
          isActive: {
            equals: true,
          },
        },
        data: {
          isActive: false,
        },
      })
    }
  }
  return data
}

export const Resume: CollectionConfig = {
  slug: 'resume',
  admin: {
    useAsTitle: 'version',
    defaultColumns: ['version', 'isActive', 'full_name', 'updatedAt'],
    livePreview: {
      url: ({ data }) => {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
        return `${baseUrl}/api/preview?collection=resume&id=${data.id}`
      },
    },
  },
  access: {
    read: ({ req: { user } }) => {
      if (user) {
        return true
      }
      return {
        isActive: {
          equals: true,
        },
      }
    },
  },
  hooks: {
    beforeChange: [ensureSingleActiveResume],
    afterChange: [
      async ({ doc, operation }) => {
        // Revalidate cache after any change (create, update)
        if (operation === 'create' || operation === 'update') {
          console.log(`Resume ${operation}: ${doc.version}`)
          await revalidateResume()
        }
      }
    ],
    afterDelete: [
      async ({ doc }) => {
        console.log(`Resume deleted: ${doc.version}`)
        await revalidateResume()
      }
    ],
  },
  fields: [
    {
      name: 'version',
      type: 'text',
      required: true,
      admin: {
        description: 'Version name/identifier for this resume (e.g., "v2024.1", "Senior Developer", etc.)',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Only one resume version can be active at a time. This will be displayed on the live site.',
      },
    },
    {
      name: 'full_name',
      type: 'text',
      required: true,
    },
    {
      name: 'phone',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'summary',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Professional summary/bio',
      },
    },
    {
      name: 'socials',
      type: 'group',
      fields: [
        {
          name: 'linkedin_url',
          type: 'text',
          required: true,
        },
        {
          name: 'github_url',
          type: 'text',
          required: true,
        },
        {
          name: 'portfolio_url',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'experience',
      type: 'array',
      required: false,
      defaultValue: [],
      fields: [
        {
          name: 'company',
          type: 'text',
          required: true,
        },
        {
          name: 'position',
          type: 'text',
          required: true,
        },
        {
          name: 'duration',
          type: 'group',
          fields: [
            {
              name: 'startDate',
              type: 'text',
              required: true,
              admin: {
                description: 'Start date (e.g., "Jan 2025")',
              },
            },
            {
              name: 'endDate',
              type: 'text',
              admin: {
                description: 'End date (e.g., "Dec 2025") - leave empty for current position',
              },
            },
          ],
        },
        {
          name: 'description',
          type: 'array',
          required: false,
          defaultValue: [],
          fields: [
            {
              name: 'item',
              type: 'text',
              required: true,
            },
          ],
          admin: {
            description: 'List of achievements and responsibilities',
          },
        },
      ],
    },
    {
      name: 'skills',
      type: 'array',
      required: false,
      defaultValue: [],
      fields: [
        {
          name: 'skill_title',
          type: 'text',
          required: true,
          admin: {
            description: 'Category name (e.g., "Languages", "Frameworks", etc.)',
          },
        },
        {
          name: 'skill_items',
          type: 'text',
          required: true,
          admin: {
            description: 'Comma-separated list of skills in this category',
          },
        },
      ],
    },
    {
      name: 'education',
      type: 'group',
      fields: [
        {
          name: 'institution',
          type: 'text',
          required: true,
        },
        {
          name: 'location',
          type: 'text',
          required: true,
        },
        {
          name: 'duration',
          type: 'group',
          fields: [
            {
              name: 'startDate',
              type: 'text',
              required: true,
            },
            {
              name: 'endDate',
              type: 'text',
              required: true,
            },
          ],
        },
        {
          name: 'degree',
          type: 'text',
          required: true,
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
            description: 'Custom title for search engines (auto-generated from full_name if empty)',
          },
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          admin: {
            description: 'Description for search engines and social media (auto-generated from summary if empty)',
          },
        },
      ],
    },
  ],
  timestamps: true,
}