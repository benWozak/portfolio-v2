import type { CollectionConfig } from 'payload'

export const ProfessionalInsights: CollectionConfig = {
  slug: 'professionalInsights',
  labels: {
    singular: 'Professional Insight',
    plural: 'Professional Insights',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'featured', 'updatedAt'],
    description: 'Insights and thoughts from your professional career experiences',
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
      label: 'Insight Title',
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
      name: 'summary',
      type: 'textarea',
      required: true,
      label: 'Brief Summary',
      admin: {
        description: 'A concise summary of the professional insight',
      },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      label: 'Full Content',
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Leadership & Management',
          value: 'leadership',
        },
        {
          label: 'Technical Architecture',
          value: 'architecture',
        },
        {
          label: 'Team Collaboration',
          value: 'collaboration',
        },
        {
          label: 'Career Development',
          value: 'career',
        },
        {
          label: 'Project Management',
          value: 'project-management',
        },
        {
          label: 'Industry Trends',
          value: 'industry',
        },
        {
          label: 'Problem Solving',
          value: 'problem-solving',
        },
      ],
      admin: {
        description: 'Category that best describes this professional insight',
      },
    },
    {
      name: 'experienceLevel',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Junior Experience (0-2 years)',
          value: 'junior',
        },
        {
          label: 'Mid-level Experience (3-5 years)',
          value: 'mid',
        },
        {
          label: 'Senior Experience (6+ years)',
          value: 'senior',
        },
        {
          label: 'Leadership Experience',
          value: 'leadership',
        },
      ],
      admin: {
        description: 'Experience level when this insight was gained',
      },
    },
    {
      name: 'keyTakeaways',
      type: 'array',
      label: 'Key Takeaways',
      fields: [
        {
          name: 'takeaway',
          type: 'text',
          required: true,
        },
      ],
      admin: {
        description: 'Main learnings or actionable insights',
      },
    },
    {
      name: 'relatedTechnologies',
      type: 'relationship',
      relationTo: 'tags' as any,
      hasMany: true,
      admin: {
        position: 'sidebar',
        description: 'Technologies or tools related to this insight',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Feature this insight on the blog page',
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
  ],
  timestamps: true,
}