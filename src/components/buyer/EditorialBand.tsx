"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function EditorialBand() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const textY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section ref={ref} className="relative h-screen overflow-hidden">
      {/* Parallax background image */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 -top-24 -bottom-24">
        <img
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400&q=80"
          alt="Editorial"
          className="h-full w-full object-cover"
        />
      </motion.div>
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Text with parallax */}
      <div className="relative z-10 h-full flex flex-col justify-end px-6 lg:px-16 pb-20 max-w-[1400px] mx-auto">
        <motion.div style={{ y: textY }}>
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-7xl font-light text-[#F5F5F5] tracking-tight leading-[1.1]"
          >
            <span className="block text-[#9CA3AF]">Where quality</span>
            <span className="block text-white">meets everyday.</span>
          </motion.h2>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-8"
          >
            <Link
              href="/products"
              className="inline-block rounded-full bg-accent text-white px-8 py-3.5 text-sm font-medium hover:shadow-[0_0_30px_rgba(232,120,74,0.3)] transition-all duration-300 cursor-pointer"
            >
              Shop Collection
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
