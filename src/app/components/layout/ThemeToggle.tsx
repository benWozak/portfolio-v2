"use client";

import { useTheme } from "../../contexts/ThemeContext";
import { Sun, Moon, Laptop } from "lucide-react";
import { Dropdown } from "../ui";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const options = [
    { value: "light", label: "Light", icon: <Sun size={16} /> },
    { value: "dark", label: "Dark", icon: <Moon size={16} /> },
    { value: "system", label: "System", icon: <Laptop size={16} /> },
  ];

  return (
    <Dropdown
      options={options}
      value={theme}
      onChange={(value) => setTheme(value as "light" | "dark" | "system")}
    />
  );
}
