// src/components/content/projects/ProjectLinks.tsx
// FINAL (design option B). The two home-row button styles, opening in a new tab.
import { CTAButton } from "@/components/ui/CTAButton";
import { cn } from "@/lib/utils";

interface Props {
  liveUrl: string | null;
  githubUrl: string | null;
  /** Show "I do not own the rights…" when there is no code link. */
  showRightsNote?: boolean;
  className?: string;
}

export function ProjectLinks({ liveUrl, githubUrl, showRightsNote = false, className }: Props) {
  const note = showRightsNote && !githubUrl;
  if (!liveUrl && !githubUrl && !note) return null;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {(liveUrl || githubUrl) && (
        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
          {liveUrl && (
            <CTAButton href={liveUrl} external>
              Visit live site<span aria-hidden="true">{"\u00a0↗"}</span>
            </CTAButton>
          )}
          {githubUrl && (
            <CTAButton type="secondary" href={githubUrl} external>
              View source<span aria-hidden="true">{"\u00a0↗"}</span>
            </CTAButton>
          )}
        </div>
      )}
      {note && (
        <p className="text-sm italic text-gray-500 dark:text-gray-400">
          I do not own the rights to the code for this project.
        </p>
      )}
    </div>
  );
}
