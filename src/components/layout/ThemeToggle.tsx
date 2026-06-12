"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Laptop } from "lucide-react";
import { Dropdown } from "../ui";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const options = [
    { value: "light", label: "Light", icon: <Sun size={16} /> },
    { value: "dark", label: "Dark", icon: <Moon size={16} /> },
    { value: "system", label: "System", icon: <Laptop size={16} /> },
  ];

  // next-themes returns undefined until mounted; "system" matches the server
  // render so hydration stays consistent.
  return (
    <Dropdown
      options={options}
      value={theme ?? "system"}
      onChange={(value) => setTheme(value)}
    />
  );
}
