"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Badge } from "../../ui/Badge";
import { calculateReadingTime, isContentTechnical } from "@/utils/readingTime";
import type { Media } from "@/payload-types";
import type { Blog, Category, Tag } from "@/types/blog";

interface BlogCardProps {
  post: Blog;
  index: number;
  variant?: 'default' | 'featured';
}

export function BlogCard({ post, index, variant = 'default' }: BlogCardProps) {
  const featuredImage = post.featuredImage as Media;
  const categories = post.categories as unknown as Category[];
  const tags = post.tags as unknown as Tag[];
  
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: index * 0.1,
        ease: "easeOut"
      }
    }
  };

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
  
  const isFeatured = variant === 'featured';
  const cardClasses = isFeatured 
    ? "bg-secondary-bg rounded-lg shadow-md overflow-hidden hover:shadow-md hover:shadow-slate-300 hover:dark:shadow-slate-500 transition-all duration-300 lg:grid lg:grid-cols-2 lg:gap-6"
    : "bg-secondary-bg rounded-lg shadow-md overflow-hidden hover:shadow-md hover:shadow-slate-300 hover:dark:shadow-slate-500 transition-all duration-300";
  const imageClasses = isFeatured 
    ? "relative h-64 lg:h-full bg-gradient-to-br from-secondary-300 via-secondary-500 to-secondary-700"
    : "relative h-48 bg-gradient-to-br from-secondary-300 via-secondary-500 to-secondary-700";
  const contentClasses = isFeatured 
    ? "p-8 flex flex-col justify-center"
    : "p-6";

  return (
    <motion.article
      className={cardClasses}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -4 }}
    >
      <Link href={`/blog/${post.slug}`} className={isFeatured ? "contents" : ""}>
        <div className={imageClasses}>
          {featuredImage && (
            <Image
              src={featuredImage.url || ''}
              alt={featuredImage.alt || post.title}
              fill
              style={{ objectFit: "cover" }}
              sizes={isFeatured ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
            />
          )}
          {post.featured && (
            <div className="absolute top-2 left-2">
              <Badge status="Featured" className="bg-primary-500 text-primary-foreground" />
            </div>
          )}
        </div>
        <div className={contentClasses}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-2">
              {categories?.slice(0, isFeatured ? 3 : 2).map((category) => (
                <Badge 
                  key={category.id}
                  status={category.name}
                  className="bg-secondary-200 text-secondary-800 dark:bg-secondary-800 dark:text-secondary-200"
                />
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span>{formatDate(post.publishedAt || post.createdAt)}</span>
              <span>•</span>
              <span>{readingTime}</span>
            </div>
          </div>
          <h3 className={`${isFeatured ? 'text-2xl lg:text-3xl' : 'text-xl'} font-semibold mb-2 ${isFeatured ? 'line-clamp-3' : 'line-clamp-2'}`}>
            {post.title}
          </h3>
          <p className={`text-gray-600 dark:text-gray-300 ${isFeatured ? 'text-base line-clamp-4' : 'text-sm line-clamp-3'}`}>
            {post.excerpt}
          </p>
        </div>
      </Link>
    </motion.article>
  );
}