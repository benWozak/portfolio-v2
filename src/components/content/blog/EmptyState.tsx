import React from "react";
import { Button } from "@/components/ui/Button";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  showAction?: boolean;
}

export function EmptyState({
  title = "No blog posts yet",
  description = "I'm working on some great content! Check back soon for insights, tutorials, and thoughts on software engineering and web development.",
  actionLabel = "Get Notified",
  actionHref = "/contact",
  showAction = false,
}: EmptyStateProps) {
  return (
    <div className="text-center py-48 px-4">
      <div className="max-w-md mx-auto">
        {/* Illustration/Icon */}
        <div className="mb-8">
          <div className="relative mx-auto w-24 h-24 mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full animate-pulse" />
            <div className="absolute inset-2 bg-gradient-to-br from-primary to-secondary rounded-full opacity-80" />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Content */}
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
            {title}
          </h2>
          <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
            {description}
          </p>

          {showAction && (
            <div>
              <Button
                href={actionHref}
                label={actionLabel}
                variant="primary"
                className="px-8 py-3"
              />
            </div>
          )}
        </div>

        {/* Decorative elements */}
        <div className="mt-12 flex justify-center space-x-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-primary/30 rounded-full animate-pulse"
              style={{
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
