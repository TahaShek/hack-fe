"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { AnimatePresence, motion } from "framer-motion";
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
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ links, title, titleIcon, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const isAdmin = pathname.startsWith("/admin");

  const handleSignOut = () => {
    logout();
    router.push(isAdmin ? "/admin/login" : "/seller/login");
  };

  const sidebarContent = (
    <>
      <div className="mb-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {titleIcon}
            <div>
              <h1 className="text-lg font-medium text-white tracking-widest uppercase">
                {title}
              </h1>
              <p className="text-zinc-500 text-[10px] tracking-[0.2em] mt-1 uppercase">
                {isAdmin ? "Administrator" : "Verified Merchant"}
              </p>
            </div>
          </div>
          {/* Close button — mobile only */}
          {onMobileClose && (
            <button
              onClick={onMobileClose}
              className="lg:hidden p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>
      <nav className="flex-1 space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          const activeColor = isAdmin ? "text-[#2563EB]" : "text-[#e07b39]";
          const badgeBg = isAdmin ? "bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/20" : "bg-[#e07b39]/10 text-[#e07b39] border-[#e07b39]/20";
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onMobileClose}
              data-testid={`nav-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-sm text-sm tracking-wide transition-all duration-200",
                isActive
                  ? `${activeColor} bg-zinc-900`
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              )}
            >
              <Icon size={18} strokeWidth={1.5} />
              <span className="flex-1">{link.label}</span>
              {link.badge && (
                <span className={cn("px-2 py-0.5 rounded-sm text-[10px] font-medium border", badgeBg)}>
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto pt-6 border-t border-zinc-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-sm bg-zinc-800 flex items-center justify-center overflow-hidden">
            <span className="text-xs font-medium text-zinc-300">{isAdmin ? "A" : "T"}</span>
          </div>
          <div>
            <p className="text-xs font-medium text-white">{isAdmin ? "Admin Panel" : "Seller Studio"}</p>
            <p className="text-[10px] text-zinc-500">{isAdmin ? "Admin Access" : "Curator Tier"}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          data-testid="sign-out"
          className="flex items-center gap-3 w-full px-4 py-3 rounded-sm text-sm tracking-wide text-zinc-500 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 cursor-pointer"
        >
          <LogOut size={18} strokeWidth={1.5} />
          <span>Sign Out</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="w-64 shrink-0 border-r border-zinc-800 bg-[#0D0D0D] min-h-screen hidden lg:flex flex-col p-6" data-testid={isAdmin ? "admin-sidebar" : "seller-sidebar"}>
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={onMobileClose}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed inset-y-0 left-0 z-50 w-[280px] bg-[#0D0D0D] border-r border-zinc-800 flex flex-col p-6 lg:hidden overflow-y-auto"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
