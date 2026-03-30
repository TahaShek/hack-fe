"use client";

import { useState } from "react";
import Link from "next/link";
import Sidebar, { type SidebarLink } from "@/components/layout/Sidebar";
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingCart,
  Tag,
  BarChart3,
  MessageCircle,
  Store,
  Settings,
  Menu,
} from "lucide-react";
import NotificationPanel from "@/components/ui/NotificationPanel";

const sellerLinks: SidebarLink[] = [
  { label: "Dashboard", href: "/seller/dashboard", icon: LayoutDashboard },
  { label: "Products", href: "/seller/products", icon: Package },
  { label: "Inventory", href: "/seller/inventory", icon: Boxes },
  { label: "Orders", href: "/seller/orders", icon: ShoppingCart, badge: "3" },
  { label: "Promotions", href: "/seller/promotions", icon: Tag },
  { label: "Analytics", href: "/seller/analytics", icon: BarChart3 },
  { label: "Chat", href: "/seller/chat", icon: MessageCircle, badge: "1" },
  { label: "Settings", href: "/seller/settings", icon: Settings },
];

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#0D0D0D]">
      <Sidebar
        links={sellerLinks}
        title="MARKIT"
        titleIcon={
          <div className="h-9 w-9 rounded-sm bg-gradient-to-br from-[#9a4601] to-[#e07b39] flex items-center justify-center">
            <Store size={16} className="text-white" />
          </div>
        }
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-zinc-800 bg-[#0D0D0D]/80 backdrop-blur-xl flex items-center justify-between px-6">
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <Menu size={20} />
            </button>
            <Link
              href="/seller/dashboard"
              className="text-lg font-medium text-white tracking-widest uppercase"
            >
              MARKIT
            </Link>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <NotificationPanel variant="dark" />
            <Link
              href="/"
              className="text-[11px] font-medium uppercase tracking-[0.1rem] text-zinc-500 hover:text-[#e07b39] transition-colors duration-300 hidden sm:block"
            >
              View Store
            </Link>
            <div className="h-8 w-8 rounded-sm bg-zinc-800 flex items-center justify-center border border-zinc-700/40">
              <span className="text-sm font-medium text-zinc-300">T</span>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-8 lg:p-12 overflow-y-auto bg-[#0D0D0D]">{children}</main>
      </div>
    </div>
  );
}
