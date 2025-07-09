// import { usePathname } from "next/navigation";

export interface NavItem {
  href: string;
  label: string;
}

/**
 * Hook that returns navigation items with proper URLs based on current path
 * @returns Array of navigation items with path-aware URLs
 */
export function useNavigation(): NavItem[] {
  // const pathname = usePathname();
  // const isHomePage = pathname === "/";

  const navItems: NavItem[] = [
    {
      href: "/about",
      label: "About",
    },
    {
      href: "/projects",
      label: "Projects",
    },
    {
      href: "/blog",
      label: "Blog",
    },
    // {
    //   href: "/resume",
    //   label: "Resume",
    // },
    {
      href: "/contact",
      label: "Contact",
    },
  ];

  return navItems;
}