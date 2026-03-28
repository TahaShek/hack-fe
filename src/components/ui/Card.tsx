import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className, hover }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#111111] p-6",
        hover && "transition-all duration-300 hover:border-accent/20 cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}
