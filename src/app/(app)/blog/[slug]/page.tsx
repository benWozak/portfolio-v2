import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getPayloadHMR } from "@payloadcms/next/utilities";
import configPromise from "@payload-config";
import { BlogMeta, BlogContent, RelatedPosts } from "@/components/content/blog";
import { AnimatedSection } from "@/components/layout/section/AnimatedSection";
import type { Media } from "@/payload-types";
import type { Blog } from "@/types/blog";

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const payload = await getPayloadHMR({ config: configPromise });

  const { docs: posts } = await payload.find({
    collection: "blog" as any,
    where: {
      status: {
        equals: "published",
      },
    },
    limit: 1000,
  });

  return posts.map((post: Blog) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const payload = await getPayloadHMR({ config: configPromise });

  const { docs } = await payload.find({
    collection: "blog" as any,
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
  });

  const post = docs[0];

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  const featuredImage = post.featuredImage as Media;
  const ogImage = post.seo?.ogImage as Media;

  return {
    title: post.seo?.metaTitle || post.title,
    description: post.seo?.metaDescription || post.excerpt,
    openGraph: {
      title: post.seo?.metaTitle || post.title,
      description: post.seo?.metaDescription || post.excerpt,
      type: "article",
      publishedTime: post.publishedAt || post.createdAt,
      modifiedTime: post.updatedAt,
      images:
        ogImage?.url || featuredImage?.url
          ? [
              {
                url: ogImage?.url || featuredImage?.url || "",
                alt: ogImage?.alt || featuredImage?.alt || post.title,
              },
            ]
          : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.seo?.metaTitle || post.title,
      description: post.seo?.metaDescription || post.excerpt,
      images:
        ogImage?.url || featuredImage?.url
          ? [ogImage?.url || featuredImage?.url || ""]
          : [],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const payload = await getPayloadHMR({ config: configPromise });

  const { docs } = await payload.find({
    collection: "blog" as any,
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
  });

  const post = docs[0];

  if (!post) {
    notFound();
  }

  const { docs: allPosts } = await payload.find({
    collection: "blog" as any,
    where: {
      status: {
        equals: "published",
      },
    },
    sort: "-publishedAt",
    limit: 10,
  });

  const featuredImage = post.featuredImage as Media;

  return (
    <div className="min-h-screen">
      <article className="container mx-auto px-4 py-16">
        <AnimatedSection>
          {/* Hero Section */}
          <div className="max-w-4xl mx-auto mb-12">
            {featuredImage && (
              <div className="relative w-full h-96 mb-8 rounded-lg overflow-hidden">
                <Image
                  src={featuredImage.url || ""}
                  alt={featuredImage.alt || post.title}
                  fill
                  style={{ objectFit: "cover" }}
                  className="transition-transform duration-300 hover:scale-105"
                />
              </div>
            )}

            <div className="text-center">
              <h1 className="text-4xl lg:text-6xl font-bold mb-6">
                {post.title}
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
                {post.excerpt}
              </p>
            </div>
          </div>
        </AnimatedSection>

        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <BlogMeta post={post} />
          </AnimatedSection>

          <AnimatedSection>
            <div className="prose prose-lg max-w-none dark:prose-invert">
              <BlogContent content={post.content} />
            </div>
          </AnimatedSection>

          <RelatedPosts posts={allPosts} currentPostId={post.id} />
        </div>
      </article>
    </div>
  );
}
