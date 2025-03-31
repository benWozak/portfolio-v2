import React from "react";
import Link from "next/link";

interface ButtonProps {
  icon?: React.ReactElement;
  label: string;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  disabledReason?: string;
  variant?: "primary" | "secondary";
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  icon,
  label,
  onClick,
  href,
  disabled = false,
  disabledReason,
  variant = "primary",
  className,
}) => {
  const baseClasses = `px-4 py-2 rounded shadow flex items-center justify-center gap-2 text-sm transition-colors`;

  const variantClasses = {
    primary: disabled
      ? "bg-primary text-primary-foreground cursor-not-allowed opacity-50"
      : "bg-primary hover:bg-primary/80 text-primary-foreground",
    secondary: disabled
      ? "bg-secondary-bg text-foreground cursor-not-allowed opacity-50"
      : "bg-secondary-bg hover:bg-primary/80 hover:dark:bg-secondary-bg/80 border-neutral-800 text-foreground",
  };

  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;

  if (href && !disabled) {
    return (
      <Link href={href} className={buttonClasses} aria-label={label}>
        {icon} {label}
      </Link>
    );
  }

  return (
    <button
      onClick={onClick}
      className={buttonClasses}
      disabled={disabled}
      type="button"
      aria-label={disabledReason || label}
    >
      {icon} {label}
    </button>
  );
};

export default Button;
