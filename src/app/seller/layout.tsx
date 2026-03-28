"use client";

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
} from "lucide-react";

const sellerLinks: SidebarLink[] = [
  { label: "Dashboard", href: "/seller/dashboard", icon: LayoutDashboard },
  { label: "Products", href: "/seller/products", icon: Package },
  { label: "Inventory", href: "/seller/inventory", icon: Boxes },
  { label: "Orders", href: "/seller/orders", icon: ShoppingCart, badge: "3" },
  { label: "Promotions", href: "/seller/promotions", icon: Tag },
  { label: "Analytics", href: "/seller/analytics", icon: BarChart3 },
  { label: "Chat", href: "/seller/chat", icon: MessageCircle, badge: "1" },
];

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar
        links={sellerLinks}
        title="Seller Portal"
        titleIcon={
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center">
            <Store size={16} className="text-stone-950" />
          </div>
        }
      />
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-stone-800/40 bg-[#0C0A09]/80 backdrop-blur-xl flex items-center justify-between px-6">
          <div className="lg:hidden">
            <Link
              href="/seller/dashboard"
              className="text-lg font-semibold text-stone-100 font-[family-name:var(--font-bodoni)]"
            >
              Seller Portal
            </Link>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-stone-500 hover:text-gold transition-colors duration-300"
            >
              View Store
            </Link>
            <div className="h-8 w-8 rounded-xl bg-stone-800/60 flex items-center justify-center border border-stone-700/40">
              <span className="text-sm font-medium text-stone-300">T</span>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
