export interface NavItem {
  href: string;
  label: string;
  /** Path prefix that keeps the item active; defaults to `href`. */
  activePrefix?: string;
}

/**
 * Hook that returns navigation items with proper URLs based on current path
 * @returns Array of navigation items with path-aware URLs
 */
export function useNavigation(): NavItem[] {

  const navItems: NavItem[] = [
    {
      href: "/projects/professional",
      label: "Projects",
      activePrefix: "/projects",
    },
    {
      href: "/contact",
      label: "Contact",
    },
  ];

  return navItems;
}