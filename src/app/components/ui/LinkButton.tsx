import { useCallback } from "react";
import { useSmoothScroll } from "../../hooks/useSmoothScroll";
import Link from "next/link";

interface LinkButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function LinkButton({
  href,
  children,
  className = "",
  onClick,
}: LinkButtonProps) {
  const scrollToElement = useSmoothScroll();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      if (onClick) {
        onClick();
      }

      const targetId = href.replace("#", "");
      scrollToElement(targetId);
    },
    [href, onClick, scrollToElement]
  );

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={`
        relative pb-2 tracking-wider text-sm
        after:content-[''] after:absolute after:w-full
        after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0
        after:bg-primary after:origin-right
        after:transition-transform after:duration-300 after:ease-out
        hover:after:scale-x-100 hover:after:origin-left
        ${className}
      `}
    >
      {children}
    </Link>
  );
}
