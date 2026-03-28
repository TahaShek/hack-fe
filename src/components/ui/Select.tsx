"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { label: string; value: string }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, id, ...props }, ref) => (
    <div className="space-y-2">
      {label && (
        <label htmlFor={id} className="block text-[10px] tracking-[0.15em] uppercase text-[#6B7280] font-medium">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={id}
          className={cn(
            "w-full appearance-none border-b border-[rgba(255,255,255,0.12)] bg-transparent px-0 py-3 pr-8 text-sm text-[#F5F5F5] transition-colors focus:border-accent focus:outline-none cursor-pointer",
            error && "border-red-400",
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#111111] text-[#F5F5F5]">
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" />
      </div>
      {error && <p className="text-[10px] text-red-400">{error}</p>}
    </div>
  )
);

Select.displayName = "Select";
export default Select;
