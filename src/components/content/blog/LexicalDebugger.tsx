"use client";
import React, { useState } from "react";

interface LexicalDebuggerProps {
  content: any;
  title?: string;
}

export function LexicalDebugger({
  content,
  title = "Lexical Content",
}: LexicalDebuggerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="border-2 border-dashed border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-sm font-mono text-yellow-800 dark:text-yellow-200 hover:underline"
      >
        🐛 {title} {isExpanded ? "(collapse)" : "(expand)"}
      </button>

      {isExpanded && (
        <div className="mt-2">
          <pre className="text-xs bg-yellow-100 dark:bg-yellow-900/40 p-2 rounded overflow-x-auto">
            {JSON.stringify(content, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
