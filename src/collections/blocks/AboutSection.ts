import { Block } from 'payload'

export const AboutSection: Block = {
  slug: 'aboutSection',
  labels: {
    singular: 'About Section',
    plural: 'About Sections',
  },
  interfaceName: 'AboutSectionBlock',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Section Title',
      admin: {
        description: 'Title for the about section',
      },
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Content',
      required: true,
      admin: {
        description: 'Rich text content for the about section',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Section Image',
      admin: {
        description: 'Optional image for the about section',
      },
    },
    {
      name: 'imagePosition',
      type: 'select',
      label: 'Image Position',
      defaultValue: 'right',
      options: [
        {
          label: 'Left',
          value: 'left',
        },
        {
          label: 'Right',
          value: 'right',
        },
        {
          label: 'Above',
          value: 'above',
        },
        {
          label: 'Below',
          value: 'below',
        },
      ],
      admin: {
        description: 'Position of the image relative to the content',
        condition: (data, siblingData) => siblingData.image,
      },
    },
  ],
}