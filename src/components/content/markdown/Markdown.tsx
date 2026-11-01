// Server component. Renders first-party Markdown from content/projects. No raw
// HTML (react-markdown escapes it unless rehype-raw is added; it is not).
import Link from "next/link";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

const components: Components = {
  a: ({ href = "", children }) => {
    if (/^https?:\/\//.test(href)) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="focus-ring rounded-sm">
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className="focus-ring rounded-sm">
        {children}
      </Link>
    );
  },
};

interface Props {
  children: string;
  /** Unwrap paragraphs (no <p>); for list items and short labels. Other block elements pass through. */
  inline?: boolean;
  /** Extra classes on the block wrapper; ignored in inline mode (there is no wrapper). */
  className?: string;
}

export function Markdown({ children, inline = false, className }: Props) {
  if (inline) {
    return (
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components} disallowedElements={["p"]} unwrapDisallowed>
        {children}
      </ReactMarkdown>
    );
  }
  return (
    <div className={cn("prose prose-neutral max-w-none dark:prose-invert", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
