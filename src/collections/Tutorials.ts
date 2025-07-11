import type { CollectionConfig } from 'payload'

export const Tutorials: CollectionConfig = {
  slug: 'tutorials',
  labels: {
    singular: 'Tutorial',
    plural: 'Tutorials',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'difficulty', 'estimatedTime', 'featured', 'updatedAt'],
    description: 'Step-by-step tutorials and walkthroughs for various technologies and workflows',
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
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Tutorial Title',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL-friendly version of the title',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Brief description of what the tutorial covers',
      },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      label: 'Tutorial Content',
    },
    {
      name: 'difficulty',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Beginner',
          value: 'beginner',
        },
        {
          label: 'Intermediate',
          value: 'intermediate',
        },
        {
          label: 'Advanced',
          value: 'advanced',
        },
      ],
      admin: {
        description: 'Difficulty level of this tutorial',
      },
    },
    {
      name: 'estimatedTime',
      type: 'text',
      label: 'Estimated Time',
      admin: {
        description: 'Estimated time to complete (e.g., "30 minutes", "2 hours")',
      },
    },
    {
      name: 'prerequisites',
      type: 'array',
      label: 'Prerequisites',
      fields: [
        {
          name: 'prerequisite',
          type: 'text',
          required: true,
        },
      ],
      admin: {
        description: 'What knowledge or tools are needed before starting',
      },
    },
    {
      name: 'learningOutcomes',
      type: 'array',
      label: 'Learning Outcomes',
      fields: [
        {
          name: 'outcome',
          type: 'text',
          required: true,
        },
      ],
      admin: {
        description: 'What the user will learn by completing this tutorial',
      },
    },
    {
      name: 'codeRepository',
      type: 'text',
      label: 'Code Repository URL',
      admin: {
        description: 'Link to GitHub repo or code examples (optional)',
      },
    },
    {
      name: 'demoUrl',
      type: 'text',
      label: 'Demo URL',
      admin: {
        description: 'Link to live demo or finished project (optional)',
      },
    },
    {
      name: 'technologies',
      type: 'relationship',
      relationTo: 'tags' as any,
      hasMany: true,
      admin: {
        position: 'sidebar',
        description: 'Technologies, frameworks, or tools covered in this tutorial',
      },
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories' as any,
      hasMany: true,
      admin: {
        position: 'sidebar',
        description: 'Categories this tutorial belongs to',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Feature this tutorial on the blog page',
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
      name: 'lastUpdated',
      type: 'date',
      admin: {
        position: 'sidebar',
        description: 'When the tutorial was last updated',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
  ],
  timestamps: true,
}