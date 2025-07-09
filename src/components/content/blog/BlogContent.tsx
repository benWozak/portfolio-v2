import React from "react";
import { LexicalRenderer } from "@/utils/lexicalRenderer";
import { LexicalDebugger } from "./LexicalDebugger";
// import type { SerializedLexicalState } from "@payloadcms/richtext-lexical";

interface BlogContentProps {
  content: any;
}

export function BlogContent({ content }: BlogContentProps) {
  return (
    <div className="blog-content">
      <LexicalDebugger content={content} title="Blog Content Structure" />
      <LexicalRenderer 
        content={content} 
        className="prose prose-lg max-w-none dark:prose-invert"
      />
    </div>
  );
}