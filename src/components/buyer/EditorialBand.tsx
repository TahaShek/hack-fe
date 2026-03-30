"use client";

import { motion } from "framer-motion";
import { mockProducts } from "@/lib/mock-data";
import Link from "next/link";

const trendingItems = [
  { name: "Aluminum Water Vessel", description: "Zero-plastic hydration engineering." },
  { name: "Grid Bound Journal", description: "Swiss-made acid-free archival paper." },
  { name: "Mechanical Graphite Tool", description: "Precision weighted architectural drafting." },
];

export default function EditorialBand() {
  return (
    <section className="py-24 px-8 md:px-16 bg-[#ece8e0]/30">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
        {/* Left: Trending list */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-[11px] font-medium uppercase tracking-[0.1rem] text-[#9a4601]">
              In Demand
            </span>
            <h2 className="text-5xl font-light tracking-tight text-[#1d1c17] mt-4 mb-12">
              Trending Now
            </h2>
          </motion.div>

          <div className="space-y-12">
            {trendingItems.map((item, i) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="flex gap-8 group cursor-pointer"
              >
                <span className="text-3xl font-light text-[#dcc1b4]/40 group-hover:text-[#9a4601] transition-colors">
                  #{String(i + 1).padStart(2, "0")}
                </span>
                <div className={`${i < trendingItems.length - 1 ? "border-b border-[#dcc1b4]/20" : ""} pb-8 flex-1`}>
                  <h3 className="text-xl font-light uppercase tracking-widest text-[#1d1c17]">
                    {item.name}
                  </h3>
                  <p className="text-sm text-[#554339] mt-2">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right: Editorial image */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative h-[600px] overflow-hidden rounded-sm border border-[#dcc1b4]/20"
        >
          <img
            className="absolute inset-0 w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJ-mdlwUE4rsgXSxB5fIYncd0Zgo122aapBGB2Ezhm1pHHRzmEuqqbJNsQCHSHYtc2JftNhNKB7LLsbcIo-Q8qrJMZpodgY9eDaJnIPaNR_reT-pUJQwoaMgyvH0GPEtEzZdr_Le1KD8mu92sU4BNnfWlzDpadKiCiQW2oJtPqWF98XLuEITQ_WWF8gdS9D9zufq56gMibwijNNokFXBPv0R_KAkp3xRyLWIGNIKRdtQqJpOHIXbWoqNfH06-hPIn8vZflqc-CI2w"
            alt="Camera kit editorial"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D]/40 to-transparent" />
          <div className="absolute bottom-12 left-12">
            <span className="text-[11px] font-medium text-white uppercase tracking-[0.2rem] block mb-4">
              New Spotlight
            </span>
            <h3 className="text-3xl font-light text-white uppercase tracking-widest leading-none">
              The Capture<br />Series
            </h3>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
