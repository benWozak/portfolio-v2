import React from "react";
import { Metadata } from "next";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { BlogCard, EmptyState } from "@/components/content/blog";
import { SectionHeading } from "@/components/layout/section/SectionHeading";
import { AnimatedSection } from "@/components/layout/section/AnimatedSection";
import { ContentBlockRenderer } from "@/components/content/blocks";
import type { Blog } from "@/types/blog";
import type { BlogPage } from "@/types/blogPage";

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
  const payload = await getPayload({ config: configPromise });

  // Fetch blog page configuration
  const { docs: blogPageConfigs } = await payload.find({
    collection: "blogPage" as any,
    limit: 1,
  });

  const blogPageConfig = blogPageConfigs[0] as BlogPage | undefined;

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

  // Get the first featured post for the hero layout
  const heroPost = featuredPosts[0];
  const remainingFeaturedPosts = featuredPosts.slice(1);

  return (
    <div className="min-h-screen">
      {/* Render content blocks if configured */}
      {blogPageConfig?.contentBlocks && (
        <ContentBlockRenderer blocks={blogPageConfig.contentBlocks} />
      )}

      {/* Default hero section if no content blocks */}
      {!blogPageConfig?.contentBlocks && (
        <div className="container mx-auto px-4 py-16">
          <AnimatedSection>
            <div className="text-center my-16">
              <h1 className="text-4xl lg:text-6xl font-bold mb-4">Blog</h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Insights, tutorials, and thoughts on web development, design,
                and technology
              </p>
            </div>
          </AnimatedSection>
        </div>
      )}

      <div className="container mx-auto px-4 pb-16">
        {posts.length > 0 ? (
          <>
            {/* Featured Article Hero */}
            {heroPost && (
              <section className="mb-16">
                <BlogCard post={heroPost} index={0} variant="featured" />
              </section>
            )}

            {/* Remaining Featured Posts */}
            {remainingFeaturedPosts.length > 0 &&
              blogPageConfig?.showFeaturedSection !== false && (
                <section className="mb-16">
                  <SectionHeading
                    title={
                      blogPageConfig?.featuredSectionTitle || "Featured Posts"
                    }
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {remainingFeaturedPosts.map((post: Blog, index: number) => (
                      <BlogCard key={post.id} post={post} index={index + 1} />
                    ))}
                  </div>
                </section>
              )}

            {/* All Posts */}
            <section>
              <SectionHeading
                title={blogPageConfig?.allPostsTitle || "All Posts"}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post: Blog, index: number) => (
                  <BlogCard key={post.id} post={post} index={index} />
                ))}
              </div>
            </section>
          </>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}
