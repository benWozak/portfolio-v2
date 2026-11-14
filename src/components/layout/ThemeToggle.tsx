"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Laptop } from "lucide-react";
import { Dropdown } from "../ui";
import { useHydrated } from "@/utils/hooks/useHydrated";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const hydrated = useHydrated();

  const options = [
    { value: "light", label: "Light", icon: <Sun size={16} /> },
    { value: "dark", label: "Dark", icon: <Moon size={16} /> },
    { value: "system", label: "System", icon: <Laptop size={16} /> },
  ];

  // The server has no theme, but next-themes reads the stored preference from
  // localStorage in its first client render. Show "system" until hydration is
  // done so that render matches the server HTML.
  return (
    <Dropdown
      options={options}
      value={hydrated && theme ? theme : "system"}
      onChange={(value) => setTheme(value)}
    />
  );
}
