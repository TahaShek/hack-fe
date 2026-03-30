"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, Mail, Lock, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Button from "@/components/ui/Button";
import { useAuthStore } from "@/stores/auth-store";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
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
    const result = await auth.loginAdmin(data.email, data.password);
    if (result.success) {
      router.push("/admin/dashboard");
    } else {
      setError("root", {
        message: result.error || "Login failed. Please check your credentials.",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0D0D0D] px-4 relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="absolute top-1/3 right-1/3 h-[400px] w-[400px] rounded-full bg-[#2563EB]/5 blur-[150px]" />
      <div className="absolute bottom-1/3 left-1/3 h-[300px] w-[300px] rounded-full bg-[#9a4601]/5 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className="relative w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="mx-auto h-14 w-14 rounded-sm bg-[#2563EB] flex items-center justify-center mb-4">
            <Shield size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-light tracking-tighter text-white">
            Admin Login
          </h1>
          <p className="text-zinc-500 mt-2 text-[11px] font-medium uppercase tracking-[0.1rem]">
            Access the admin panel
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5 bg-zinc-900/50 border border-zinc-800 p-7 rounded-sm"
        >
          {errors.root && (
            <div className="bg-red-900/30 border border-red-800 text-red-300 text-sm px-4 py-3 rounded-sm">
              {errors.root.message}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="admin-email" className="block text-[11px] tracking-[0.1rem] uppercase text-[#897367] font-medium">
              Email
            </label>
            <div className="relative group">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 text-[#897367] group-focus-within:text-[#9a4601] transition-colors">
                <Mail size={16} />
              </div>
              <input
                id="admin-email"
                type="email"
                placeholder="admin@markit.com"
                {...register("email")}
                className={`w-full border-b ${errors.email ? "border-red-500" : "border-[#897367]"} bg-transparent pl-8 py-3 text-sm text-white placeholder-[#897367] transition-colors focus:border-[#9a4601] focus:outline-none`}
              />
            </div>
            {errors.email && (
              <p className="text-red-400 text-xs">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="admin-password" className="block text-[11px] tracking-[0.1rem] uppercase text-[#897367] font-medium">
              Password
            </label>
            <div className="relative group">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 text-[#897367] group-focus-within:text-[#9a4601] transition-colors">
                <Lock size={16} />
              </div>
              <input
                id="admin-password"
                type="password"
                placeholder="Enter password"
                {...register("password")}
                className={`w-full border-b ${errors.password ? "border-red-500" : "border-[#897367]"} bg-transparent pl-8 py-3 text-sm text-white placeholder-[#897367] transition-colors focus:border-[#9a4601] focus:outline-none`}
              />
            </div>
            {errors.password && (
              <p className="text-red-400 text-xs">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full gap-2 bg-gradient-to-r from-[#9a4601] to-[#e07b39] text-white hover:opacity-90 border-none"
            isLoading={isSubmitting}
          >
            Sign In <ArrowRight size={16} />
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
