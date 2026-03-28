"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface SidebarLink {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

interface SidebarProps {
  links: SidebarLink[];
  title: string;
  titleIcon?: React.ReactNode;
}

export default function Sidebar({ links, title, titleIcon }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 border-r border-stone-800/40 bg-[#0C0A09] min-h-[calc(100vh-4rem)] hidden lg:block">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-10">
          {titleIcon}
          <h2 className="text-lg font-semibold text-stone-100 font-[family-name:var(--font-bodoni)] tracking-wide">
            {title}
          </h2>
        </div>
        <nav className="space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
                  isActive
                    ? "glass-gold text-gold glow-gold-sm"
                    : "text-stone-500 hover:text-stone-200 hover:bg-stone-800/30"
                )}
              >
                <Icon size={18} strokeWidth={1.5} />
                <span className="flex-1">{link.label}</span>
                {link.badge && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-gold/10 text-gold border border-gold/20">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
