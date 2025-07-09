"use client";

import React from "react";
import { motion } from "framer-motion";
import { BlogCard } from "./BlogCard";
import { SectionHeading } from "../../layout/section/SectionHeading";
import type { Blog } from "@/types/blog";

interface RelatedPostsProps {
  posts: Blog[];
  currentPostId: string;
}

export function RelatedPosts({ posts, currentPostId }: RelatedPostsProps) {
  const relatedPosts = posts
    .filter(post => post.id !== currentPostId && post.status === 'published')
    .slice(0, 3);

  if (relatedPosts.length === 0) {
    return null;
  }

  return (
    <section className="mt-16">
      <SectionHeading title="Related Posts" />
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {relatedPosts.map((post, index) => (
          <BlogCard key={post.id} post={post} index={index} />
        ))}
      </motion.div>
    </section>
  );
}