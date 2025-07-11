import React from "react";
import { Badge } from "../../ui/Badge";
import { calculateReadingTime, isContentTechnical } from "@/utils/readingTime";
import type { Blog, User, Category, Tag } from "@/types/blog";

interface BlogMetaProps {
  post: Blog;
}

export function BlogMeta({ post }: BlogMetaProps) {
  const author = post.author as unknown as User;
  const categories = post.categories as unknown as Category[];
  const tags = post.tags as unknown as Tag[];

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const tagNames = tags?.map(tag => tag.name) || [];
  const isTechnical = isContentTechnical(post.content, tagNames);
  const readingTime = calculateReadingTime(post.content, isTechnical);

  return (
    <div className="flex flex-col gap-4 mb-8">
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-2">
          {author && (
            <span>By {author.email}</span>
          )}
          <span>•</span>
          <span>{formatDate(post.publishedAt || post.createdAt)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>{readingTime}</span>
        </div>
      </div>
      
      {categories && categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Badge 
              key={category.id}
              status={category.name}
              className="bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
            />
          ))}
        </div>
      )}
      
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge 
              key={tag.id}
              status={tag.name}
              className="bg-secondary-100 text-secondary-800 dark:bg-secondary-800 dark:text-secondary-200"
            />
          ))}
        </div>
      )}
    </div>
  );
}