import React from "react";
import { Metadata } from "next";
import { getPayloadHMR } from "@payloadcms/next/utilities";
import configPromise from "@payload-config";
import { BlogCard } from "@/components/content/blog";
import { SectionHeading } from "@/components/layout/section/SectionHeading";
import { AnimatedSection } from "@/components/layout/section/AnimatedSection";
import type { Blog } from "@/types/blog";

export const metadata: Metadata = {
  title: "Blog | Ben Wozak",
  description: "Thoughts on web development, design, and technology",
  openGraph: {
    title: "Blog | Ben Wozak",
    description: "Thoughts on web development, design, and technology",
    type: "website",
  },
};

export default async function BlogPage() {
  const payload = await getPayloadHMR({ config: configPromise });
  
  const { docs: posts } = await payload.find({
    collection: "blog" as any,
    where: {
      status: {
        equals: "published",
      },
    },
    sort: "-publishedAt",
    limit: 50,
  });

  const { docs: featuredPosts } = await payload.find({
    collection: "blog" as any,
    where: {
      and: [
        {
          status: {
            equals: "published",
          },
        },
        {
          featured: {
            equals: true,
          },
        },
      ],
    },
    sort: "-publishedAt",
    limit: 3,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary-50">
      <div className="container mx-auto px-4 py-16">
        <AnimatedSection>
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-6xl font-bold mb-4">
              Blog
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Insights, tutorials, and thoughts on web development, design, and technology
            </p>
          </div>
        </AnimatedSection>

        {featuredPosts.length > 0 && (
          <section className="mb-16">
            <SectionHeading title="Featured Posts" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredPosts.map((post: Blog, index: number) => (
                <BlogCard key={post.id} post={post} index={index} />
              ))}
            </div>
          </section>
        )}

        <section>
          <SectionHeading title="All Posts" />
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post: Blog, index: number) => (
                <BlogCard key={post.id} post={post} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                No blog posts yet. Check back soon!
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}