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
        <label htmlFor={id} className="block text-[11px] tracking-[0.1rem] uppercase text-[#897367] font-medium">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={id}
          className={cn(
            "w-full appearance-none border-b border-[#897367] bg-transparent px-0 py-3 pr-8 text-sm text-[#1d1c17] transition-colors focus:border-[#9a4601] focus:outline-none cursor-pointer",
            error && "border-[#ba1a1a]",
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white text-[#1d1c17]">
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 text-[#897367] pointer-events-none" />
      </div>
      {error && <p className="text-[10px] text-[#ba1a1a]">{error}</p>}
    </div>
  )
);

Select.displayName = "Select";
export default Select;
