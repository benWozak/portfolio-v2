import Image from "next/image";
import type { ProjectImage as ProjectImageData } from "@/types";

interface Props {
  image: ProjectImageData;
  /** Responsive `sizes` hint; required so next/image picks sensible srcset entries. */
  sizes: string;
  priority?: boolean;
  className?: string;
}

export function ProjectImage({ image, sizes, priority = false, className }: Props) {
  return (
    <Image
      src={image.src}
      alt={image.alt}
      width={image.width}
      height={image.height}
      sizes={sizes}
      priority={priority}
      placeholder="blur"
      blurDataURL={image.blurDataURL}
      className={className}
    />
  );
}
