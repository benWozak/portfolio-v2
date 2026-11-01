// src/components/content/projects/case-study/KeyTakeaways.tsx
import { Markdown } from "@/components/content/markdown/Markdown";

export function KeyTakeaways({ items }: { items: string[] }) {
  return (
    <aside aria-labelledby="key-takeaways" className="rounded-xl bg-secondary-bg p-6 lg:p-8">
      <h2 id="key-takeaways" className="mb-4 text-xl font-bold uppercase tracking-wider">
        Key Takeaways
      </h2>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3 text-gray-700 dark:text-gray-200">
            <span aria-hidden="true" className="mt-2 h-2 w-2 flex-none rounded-full bg-secondary-500" />
            <span>
              <Markdown inline>{item}</Markdown>
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
