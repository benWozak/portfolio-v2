/* tslint:disable */
/* eslint-disable */
/**
 * This file was automatically generated by Payload.
 * DO NOT MODIFY IT BY HAND. Instead, modify your source Payload config,
 * and re-run `payload generate:types` to regenerate this file.
 */

/**
 * Supported timezones in IANA format.
 *
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "supportedTimezones".
 */
export type SupportedTimezones =
  | 'Pacific/Midway'
  | 'Pacific/Niue'
  | 'Pacific/Honolulu'
  | 'Pacific/Rarotonga'
  | 'America/Anchorage'
  | 'Pacific/Gambier'
  | 'America/Los_Angeles'
  | 'America/Tijuana'
  | 'America/Denver'
  | 'America/Phoenix'
  | 'America/Chicago'
  | 'America/Guatemala'
  | 'America/New_York'
  | 'America/Bogota'
  | 'America/Caracas'
  | 'America/Santiago'
  | 'America/Buenos_Aires'
  | 'America/Sao_Paulo'
  | 'Atlantic/South_Georgia'
  | 'Atlantic/Azores'
  | 'Atlantic/Cape_Verde'
  | 'Europe/London'
  | 'Europe/Berlin'
  | 'Africa/Lagos'
  | 'Europe/Athens'
  | 'Africa/Cairo'
  | 'Europe/Moscow'
  | 'Asia/Riyadh'
  | 'Asia/Dubai'
  | 'Asia/Baku'
  | 'Asia/Karachi'
  | 'Asia/Tashkent'
  | 'Asia/Calcutta'
  | 'Asia/Dhaka'
  | 'Asia/Almaty'
  | 'Asia/Jakarta'
  | 'Asia/Bangkok'
  | 'Asia/Shanghai'
  | 'Asia/Singapore'
  | 'Asia/Tokyo'
  | 'Asia/Seoul'
  | 'Australia/Brisbane'
  | 'Australia/Sydney'
  | 'Pacific/Guam'
  | 'Pacific/Noumea'
  | 'Pacific/Auckland'
  | 'Pacific/Fiji';

export interface Config {
  auth: {
    users: UserAuthOperations;
  };
  blocks: {};
  collections: {
    users: User;
    media: Media;
    blog: Blog;
    categories: Category;
    tags: Tag;
    blogPage: BlogPage;
    professionalInsights: ProfessionalInsight;
    tutorials: Tutorial;
    projects: Project;
    resume: Resume;
    'payload-locked-documents': PayloadLockedDocument;
    'payload-preferences': PayloadPreference;
    'payload-migrations': PayloadMigration;
  };
  collectionsJoins: {};
  collectionsSelect: {
    users: UsersSelect<false> | UsersSelect<true>;
    media: MediaSelect<false> | MediaSelect<true>;
    blog: BlogSelect<false> | BlogSelect<true>;
    categories: CategoriesSelect<false> | CategoriesSelect<true>;
    tags: TagsSelect<false> | TagsSelect<true>;
    blogPage: BlogPageSelect<false> | BlogPageSelect<true>;
    professionalInsights: ProfessionalInsightsSelect<false> | ProfessionalInsightsSelect<true>;
    tutorials: TutorialsSelect<false> | TutorialsSelect<true>;
    projects: ProjectsSelect<false> | ProjectsSelect<true>;
    resume: ResumeSelect<false> | ResumeSelect<true>;
    'payload-locked-documents': PayloadLockedDocumentsSelect<false> | PayloadLockedDocumentsSelect<true>;
    'payload-preferences': PayloadPreferencesSelect<false> | PayloadPreferencesSelect<true>;
    'payload-migrations': PayloadMigrationsSelect<false> | PayloadMigrationsSelect<true>;
  };
  db: {
    defaultIDType: number;
  };
  globals: {};
  globalsSelect: {};
  locale: null;
  user: User & {
    collection: 'users';
  };
  jobs: {
    tasks: unknown;
    workflows: unknown;
  };
}
export interface UserAuthOperations {
  forgotPassword: {
    email: string;
    password: string;
  };
  login: {
    email: string;
    password: string;
  };
  registerFirstUser: {
    email: string;
    password: string;
  };
  unlock: {
    email: string;
    password: string;
  };
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "users".
 */
export interface User {
  id: number;
  updatedAt: string;
  createdAt: string;
  email: string;
  resetPasswordToken?: string | null;
  resetPasswordExpiration?: string | null;
  salt?: string | null;
  hash?: string | null;
  loginAttempts?: number | null;
  lockUntil?: string | null;
  sessions?:
    | {
        id: string;
        createdAt?: string | null;
        expiresAt: string;
      }[]
    | null;
  password?: string | null;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "media".
 */
export interface Media {
  id: number;
  alt: string;
  updatedAt: string;
  createdAt: string;
  url?: string | null;
  thumbnailURL?: string | null;
  filename?: string | null;
  mimeType?: string | null;
  filesize?: number | null;
  width?: number | null;
  height?: number | null;
  focalX?: number | null;
  focalY?: number | null;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "blog".
 */
export interface Blog {
  id: number;
  title: string;
  /**
   * URL-friendly version of the title (auto-generated if empty)
   */
  slug: string;
  /**
   * Brief description for blog post previews (auto-generated from content if empty)
   */
  excerpt: string;
  content: {
    root: {
      type: string;
      children: {
        type: string;
        version: number;
        [k: string]: unknown;
      }[];
      direction: ('ltr' | 'rtl') | null;
      format: 'left' | 'start' | 'center' | 'right' | 'end' | 'justify' | '';
      indent: number;
      version: number;
    };
    [k: string]: unknown;
  };
  /**
   * Main image for the blog post
   */
  featuredImage?: (number | null) | Media;
  status?: ('draft' | 'published') | null;
  /**
   * Feature this post on the blog homepage
   */
  featured?: boolean | null;
  publishedAt?: string | null;
  author?: (number | null) | User;
  categories?: (number | Category)[] | null;
  tags?: (number | Tag)[] | null;
  seo?: {
    /**
     * Custom title for search engines (auto-generated from title if empty)
     */
    metaTitle?: string | null;
    /**
     * Description for search engines and social media (auto-generated from excerpt if empty)
     */
    metaDescription?: string | null;
    /**
     * Image for social media sharing (auto-set to featured image if empty)
     */
    ogImage?: (number | null) | Media;
  };
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "categories".
 */
export interface Category {
  id: number;
  name: string;
  /**
   * URL-friendly version of the category name
   */
  slug: string;
  /**
   * Optional description for the category
   */
  description?: string | null;
  /**
   * Hex color code for the category badge (e.g., #FF6B35)
   */
  color?: string | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "tags".
 */
export interface Tag {
  id: number;
  name: string;
  /**
   * URL-friendly version of the tag name
   */
  slug: string;
  updatedAt: string;
  createdAt: string;
}
/**
 * Configure the blog page layout and content sections
 *
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "blogPage".
 */
export interface BlogPage {
  id: number;
  /**
   * Internal title for this configuration
   */
  title: string;
  /**
   * Content sections that appear above the blog post list
   */
  contentBlocks?: (HeroPartialBlock | AboutSectionBlock)[] | null;
  /**
   * Display the featured posts section
   */
  showFeaturedSection?: boolean | null;
  featuredSectionTitle?: string | null;
  allPostsTitle?: string | null;
  /**
   * Allow users to search through blog posts
   */
  enableSearch?: boolean | null;
  /**
   * Allow users to filter posts by tags
   */
  enableTagFiltering?: boolean | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "HeroPartialBlock".
 */
export interface HeroPartialBlock {
  /**
   * Main heading for the hero section
   */
  title: string;
  /**
   * Supporting text that appears below the title
   */
  subtitle?: string | null;
  /**
   * Call-to-action button text (optional)
   */
  ctaText?: string | null;
  /**
   * Call-to-action button URL (optional)
   */
  ctaUrl?: string | null;
  /**
   * Optional background image for the hero section
   */
  backgroundImage?: (number | null) | Media;
  id?: string | null;
  blockName?: string | null;
  blockType: 'heroPartial';
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "AboutSectionBlock".
 */
export interface AboutSectionBlock {
  /**
   * Title for the about section
   */
  title: string;
  /**
   * Rich text content for the about section
   */
  content: {
    root: {
      type: string;
      children: {
        type: string;
        version: number;
        [k: string]: unknown;
      }[];
      direction: ('ltr' | 'rtl') | null;
      format: 'left' | 'start' | 'center' | 'right' | 'end' | 'justify' | '';
      indent: number;
      version: number;
    };
    [k: string]: unknown;
  };
  /**
   * Optional image for the about section
   */
  image?: (number | null) | Media;
  /**
   * Position of the image relative to the content
   */
  imagePosition?: ('left' | 'right' | 'above' | 'below') | null;
  id?: string | null;
  blockName?: string | null;
  blockType: 'aboutSection';
}
/**
 * Insights and thoughts from your professional career experiences
 *
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "professionalInsights".
 */
export interface ProfessionalInsight {
  id: number;
  title: string;
  /**
   * URL-friendly version of the title
   */
  slug: string;
  /**
   * A concise summary of the professional insight
   */
  summary: string;
  content: {
    root: {
      type: string;
      children: {
        type: string;
        version: number;
        [k: string]: unknown;
      }[];
      direction: ('ltr' | 'rtl') | null;
      format: 'left' | 'start' | 'center' | 'right' | 'end' | 'justify' | '';
      indent: number;
      version: number;
    };
    [k: string]: unknown;
  };
  /**
   * Category that best describes this professional insight
   */
  category:
    | 'leadership'
    | 'architecture'
    | 'collaboration'
    | 'career'
    | 'project-management'
    | 'industry'
    | 'problem-solving';
  /**
   * Experience level when this insight was gained
   */
  experienceLevel: 'junior' | 'mid' | 'senior' | 'leadership';
  /**
   * Main learnings or actionable insights
   */
  keyTakeaways?:
    | {
        takeaway: string;
        id?: string | null;
      }[]
    | null;
  /**
   * Technologies or tools related to this insight
   */
  relatedTechnologies?: (number | Tag)[] | null;
  /**
   * Feature this insight on the blog page
   */
  featured?: boolean | null;
  status?: ('draft' | 'published') | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * Step-by-step tutorials and walkthroughs for various technologies and workflows
 *
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "tutorials".
 */
export interface Tutorial {
  id: number;
  title: string;
  /**
   * URL-friendly version of the title
   */
  slug: string;
  /**
   * Brief description of what the tutorial covers
   */
  description: string;
  content: {
    root: {
      type: string;
      children: {
        type: string;
        version: number;
        [k: string]: unknown;
      }[];
      direction: ('ltr' | 'rtl') | null;
      format: 'left' | 'start' | 'center' | 'right' | 'end' | 'justify' | '';
      indent: number;
      version: number;
    };
    [k: string]: unknown;
  };
  /**
   * Difficulty level of this tutorial
   */
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  /**
   * Estimated time to complete (e.g., "30 minutes", "2 hours")
   */
  estimatedTime?: string | null;
  /**
   * What knowledge or tools are needed before starting
   */
  prerequisites?:
    | {
        prerequisite: string;
        id?: string | null;
      }[]
    | null;
  /**
   * What the user will learn by completing this tutorial
   */
  learningOutcomes?:
    | {
        outcome: string;
        id?: string | null;
      }[]
    | null;
  /**
   * Link to GitHub repo or code examples (optional)
   */
  codeRepository?: string | null;
  /**
   * Link to live demo or finished project (optional)
   */
  demoUrl?: string | null;
  /**
   * Technologies, frameworks, or tools covered in this tutorial
   */
  technologies?: (number | Tag)[] | null;
  /**
   * Categories this tutorial belongs to
   */
  categories?: (number | Category)[] | null;
  /**
   * Feature this tutorial on the blog page
   */
  featured?: boolean | null;
  status?: ('draft' | 'published') | null;
  /**
   * When the tutorial was last updated
   */
  lastUpdated?: string | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "projects".
 */
export interface Project {
  id: number;
  /**
   * Project name as displayed on the website
   */
  name: string;
  /**
   * Project type - web or native application
   */
  type: 'web' | 'native';
  /**
   * Current status of the project
   */
  status: 'In Progress' | 'Prototype' | 'Professional';
  /**
   * Brief description of the project
   */
  description: string;
  /**
   * Detailed overview of the project and your role
   */
  overview: string;
  /**
   * The main challenge or problem this project addressed
   */
  challenge: string;
  /**
   * How you solved the challenge and technical implementation details
   */
  solution: string;
  /**
   * What you learned from this project and its impact
   */
  keyTakeaways: string;
  techStack?: {
    /**
     * Frontend technologies used
     */
    frontend?:
      | {
          technology: string;
          id?: string | null;
        }[]
      | null;
    /**
     * Backend technologies used
     */
    backend?:
      | {
          technology: string;
          id?: string | null;
        }[]
      | null;
    /**
     * Other tools and technologies used
     */
    other?:
      | {
          technology: string;
          id?: string | null;
        }[]
      | null;
  };
  media: {
    /**
     * Static image/screenshot of the project
     */
    staticImage: number | Media;
    /**
     * Video showcasing the project (MP4 format recommended)
     */
    video?: (number | null) | Media;
  };
  /**
   * Live URL where the project can be viewed (optional)
   */
  liveUrl?: string | null;
  /**
   * GitHub repository URL (optional)
   */
  githubUrl?: string | null;
  seo?: {
    /**
     * Custom title for search engines (auto-generated from name if empty)
     */
    metaTitle?: string | null;
    /**
     * Description for search engines and social media (auto-generated from description if empty)
     */
    metaDescription?: string | null;
    /**
     * Image for social media sharing (auto-set to staticImage if empty)
     */
    ogImage?: (number | null) | Media;
  };
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "resume".
 */
export interface Resume {
  id: number;
  /**
   * Version name/identifier for this resume (e.g., "v2024.1", "Senior Developer", etc.)
   */
  version: string;
  /**
   * Only one resume version can be active at a time. This will be displayed on the live site.
   */
  isActive?: boolean | null;
  full_name: string;
  phone: string;
  email: string;
  /**
   * Professional summary/bio
   */
  summary: string;
  socials: {
    linkedin_url: string;
    github_url: string;
    portfolio_url: string;
  };
  experience?:
    | {
        company: string;
        position: string;
        duration: {
          /**
           * Start date (e.g., "Jan 2025")
           */
          startDate: string;
          /**
           * End date (e.g., "Dec 2025") - leave empty for current position
           */
          endDate?: string | null;
        };
        /**
         * List of achievements and responsibilities
         */
        description?:
          | {
              item: string;
              id?: string | null;
            }[]
          | null;
        id?: string | null;
      }[]
    | null;
  skills?:
    | {
        /**
         * Category name (e.g., "Languages", "Frameworks", etc.)
         */
        skill_title: string;
        /**
         * Comma-separated list of skills in this category
         */
        skill_items: string;
        id?: string | null;
      }[]
    | null;
  education: {
    institution: string;
    location: string;
    duration: {
      startDate: string;
      endDate: string;
    };
    degree: string;
  };
  seo?: {
    /**
     * Custom title for search engines (auto-generated from full_name if empty)
     */
    metaTitle?: string | null;
    /**
     * Description for search engines and social media (auto-generated from summary if empty)
     */
    metaDescription?: string | null;
  };
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "payload-locked-documents".
 */
export interface PayloadLockedDocument {
  id: number;
  document?:
    | ({
        relationTo: 'users';
        value: number | User;
      } | null)
    | ({
        relationTo: 'media';
        value: number | Media;
      } | null)
    | ({
        relationTo: 'blog';
        value: number | Blog;
      } | null)
    | ({
        relationTo: 'categories';
        value: number | Category;
      } | null)
    | ({
        relationTo: 'tags';
        value: number | Tag;
      } | null)
    | ({
        relationTo: 'blogPage';
        value: number | BlogPage;
      } | null)
    | ({
        relationTo: 'professionalInsights';
        value: number | ProfessionalInsight;
      } | null)
    | ({
        relationTo: 'tutorials';
        value: number | Tutorial;
      } | null)
    | ({
        relationTo: 'projects';
        value: number | Project;
      } | null)
    | ({
        relationTo: 'resume';
        value: number | Resume;
      } | null);
  globalSlug?: string | null;
  user: {
    relationTo: 'users';
    value: number | User;
  };
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "payload-preferences".
 */
export interface PayloadPreference {
  id: number;
  user: {
    relationTo: 'users';
    value: number | User;
  };
  key?: string | null;
  value?:
    | {
        [k: string]: unknown;
      }
    | unknown[]
    | string
    | number
    | boolean
    | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "payload-migrations".
 */
export interface PayloadMigration {
  id: number;
  name?: string | null;
  batch?: number | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "users_select".
 */
export interface UsersSelect<T extends boolean = true> {
  updatedAt?: T;
  createdAt?: T;
  email?: T;
  resetPasswordToken?: T;
  resetPasswordExpiration?: T;
  salt?: T;
  hash?: T;
  loginAttempts?: T;
  lockUntil?: T;
  sessions?:
    | T
    | {
        id?: T;
        createdAt?: T;
        expiresAt?: T;
      };
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "media_select".
 */
export interface MediaSelect<T extends boolean = true> {
  alt?: T;
  updatedAt?: T;
  createdAt?: T;
  url?: T;
  thumbnailURL?: T;
  filename?: T;
  mimeType?: T;
  filesize?: T;
  width?: T;
  height?: T;
  focalX?: T;
  focalY?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "blog_select".
 */
export interface BlogSelect<T extends boolean = true> {
  title?: T;
  slug?: T;
  excerpt?: T;
  content?: T;
  featuredImage?: T;
  status?: T;
  featured?: T;
  publishedAt?: T;
  author?: T;
  categories?: T;
  tags?: T;
  seo?:
    | T
    | {
        metaTitle?: T;
        metaDescription?: T;
        ogImage?: T;
      };
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "categories_select".
 */
export interface CategoriesSelect<T extends boolean = true> {
  name?: T;
  slug?: T;
  description?: T;
  color?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "tags_select".
 */
export interface TagsSelect<T extends boolean = true> {
  name?: T;
  slug?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "blogPage_select".
 */
export interface BlogPageSelect<T extends boolean = true> {
  title?: T;
  contentBlocks?:
    | T
    | {
        heroPartial?: T | HeroPartialBlockSelect<T>;
        aboutSection?: T | AboutSectionBlockSelect<T>;
      };
  showFeaturedSection?: T;
  featuredSectionTitle?: T;
  allPostsTitle?: T;
  enableSearch?: T;
  enableTagFiltering?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "HeroPartialBlock_select".
 */
export interface HeroPartialBlockSelect<T extends boolean = true> {
  title?: T;
  subtitle?: T;
  ctaText?: T;
  ctaUrl?: T;
  backgroundImage?: T;
  id?: T;
  blockName?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "AboutSectionBlock_select".
 */
export interface AboutSectionBlockSelect<T extends boolean = true> {
  title?: T;
  content?: T;
  image?: T;
  imagePosition?: T;
  id?: T;
  blockName?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "professionalInsights_select".
 */
export interface ProfessionalInsightsSelect<T extends boolean = true> {
  title?: T;
  slug?: T;
  summary?: T;
  content?: T;
  category?: T;
  experienceLevel?: T;
  keyTakeaways?:
    | T
    | {
        takeaway?: T;
        id?: T;
      };
  relatedTechnologies?: T;
  featured?: T;
  status?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "tutorials_select".
 */
export interface TutorialsSelect<T extends boolean = true> {
  title?: T;
  slug?: T;
  description?: T;
  content?: T;
  difficulty?: T;
  estimatedTime?: T;
  prerequisites?:
    | T
    | {
        prerequisite?: T;
        id?: T;
      };
  learningOutcomes?:
    | T
    | {
        outcome?: T;
        id?: T;
      };
  codeRepository?: T;
  demoUrl?: T;
  technologies?: T;
  categories?: T;
  featured?: T;
  status?: T;
  lastUpdated?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "projects_select".
 */
export interface ProjectsSelect<T extends boolean = true> {
  name?: T;
  type?: T;
  status?: T;
  description?: T;
  overview?: T;
  challenge?: T;
  solution?: T;
  keyTakeaways?: T;
  techStack?:
    | T
    | {
        frontend?:
          | T
          | {
              technology?: T;
              id?: T;
            };
        backend?:
          | T
          | {
              technology?: T;
              id?: T;
            };
        other?:
          | T
          | {
              technology?: T;
              id?: T;
            };
      };
  media?:
    | T
    | {
        staticImage?: T;
        video?: T;
      };
  liveUrl?: T;
  githubUrl?: T;
  seo?:
    | T
    | {
        metaTitle?: T;
        metaDescription?: T;
        ogImage?: T;
      };
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "resume_select".
 */
export interface ResumeSelect<T extends boolean = true> {
  version?: T;
  isActive?: T;
  full_name?: T;
  phone?: T;
  email?: T;
  summary?: T;
  socials?:
    | T
    | {
        linkedin_url?: T;
        github_url?: T;
        portfolio_url?: T;
      };
  experience?:
    | T
    | {
        company?: T;
        position?: T;
        duration?:
          | T
          | {
              startDate?: T;
              endDate?: T;
            };
        description?:
          | T
          | {
              item?: T;
              id?: T;
            };
        id?: T;
      };
  skills?:
    | T
    | {
        skill_title?: T;
        skill_items?: T;
        id?: T;
      };
  education?:
    | T
    | {
        institution?: T;
        location?: T;
        duration?:
          | T
          | {
              startDate?: T;
              endDate?: T;
            };
        degree?: T;
      };
  seo?:
    | T
    | {
        metaTitle?: T;
        metaDescription?: T;
      };
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "payload-locked-documents_select".
 */
export interface PayloadLockedDocumentsSelect<T extends boolean = true> {
  document?: T;
  globalSlug?: T;
  user?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "payload-preferences_select".
 */
export interface PayloadPreferencesSelect<T extends boolean = true> {
  user?: T;
  key?: T;
  value?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "payload-migrations_select".
 */
export interface PayloadMigrationsSelect<T extends boolean = true> {
  name?: T;
  batch?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "auth".
 */
export interface Auth {
  [k: string]: unknown;
}


declare module 'payload' {
  export interface GeneratedTypes extends Config {}
}