"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Search, ShoppingCart, Heart, User, Menu, X } from "lucide-react";
import { APP_NAME, NAV_LINKS } from "@/lib/constants";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import { useAuthStore } from "@/stores/auth-store";
import NotificationPanel from "@/components/ui/NotificationPanel";
import SearchBar from "@/components/ai/SearchBar";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const cartItems = useCartStore((s) => s.items);
  const wishlistItems = useWishlistStore((s) => s.items);
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const { scrollY } = useScroll();
  const pathname = usePathname();

  useMotionValueEvent(scrollY, "change", (latest) => setScrolled(latest > 30));

  const isActiveLink = (href: string) => {
    if (href === "/products") return pathname === "/products";
    return pathname.startsWith(href);
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
      className="fixed top-0 left-0 right-0 z-50 bg-[#fef9f1]/80 backdrop-blur-md border-b border-[#dcc1b4]/15"
    >
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="flex h-16 items-center justify-between">
          {/* Wordmark + Nav */}
          <div className="flex items-center gap-12">
            <Link href="/" className="shrink-0 cursor-pointer">
              <span className="text-xl font-medium tracking-[0.1rem] uppercase text-[#0D0D0D]">
                {APP_NAME}
              </span>
            </Link>

            {/* Center nav */}
            <div className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-light tracking-tight transition-colors duration-200 ${
                    isActiveLink(link.href)
                      ? "text-[#9a4601] border-b border-[#9a4601] pb-1"
                      : "text-[#0D0D0D] hover:text-[#9a4601]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-1">
            {/* Search toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="relative p-2.5 text-[#0D0D0D] hover:text-[#9a4601] transition-colors cursor-pointer"
            >
              {searchOpen ? <X size={18} strokeWidth={1.5} /> : <Search size={18} strokeWidth={1.5} />}
            </button>

            {[
              { href: "/wishlist", icon: Heart, badge: wishlistItems.length },
              { href: "/cart", icon: ShoppingCart, badge: cartItems.length },
            ].map(({ href, icon: Icon, badge }) => (
              <Link
                key={href}
                href={href}
                data-testid={href === "/cart" ? "cart-icon" : "wishlist-icon"}
                className="relative p-2.5 text-[#0D0D0D] hover:text-[#9a4601] transition-colors cursor-pointer"
              >
                <Icon size={18} strokeWidth={1.5} />
                {badge > 0 && (
                  <span data-testid={href === "/cart" ? "cart-count" : "wishlist-count"} className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-[#9a4601] text-[10px] font-medium text-white flex items-center justify-center">
                    {badge}
                  </span>
                )}
              </Link>
            ))}

            <NotificationPanel variant="light" />

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                data-testid="user-menu"
                className="p-2.5 text-[#0D0D0D] hover:text-[#9a4601] transition-colors cursor-pointer"
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
                    className="absolute right-0 mt-2 w-48 rounded-sm bg-white border border-[#dcc1b4]/20 py-2 shadow-[0_20px_40px_rgba(29,28,23,0.06)]"
                  >
                    {isAuthenticated ? (
                      <>
                        {user?.name && (
                          <div className="px-4 py-2.5 text-xs text-[#897367] border-b border-[#dcc1b4]/15 mb-1">
                            {user.name}
                          </div>
                        )}
                        <Link
                          href="/dashboard"
                          onClick={() => setProfileOpen(false)}
                          className="block px-4 py-2.5 text-sm text-[#554339] hover:text-[#1d1c17] hover:bg-[#f8f3eb] transition-colors"
                        >
                          My Orders
                        </Link>
                        <Link
                          href="/wishlist"
                          onClick={() => setProfileOpen(false)}
                          className="block px-4 py-2.5 text-sm text-[#554339] hover:text-[#1d1c17] hover:bg-[#f8f3eb] transition-colors"
                        >
                          Wishlist
                        </Link>
                        <Link
                          href="/chat"
                          onClick={() => setProfileOpen(false)}
                          className="block px-4 py-2.5 text-sm text-[#554339] hover:text-[#1d1c17] hover:bg-[#f8f3eb] transition-colors"
                        >
                          Messages
                        </Link>
                        <hr className="my-1 border-[#dcc1b4]/15" />
                        <button
                          onClick={() => { logout(); setProfileOpen(false); }}
                          data-testid="logout-button"
                          className="block w-full text-left px-4 py-2.5 text-sm text-[#ba1a1a] hover:bg-[#f8f3eb] cursor-pointer"
                        >
                          Sign out
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/login"
                          onClick={() => setProfileOpen(false)}
                          className="block px-4 py-2.5 text-sm text-[#554339] hover:text-[#1d1c17] hover:bg-[#f8f3eb] transition-colors"
                        >
                          Sign in
                        </Link>
                        <Link
                          href="/register"
                          onClick={() => setProfileOpen(false)}
                          className="block px-4 py-2.5 text-sm text-[#554339] hover:text-[#1d1c17] hover:bg-[#f8f3eb] transition-colors"
                        >
                          Create account
                        </Link>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2.5 text-[#0D0D0D] hover:text-[#9a4601] transition-colors cursor-pointer"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Expandable Search Bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-visible border-t border-[#dcc1b4]/15 py-3"
            >
              <div className="max-w-xl mx-auto">
                <SearchBar />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden border-t border-[#dcc1b4]/15"
            >
              <div className="py-4 space-y-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block py-3 font-light tracking-tight ${
                      isActiveLink(link.href)
                        ? "text-[#9a4601]"
                        : "text-[#0D0D0D] hover:text-[#9a4601]"
                    }`}
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
