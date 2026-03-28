"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const wordVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.3 + i * 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

export default function HeroSection() {
  return (
    <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Ambient gradient orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] rounded-full bg-accent/[0.06] blur-[200px] orb" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-red-900/[0.04] blur-[180px] orb-delay" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6">
        <h1 className="font-light text-7xl md:text-[10rem] leading-[0.9] tracking-tight text-[#F5F5F5]">
          {["Everything.", "One Market."].map((line, i) => (
            <motion.span
              key={line}
              custom={i}
              variants={wordVariants}
              initial="hidden"
              animate="visible"
              className="block"
            >
              {line}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mt-8 text-[#6B7280] text-lg max-w-md mx-auto"
        >
          A curated marketplace connecting you with trusted sellers worldwide.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.6 }}
          className="mt-10 flex items-center justify-center gap-4"
        >
          <Link
            href="/products"
            className="rounded-full bg-accent text-white px-8 py-3.5 text-sm font-medium hover:shadow-[0_0_30px_rgba(232,120,74,0.3)] transition-all duration-300 cursor-pointer"
          >
            Shop Now
          </Link>
          <Link
            href="/products?view=categories"
            className="rounded-full border border-[rgba(255,255,255,0.12)] text-[#9CA3AF] px-8 py-3.5 text-sm hover:border-accent/40 hover:text-accent transition-all duration-300 cursor-pointer"
          >
            Explore
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.6 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <ChevronDown size={20} className="text-[#6B7280]" />
        </motion.div>
      </motion.div>
    </section>
  );
}
