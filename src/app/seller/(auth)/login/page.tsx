"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Store, Lock, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/stores/auth-store";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function SellerLoginPage() {
  const router = useRouter();
  const auth = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    const result = await auth.loginSeller(data.email, data.password);
    if (result.success) {
      router.push("/seller/dashboard");
    } else {
      setError("root", {
        message: result.error || "Login failed. Please check your credentials.",
      });
    }
  };

  return (
    <main className="min-h-screen flex flex-col md:flex-row items-stretch overflow-hidden bg-[#0D0D0D]">
      {/* Left Side: Editorial Branding Section */}
      <section className="hidden md:flex flex-col justify-between p-12 w-1/2 bg-[#0D0D0D] border-r border-zinc-800">
        <div className="flex flex-col gap-1">
          <span className="text-white text-lg font-medium tracking-widest uppercase">MARKIT</span>
          <span className="text-zinc-500 text-xs tracking-[0.2rem] uppercase">Seller Studio</span>
        </div>
        <div className="max-w-md">
          <h1 className="text-white text-5xl font-light tracking-tighter leading-none mb-6">
            Curate your <br />
            <span className="text-[#e07b39] italic font-normal">digital storefront.</span>
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed font-light">
            Access the merchant dashboard to manage inventory, analyze performance, and connect with a global community of curators.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-zinc-900 flex items-center justify-center rounded-sm">
            <Store size={20} className="text-[#e07b39]" />
          </div>
          <div className="flex flex-col">
            <span className="text-white text-xs font-medium uppercase tracking-wider">Verified Merchant</span>
            <span className="text-zinc-500 text-xs">Standard Tier Access</span>
          </div>
        </div>
      </section>

      {/* Right Side: Login Form Canvas */}
      <section className="flex-1 flex flex-col items-center justify-center p-8 bg-[#0D0D0D]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="w-full max-w-sm flex flex-col"
        >
          {/* Mobile Branding */}
          <div className="md:hidden mb-12 flex flex-col items-center text-center">
            <span className="text-white text-xl font-medium tracking-widest uppercase mb-2">MARKIT</span>
            <div className="h-[1px] w-8 bg-[#9a4601] mb-2" />
          </div>

          {/* Headline */}
          <div className="mb-12">
            <span className="text-[11px] font-medium uppercase tracking-[0.1rem] text-[#e07b39] mb-2 block">Security Portal</span>
            <h2 className="text-white text-3xl font-light tracking-tight">Seller Login.</h2>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-8">
            {errors.root && (
              <div className="bg-red-900/30 border border-red-800 text-red-300 text-sm px-4 py-3 rounded-sm">
                {errors.root.message}
              </div>
            )}

            {/* Email Field */}
            <div className="flex flex-col space-y-2">
              <label className="text-[11px] font-medium uppercase tracking-[0.1rem] text-zinc-500" htmlFor="email">
                Merchant Email
              </label>
              <input
                className={`bg-[#1A1A1A] border ${errors.email ? "border-red-500" : "border-zinc-800"} text-white h-12 px-4 focus:ring-1 focus:ring-[#e07b39] transition-all outline-none rounded-sm placeholder:text-zinc-600 text-sm`}
                id="email"
                placeholder="curator@markit.com"
                type="email"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-red-400 text-xs">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-medium uppercase tracking-[0.1rem] text-zinc-500" htmlFor="password">
                  Access Key
                </label>
                <a className="text-[10px] uppercase tracking-wider text-zinc-600 hover:text-zinc-400 transition-colors" href="#">
                  Forgot?
                </a>
              </div>
              <input
                className={`bg-[#1A1A1A] border ${errors.password ? "border-red-500" : "border-zinc-800"} text-white h-12 px-4 focus:ring-1 focus:ring-[#e07b39] transition-all outline-none rounded-sm placeholder:text-zinc-600 text-sm`}
                id="password"
                placeholder="••••••••"
                type="password"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-red-400 text-xs">{errors.password.message}</p>
              )}
            </div>

            {/* CTA Section */}
            <div className="pt-4 flex flex-col space-y-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="h-14 bg-gradient-to-br from-[#9a4601] to-[#e07b39] text-white text-xs font-medium uppercase tracking-[0.15rem] transition-all hover:opacity-90 active:scale-[0.98] rounded-sm disabled:opacity-60"
              >
                {isSubmitting ? "Entering..." : "Enter Studio"}
              </button>

              <div className="flex items-center justify-center gap-4">
                <div className="h-[1px] flex-1 bg-zinc-800" />
                <span className="text-[10px] text-zinc-600 uppercase tracking-widest">New Merchant?</span>
                <div className="h-[1px] flex-1 bg-zinc-800" />
              </div>

              <Link
                href="/seller/register"
                className="group flex items-center justify-center gap-2 text-[11px] font-medium uppercase tracking-[0.1rem] text-zinc-400 hover:text-white transition-all py-2"
              >
                Create Seller Account
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </form>

          {/* Footer Accents */}
          <div className="mt-20 flex justify-between items-center border-t border-zinc-900 pt-6">
            <span className="text-[10px] text-zinc-700 font-light italic">Ref. 013-Login</span>
            <div className="flex gap-4">
              <Lock size={12} className="text-zinc-800" />
              <Store size={12} className="text-zinc-800" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Decorative Bauhaus Abstract */}
      <div className="fixed top-12 right-12 opacity-10 pointer-events-none hidden lg:block">
        <div className="relative w-64 h-64 border border-zinc-500 rotate-45">
          <div className="absolute inset-0 border border-zinc-500 -translate-x-4 -translate-y-4" />
          <div className="absolute inset-0 border border-[#e07b39] -translate-x-8 -translate-y-8" />
        </div>
      </div>

      {/* Gradient Backdrop */}
      <div className="fixed bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#9a4601]/5 to-transparent pointer-events-none" />
    </main>
  );
}
