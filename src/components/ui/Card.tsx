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
        "rounded-sm border border-[#dcc1b4]/15 bg-[#f8f3eb] p-6",
        hover && "transition-all duration-300 hover:bg-[#ece8e0] cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}
