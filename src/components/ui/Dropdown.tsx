"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface DropdownProps {
  options: { value: string; label: string; icon: React.ReactNode }[];
  value: string;
  onChange: (value: string) => void;
}

export function Dropdown({ options, value, onChange }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectedOption = options.find((option) => option.value === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-foreground bg-secondary-bg rounded-md hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="flex items-center">
          {selectedOption?.icon}
          {/* <span className="ml-2">{selectedOption?.label}</span> */}
        </span>
        <ChevronDown className="w-5 h-5 ml-2" />
      </button>
      {isOpen && (
        <ul
          className="absolute z-10 w-full min-w-28 py-1 mt-1 overflow-auto text-base bg-secondary-bg rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
          role="listbox"
        >
          {options.map((option) => (
            <li
              key={option.value}
              className={`${
                option.value === value
                  ? "text-primary bg-primary/10"
                  : "text-foreground"
              } cursor-default select-none relative py-2 pl-3 hover:bg-primary/10`}
              role="option"
              aria-selected={option.value === value}
              onClick={() => handleSelect(option.value)}
            >
              <div className="flex items-center">
                {option.icon}
                <span className="ml-2 block truncate">{option.label}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
