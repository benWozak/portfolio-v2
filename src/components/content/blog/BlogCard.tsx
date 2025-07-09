"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Badge } from "../../ui/Badge";
import type { Media } from "@/payload-types";
import type { Blog, Category } from "@/types/blog";

interface BlogCardProps {
  post: Blog;
  index: number;
}

export function BlogCard({ post, index }: BlogCardProps) {
  const featuredImage = post.featuredImage as Media;
  const categories = post.categories as unknown as Category[];
  
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

  return (
    <motion.article
      className="bg-secondary-bg rounded-lg shadow-md overflow-hidden hover:shadow-md hover:shadow-slate-300 hover:dark:shadow-slate-500 transition-all duration-300"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -4 }}
    >
      <Link href={`/blog/${post.slug}`}>
        <div className="relative h-48 bg-gradient-to-br from-secondary-300 via-secondary-500 to-secondary-700">
          {featuredImage && (
            <Image
              src={featuredImage.url || ''}
              alt={featuredImage.alt || post.title}
              fill
              style={{ objectFit: "cover" }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )}
          {post.featured && (
            <div className="absolute top-2 left-2">
              <Badge status="Featured" className="bg-primary-500 text-primary-foreground" />
            </div>
          )}
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-2">
              {categories?.slice(0, 2).map((category) => (
                <Badge 
                  key={category.id}
                  status={category.name}
                  className="bg-secondary-200 text-secondary-800 dark:bg-secondary-800 dark:text-secondary-200"
                />
              ))}
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {formatDate(post.publishedAt || post.createdAt)}
            </span>
          </div>
          <h3 className="text-xl font-semibold mb-2 line-clamp-2">{post.title}</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3">
            {post.excerpt}
          </p>
        </div>
      </Link>
    </motion.article>
  );
}