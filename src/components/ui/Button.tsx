"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-br from-[#9a4601] to-[#e07b39] text-white font-medium hover:opacity-90 active:scale-[0.97]",
  secondary:
    "bg-[#e7e2da] text-[#1d1c17] hover:bg-[#ece8e0]",
  outline:
    "border border-[#dcc1b4]/30 text-[#1d1c17] hover:border-[#9a4601]/40 hover:text-[#9a4601]",
  ghost:
    "text-[#9a4601] underline underline-offset-4 hover:text-[#e07b39]",
  danger:
    "bg-[#ba1a1a] text-white hover:bg-[#93000a] active:bg-[#93000a]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-8 py-3.5 text-sm tracking-wide",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "rounded-sm font-medium uppercase tracking-wide transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9a4601]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fef9f1] disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin h-4 w-4 mr-2 inline-block" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
);

Button.displayName = "Button";
export default Button;
