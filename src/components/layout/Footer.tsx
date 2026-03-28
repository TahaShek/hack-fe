"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

const footerLinks = {
  Shop: [
    { label: "All Products", href: "/products" },
    { label: "Categories", href: "/products?view=categories" },
    { label: "Deals", href: "/products?sort=deals" },
    { label: "New Arrivals", href: "/products?sort=newest" },
  ],
  Sell: [
    { label: "Start Selling", href: "/seller/register" },
    { label: "Seller Dashboard", href: "/seller/dashboard" },
    { label: "Seller Guide", href: "#" },
  ],
  Support: [
    { label: "Help Center", href: "#" },
    { label: "Contact Us", href: "#" },
    { label: "Returns", href: "#" },
    { label: "Shipping", href: "#" },
  ],
  Legal: [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Cookies", href: "#" },
  ],
};

export default function Footer() {
  const [email, setEmail] = useState("");

  return (
    <footer className="border-t border-[rgba(255,255,255,0.06)]">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Newsletter */}
        <div className="py-20 border-b border-[rgba(255,255,255,0.06)]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-12 items-end"
          >
            <h2 className="text-4xl md:text-6xl font-light text-[#F5F5F5] tracking-tight leading-[1.1]">
              Stay in<br />the Loop.
            </h2>
            <div>
              <div className="flex items-center border-b border-[rgba(255,255,255,0.12)]">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 bg-transparent text-sm text-[#F5F5F5] placeholder-[#6B7280] py-4 focus:outline-none"
                />
                <button className="p-3 text-accent hover:text-white transition-colors cursor-pointer">
                  <ArrowRight size={18} />
                </button>
              </div>
              <p className="text-xs text-[#6B7280] mt-3">
                No spam. Unsubscribe anytime.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Links — 4 columns */}
        <div className="py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-xs text-[#6B7280] tracking-[0.2em] uppercase font-medium mb-5">
                {title}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#6B7280] hover:text-[#F5F5F5] transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-[rgba(255,255,255,0.06)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-lg font-light text-[rgba(255,255,255,0.1)] tracking-[0.1em]">
            {APP_NAME}
          </span>
          <p className="text-xs text-[#6B7280]">
            &copy; 2026 {APP_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
