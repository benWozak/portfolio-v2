export interface NavItem {
  href: string;
  label: string;
}

/**
 * Hook that returns navigation items with proper URLs based on current path
 * @returns Array of navigation items with path-aware URLs
 */
export function useNavigation(): NavItem[] {

  const navItems: NavItem[] = [
    {
      href: "/projects",
      label: "Projects",
    },
    {
      href: "/contact",
      label: "Contact",
    },
  ];

  return navItems;
}