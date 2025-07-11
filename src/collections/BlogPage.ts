import type { CollectionConfig } from 'payload'
import { HeroPartial, AboutSection } from './blocks'

export const BlogPage: CollectionConfig = {
  slug: 'blogPage',
  labels: {
    singular: 'Blog Page',
    plural: 'Blog Pages',
  },
  admin: {
    useAsTitle: 'title',
    description: 'Configure the blog page layout and content sections',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      defaultValue: 'Blog Page Configuration',
      admin: {
        description: 'Internal title for this configuration',
      },
    },
    {
      name: 'contentBlocks',
      type: 'blocks',
      label: 'Content Blocks',
      blocks: [HeroPartial, AboutSection],
      admin: {
        description: 'Content sections that appear above the blog post list',
      },
    },
    {
      name: 'showFeaturedSection',
      type: 'checkbox',
      defaultValue: true,
      label: 'Show Featured Posts Section',
      admin: {
        description: 'Display the featured posts section',
      },
    },
    {
      name: 'featuredSectionTitle',
      type: 'text',
      defaultValue: 'Featured Posts',
      label: 'Featured Section Title',
      admin: {
        condition: (data, siblingData) => siblingData.showFeaturedSection,
      },
    },
    {
      name: 'allPostsTitle',
      type: 'text',
      defaultValue: 'All Posts',
      label: 'All Posts Section Title',
    },
    {
      name: 'enableSearch',
      type: 'checkbox',
      defaultValue: true,
      label: 'Enable Search',
      admin: {
        description: 'Allow users to search through blog posts',
      },
    },
    {
      name: 'enableTagFiltering',
      type: 'checkbox',
      defaultValue: true,
      label: 'Enable Tag Filtering',
      admin: {
        description: 'Allow users to filter posts by tags',
      },
    },
  ],
  timestamps: true,
}