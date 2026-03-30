"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => (
    <div className="space-y-2">
      {label && (
        <label htmlFor={id} className="block text-[11px] tracking-[0.1rem] uppercase text-[#897367] font-medium">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={id}
        className={cn(
          "w-full border-b border-[#897367] bg-transparent px-0 py-3 text-sm text-[#1d1c17] placeholder-[#897367] transition-colors focus:border-[#9a4601] focus:outline-none resize-none",
          error && "border-[#ba1a1a]",
          className
        )}
        {...props}
      />
      {error && <p className="text-[10px] text-[#ba1a1a]">{error}</p>}
    </div>
  )
);

Textarea.displayName = "Textarea";
export default Textarea;
