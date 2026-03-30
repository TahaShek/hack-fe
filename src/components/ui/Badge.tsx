import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "accent";
}

const variantStyles = {
  default: "bg-[#e7e2da] text-[#897367]",
  success: "bg-emerald-500/10 text-emerald-700",
  warning: "bg-amber-500/10 text-amber-700",
  danger: "bg-[#ba1a1a]/10 text-[#ba1a1a]",
  info: "bg-blue-500/10 text-blue-700",
  accent: "bg-[#9a4601]/10 text-[#9a4601]",
};

export default function Badge({ children, className, variant = "default" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.1rem]",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
