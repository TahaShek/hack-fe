"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Search, ShoppingCart, Heart, User, Menu, X } from "lucide-react";
import { APP_NAME, NAV_LINKS } from "@/lib/constants";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const cartItems = useCartStore((s) => s.items);
  const wishlistItems = useWishlistStore((s) => s.items);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => setScrolled(latest > 30));

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#080808]/80 backdrop-blur-xl border-b border-[rgba(255,255,255,0.06)]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="flex h-16 items-center justify-between">
          {/* Wordmark */}
          <Link href="/" className="shrink-0 cursor-pointer">
            <span className="text-lg font-light text-[#F5F5F5] tracking-[0.1em]">
              {APP_NAME}
            </span>
          </Link>

          {/* Center nav */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-[#6B7280] hover:text-[#F5F5F5] tracking-wide transition-colors duration-300"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-1">
            {[
              { href: "/products", icon: Search, badge: 0 },
              { href: "/wishlist", icon: Heart, badge: wishlistItems.length },
              { href: "/cart", icon: ShoppingCart, badge: cartItems.length },
            ].map(({ href, icon: Icon, badge }) => (
              <Link
                key={href}
                href={href}
                className="relative p-2.5 text-[#6B7280] hover:text-[#F5F5F5] transition-colors cursor-pointer"
              >
                <Icon size={18} strokeWidth={1.5} />
                {badge > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-accent text-[10px] font-medium text-white flex items-center justify-center">
                    {badge}
                  </span>
                )}
              </Link>
            ))}

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="p-2.5 text-[#6B7280] hover:text-[#F5F5F5] transition-colors cursor-pointer"
              >
                <User size={18} strokeWidth={1.5} />
              </button>
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-48 rounded-xl bg-[#111111] border border-[rgba(255,255,255,0.06)] py-2 shadow-xl"
                  >
                    {[
                      { label: "Dashboard", href: "/dashboard" },
                      { label: "Seller Portal", href: "/seller/dashboard" },
                      { label: "Admin", href: "/admin/dashboard" },
                    ].map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => setProfileOpen(false)}
                        className="block px-4 py-2.5 text-sm text-[#6B7280] hover:text-[#F5F5F5] hover:bg-[rgba(255,255,255,0.03)] transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                    <hr className="my-1 border-[rgba(255,255,255,0.06)]" />
                    <button className="block w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-[rgba(255,255,255,0.03)] cursor-pointer">
                      Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2.5 text-[#6B7280] hover:text-[#F5F5F5] transition-colors cursor-pointer"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden border-t border-[rgba(255,255,255,0.06)]"
            >
              <div className="py-4 space-y-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block py-3 text-sm text-[#6B7280] hover:text-[#F5F5F5] tracking-wide"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
