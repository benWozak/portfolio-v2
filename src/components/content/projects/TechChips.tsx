import { cn } from "@/lib/utils";
import type { TechStack } from "@/types";

interface Props {
  items: string[];
  /** Show at most this many; the rest collapse into "+N more". */
  max?: number;
  label?: string;
  className?: string;
}

/** Frontend, backend, other, in that order. */
export function stackItems(stack: TechStack): string[] {
  return [...new Set([...stack.frontend, ...stack.backend, ...stack.other])];
}

export function TechChips({ items, max, label = "Tech stack", className }: Props) {
  if (items.length === 0) return null;
  const shown = max ? items.slice(0, max) : items;
  const hidden = items.length - shown.length;
  return (
    <ul role="list" className={cn("flex flex-wrap gap-2", className)} aria-label={label}>
      {shown.map((item) => (
        <li
          key={item}
          className="rounded-full border border-gray-300 bg-secondary-bg px-2.5 py-0.5 text-xs font-medium text-foreground dark:border-gray-600"
        >
          {item}
        </li>
      ))}
      {hidden > 0 && (
        <li className="rounded-full px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-300">
          +{hidden} more
        </li>
      )}
    </ul>
  );
}
