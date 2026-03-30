"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import SearchBar from "@/components/ai/SearchBar";

const wordVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.3 + i * 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const heroImages = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCOC5qQpCYAqBl9JNkiK7CeHB5GwK49qCW3tPpPq9e6FoMHyBa-y-_fyldP1_NUKaTIw__Av0dlXzDDsm_F0jL1bZvqZ2MLtP9WWXwrAhWo2ZqR8gO3IoXYaa_go74H72jNdSVZ4LlwHoe21xIhJFrKLKFoyZbu0tm9YI3XWubf0h8TArQBtKjq-3jFNkBvwcj2i5Lqv917HHrMgqwgR_vAGLXhMep8TZlXGpGbxvson2wWHbNbikk7rwz_1WvmYcfskBVbnN5_Pkg",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA5o6rc16uuzZCTXDPUGk3nj570w-U1a0rQafOFCTSMYC4FxblSkwWPF8O-0V9uF4KELcRmUGWxmVn_Ga9AYbM2oGNxWnzJYWpcY_WR91XTzr77I5a0tnbMniLSAe4qWn9-xbffuEOPArzqs3_eNA1852y9oyQdrUJePUcurwPP8hyxQS-22F4KwRnfGXARy45BgjTj0Mvg4znzaw28Eow636t2VWbDj9GhldxBLhfIjnMdzaCDWtUbr2dOM8FmVYAKWTT4wK9sZ2w",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBIX2uWL3E46ZjxZf2OUa9aQx9ZxlnEB2qjJscVxXSR7At4xMJXkDyGxcr6a-0FOww3-NWfeq2iBDgfqra2xPGwkK6sSbRH8wO0PLX2exu4lrM6JeIbGGFbTQUjYNYkpRjs4jGBIcI-u3SxBBa2oKELn__kb8HMd-P9QtpWeeV4CbRhPgoxoGv4yNXKnN0sJCfKVtPLkIqgfdVeeFSsjXeH3NdBL-qb7tvPbRgx5BV0McpMBL8h-345J70v5LYZ4QmUlaMLRpvcQb4",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDg1WNbNQMGa8_DJx8HPruFY-ZYaZX_fLiQRn3R2wR9NF9xaeT-iGsiJaMSVIdSjo7gdCdQfYFV7X2RD27h_x9_y9yeKQOjHHn2NdNNdz43-tMNi6Y0g0IfE2cbjsHueg_X60JOkfrgd14mxWsiA45SJ4xC7cbszyuAj5p7HWUlUPJPKQ3weF3vSvUYKAH9KEbvIo6ra9kUbeqG6zRhZZwgSzWsFTw6PlyogLbKGbkZ-iaHGo8kRaZmIZLNKtLJMsCkcxJXeb4ENos",
];

export default function HeroSection() {
  return (
    <section className="min-h-screen flex flex-col md:flex-row items-center px-8 md:px-16 py-12 gap-12 overflow-hidden bg-[#fef9f1]">
      {/* Left: Text content */}
      <div className="w-full md:w-1/2 flex flex-col items-start gap-8 z-10">
        <h1 className="text-[5rem] md:text-[8rem] leading-[0.9] font-light tracking-tighter text-[#1d1c17]">
          {["Every", "Thing", "You", "Need."].map((word, i) => (
            <motion.span
              key={word}
              custom={i}
              variants={wordVariants}
              initial="hidden"
              animate="visible"
              className="block"
            >
              {word}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="max-w-md text-lg font-light text-[#554339] leading-relaxed"
        >
          A curated selection of industrial essentials, engineered for the modern workspace. Designed by intent, defined by function.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="w-full max-w-md"
        >
          <SearchBar />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.6 }}
        >
          <Link
            href="/products"
            className="inline-block px-10 py-4 bg-gradient-to-br from-[#9a4601] to-[#e07b39] text-white text-sm font-medium uppercase tracking-[0.15rem] hover:opacity-90 transition-all rounded-sm cursor-pointer"
          >
            Explore Edition 01
          </Link>
        </motion.div>
      </div>

      {/* Right: Image grid */}
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="w-full md:w-1/2 grid grid-cols-2 gap-4 h-[500px] md:h-[716px]"
      >
        <div className="relative overflow-hidden rounded-sm">
          <img
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            src={heroImages[0]}
            alt="Minimalist ceramic vase"
          />
        </div>
        <div className="relative overflow-hidden rounded-sm mt-12">
          <img
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            src={heroImages[1]}
            alt="Designer wristwatch"
          />
        </div>
        <div className="relative overflow-hidden rounded-sm -mt-12">
          <img
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            src={heroImages[2]}
            alt="Premium wireless headphones"
          />
        </div>
        <div className="relative overflow-hidden rounded-sm">
          <img
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            src={heroImages[3]}
            alt="Designer sneaker"
          />
        </div>
      </motion.div>
    </section>
  );
}
