import { Block } from 'payload'

export const HeroPartial: Block = {
  slug: 'heroPartial',
  labels: {
    singular: 'Hero Partial',
    plural: 'Hero Partials',
  },
  interfaceName: 'HeroPartialBlock',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Title',
      admin: {
        description: 'Main heading for the hero section',
      },
    },
    {
      name: 'subtitle',
      type: 'textarea',
      label: 'Subtitle',
      admin: {
        description: 'Supporting text that appears below the title',
      },
    },
    {
      name: 'ctaText',
      type: 'text',
      label: 'CTA Text',
      admin: {
        description: 'Call-to-action button text (optional)',
      },
    },
    {
      name: 'ctaUrl',
      type: 'text',
      label: 'CTA URL',
      admin: {
        description: 'Call-to-action button URL (optional)',
        condition: (data, siblingData) => siblingData.ctaText,
      },
    },
    {
      name: 'backgroundImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Background Image',
      admin: {
        description: 'Optional background image for the hero section',
      },
    },
  ],
}