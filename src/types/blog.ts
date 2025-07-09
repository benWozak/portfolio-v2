import type { Media } from "@/payload-types";

// Temporary Blog type until PayloadCMS generates the proper types
export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: any;
  featuredImage?: string | Media;
  status: 'draft' | 'published';
  featured: boolean;
  publishedAt?: string;
  author?: string;
  categories?: string[];
  tags?: string[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string | Media;
  };
  createdAt: string;
  updatedAt: string;
}

// Temporary Category type
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// Temporary Tag type
export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// Temporary User type extension
export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}