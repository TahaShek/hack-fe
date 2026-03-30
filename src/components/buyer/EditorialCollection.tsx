"use client";

import { motion } from "framer-motion";

export default function EditorialCollection() {
  return (
    <section className="py-32 px-8 md:px-16 bg-[#fef9f1] overflow-hidden">
      <motion.h2
        initial={{ opacity: 0, x: -100 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as const }}
        className="text-5xl md:text-8xl lg:text-[8rem] font-light text-[#1d1c17] tracking-tighter leading-[0.95]"
      >
        Built for
      </motion.h2>
      <motion.h2
        initial={{ opacity: 0, x: 100 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ delay: 0.12, duration: 1, ease: [0.16, 1, 0.3, 1] as const }}
        className="text-4xl md:text-6xl lg:text-[6rem] font-light text-[#897367] tracking-tighter leading-[1.1] md:ml-24 mt-2"
      >
        those who value
      </motion.h2>
      <motion.h2
        initial={{ opacity: 0, x: -100 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ delay: 0.24, duration: 1, ease: [0.16, 1, 0.3, 1] as const }}
        className="text-6xl md:text-9xl lg:text-[10rem] font-light text-[#1d1c17] tracking-tighter leading-[0.9] -mt-1"
      >
        the details.
      </motion.h2>
    </section>
  );
}
