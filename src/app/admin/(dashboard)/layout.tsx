"use client";

import { useState } from "react";
import Link from "next/link";
import Sidebar, { type SidebarLink } from "@/components/layout/Sidebar";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  CreditCard,
  BarChart3,
  Shield,
  Menu,
} from "lucide-react";
import NotificationPanel from "@/components/ui/NotificationPanel";

const adminLinks: SidebarLink[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Products", href: "/admin/products", icon: Package, badge: "5" },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Transactions", href: "/admin/transactions", icon: CreditCard },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#0D0D0D]">
      <Sidebar
        links={adminLinks}
        title="Admin Panel"
        titleIcon={
          <div className="h-9 w-9 rounded-sm bg-[#2563EB] flex items-center justify-center">
            <Shield size={16} className="text-white" />
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
              href="/admin/dashboard"
              className="text-lg font-medium text-white tracking-widest uppercase"
            >
              Admin
            </Link>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs font-medium tracking-widest text-zinc-400">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                SYSTEMS OPERATIONAL
              </span>
            </div>
            <NotificationPanel variant="dark" />
            <Link
              href="/"
              className="text-[11px] font-medium uppercase tracking-widest text-zinc-500 hover:text-[#2563EB] transition-colors duration-300 hidden sm:block"
            >
              View Site
            </Link>
            <div className="h-8 w-8 rounded-sm bg-zinc-900 flex items-center justify-center border border-zinc-800">
              <span className="text-sm font-medium text-[#2563EB]">A</span>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
