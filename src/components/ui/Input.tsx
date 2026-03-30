"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, id, ...props }, ref) => (
    <div className="space-y-2">
      {label && (
        <label htmlFor={id} className="block text-[11px] tracking-[0.1rem] uppercase text-[#897367] font-medium">
          {label}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 text-[#897367] group-focus-within:text-[#9a4601] transition-colors">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "w-full border-b border-[#897367] bg-transparent px-0 py-3 text-sm text-[#1d1c17] placeholder-[#897367] transition-colors focus:border-[#9a4601] focus:outline-none",
            icon ? "pl-8" : "",
            error ? "border-[#ba1a1a]" : "",
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-[10px] text-[#ba1a1a]">{error}</p>}
    </div>
  )
);

Input.displayName = "Input";
export default Input;
