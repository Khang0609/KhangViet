import React from "react";

type ButtonVariant =
  "primary" | "primaryP" | "secondary" | "secondaryP";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[#F58633] text-white hover:bg-[#ff9547] active:bg-[#e07525] border-transparent rounded-lg transition-all duration-200",
  secondary:
    "bg-white/10 text-white hover:bg-white/15 active:bg-white/20 border-transparent rounded-lg transition-all duration-200",
  primaryP:
    "bg-[#F58633] text-white hover:bg-[#ff9547] active:bg-[#e07525] border-transparent rounded-full transition-all duration-200",
  secondaryP:
    "bg-white/10 text-white hover:bg-white/15 active:bg-white/20 border-transparent rounded-full transition-all duration-200",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4.5 py-2 text-sm",
  lg: "px-6 py-2.5 text-base",
};

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  children,
  className = "",
  type = "button",
  disabled = false,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-sans font-medium border transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#F58633] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

  const combinedStyles =
    `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`.trim();

  return (
    <button
      type={type}
      disabled={disabled}
      className={combinedStyles}
      {...props}
    >
      {children}
    </button>
  );
};
