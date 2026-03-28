"use client";

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
} from "lucide-react";

const adminLinks: SidebarLink[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Products", href: "/admin/products", icon: Package, badge: "5" },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Transactions", href: "/admin/transactions", icon: CreditCard },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar
        links={adminLinks}
        title="Admin Panel"
        titleIcon={
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
            <Shield size={16} className="text-white" />
          </div>
        }
      />
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-stone-800/40 bg-[#0C0A09]/80 backdrop-blur-xl flex items-center justify-between px-6">
          <div className="lg:hidden">
            <Link
              href="/admin/dashboard"
              className="text-lg font-semibold text-stone-100 font-[family-name:var(--font-bodoni)]"
            >
              Admin
            </Link>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-stone-500 hover:text-gold transition-colors duration-300"
            >
              View Site
            </Link>
            <div className="h-8 w-8 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
              <span className="text-sm font-medium text-red-400">A</span>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
