"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Store, Mail, Lock, ArrowRight } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function SellerLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => router.push("/seller/dashboard"), 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0C0A09] px-4 relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="absolute top-1/4 left-1/4 h-[400px] w-[400px] rounded-full bg-gold/5 blur-[150px] orb" />
      <div className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-amber-700/3 blur-[120px] orb-reverse" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className="relative w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center mb-4 glow-gold-sm">
            <Store size={28} className="text-stone-950" />
          </div>
          <h1 className="text-2xl font-bold text-stone-100 font-[family-name:var(--font-bodoni)]">
            Seller Login
          </h1>
          <p className="text-stone-500 mt-1">Access your seller dashboard</p>
        </div>

        <form
          onSubmit={handleLogin}
          className="space-y-5 rounded-2xl glass p-7"
        >
          <Input
            label="Email"
            id="email"
            type="email"
            placeholder="seller@example.com"
            icon={<Mail size={16} />}
          />
          <Input
            label="Password"
            id="password"
            type="password"
            placeholder="Enter your password"
            icon={<Lock size={16} />}
          />
          <Button
            type="submit"
            size="lg"
            className="w-full gap-2"
            isLoading={loading}
          >
            Sign In <ArrowRight size={16} />
          </Button>
        </form>

        <p className="text-center text-sm text-stone-500 mt-6">
          Don&apos;t have an account?{" "}
          <Link
            href="/seller/register"
            className="text-gold hover:text-gold-light transition-colors"
          >
            Register here
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
