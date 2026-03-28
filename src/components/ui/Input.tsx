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
        <label htmlFor={id} className="block text-[10px] tracking-[0.15em] uppercase text-[#6B7280] font-medium">
          {label}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 text-[#6B7280] group-focus-within:text-accent transition-colors">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "w-full border-b border-[rgba(255,255,255,0.12)] bg-transparent px-0 py-3 text-sm text-[#F5F5F5] placeholder-[#6B7280] transition-colors focus:border-accent focus:outline-none",
            icon ? "pl-8" : "",
            error ? "border-red-400" : "",
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-[10px] text-red-400">{error}</p>}
    </div>
  )
);

Input.displayName = "Input";
export default Input;
