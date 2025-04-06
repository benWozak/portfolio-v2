import { usePathname } from "next/navigation";

export interface NavItem {
  href: string;
  label: string;
}

/**
 * Hook that returns navigation items with proper URLs based on current path
 * @returns Array of navigation items with path-aware URLs
 */
export function useNavigation(): NavItem[] {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  const navItems: NavItem[] = [
    {
      href: isHomePage ? "#about" : "/#about",
      label: "About",
    },
    {
      href: isHomePage ? "#services" : "/#services",
      label: "Services",
    },
    {
      href: isHomePage ? "#experience" : "/#experience",
      label: "Experience",
    },
    {
      href: isHomePage ? "#projects" : "/#projects",
      label: "Projects",
    },
    {
      href: "/contact",
      label: "Contact",
    },
  ];

  return navItems;
}