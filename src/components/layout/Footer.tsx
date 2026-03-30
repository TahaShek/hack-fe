"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

const footerLinks = {
  Brand: [
    { label: "About", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Sustainability", href: "#" },
    { label: "Privacy", href: "#" },
  ],
  Service: [
    { label: "Support", href: "#" },
    { label: "Shipping", href: "#" },
    { label: "Returns", href: "#" },
    { label: "Contact", href: "#" },
  ],
  Shop: [
    { label: "All Products", href: "/products" },
    { label: "Categories", href: "/products?view=categories" },
    { label: "New Arrivals", href: "/products?sort=newest" },
    { label: "Deals", href: "/products?sort=deals" },
  ],
};

export default function Footer() {
  const [email, setEmail] = useState("");

  return (
    <footer className="bg-[#0D0D0D] text-zinc-400 font-light">
      <div className="w-full py-16 px-8 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand column */}
        <div className="col-span-1">
          <span className="text-4xl font-light tracking-tighter text-white mb-8 block">
            {APP_NAME}
          </span>
          <p className="text-sm text-zinc-500 leading-relaxed max-w-xs">
            Engineered for curation. We bridge the gap between industrial design and everyday utility.
          </p>
        </div>

        {/* Link columns */}
        {Object.entries(footerLinks).map(([title, links]) => (
          <div key={title}>
            <h4 className="text-white text-[11px] font-medium uppercase tracking-[0.1rem] mb-8">
              {title}
            </h4>
            <ul className="space-y-4">
              {links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-zinc-400 hover:text-[#e07b39] transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Newsletter section */}
      <div className="px-8 md:px-12 pb-12">
        <h4 className="text-white text-[11px] font-medium uppercase tracking-[0.1rem] mb-4">Newsletter</h4>
        <p className="text-sm text-zinc-500 mb-6">Join the registry for limited edition alerts.</p>
        <div className="flex border-b border-zinc-800 pb-2 max-w-sm">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="EMAIL ADDRESS"
            className="bg-transparent border-none focus:ring-0 focus:outline-none text-sm w-full p-0 text-white placeholder:text-zinc-700"
          />
          <button className="text-white hover:text-[#e07b39] transition-colors cursor-pointer">
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="px-8 md:px-12 py-8 border-t border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-3">
        <span className="text-[10px] uppercase tracking-widest text-zinc-600">
          &copy; 2026 {APP_NAME}. Engineered for curation.
        </span>
        <div className="flex gap-8">
          <a href="#" className="text-[10px] uppercase tracking-widest text-zinc-600 hover:text-white transition-colors">Instagram</a>
          <a href="#" className="text-[10px] uppercase tracking-widest text-zinc-600 hover:text-white transition-colors">LinkedIn</a>
          <a href="#" className="text-[10px] uppercase tracking-widest text-zinc-600 hover:text-white transition-colors">Twitter</a>
        </div>
      </div>
    </footer>
  );
}
