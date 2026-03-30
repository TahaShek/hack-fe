"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/stores/auth-store";

const registerSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email"),
  phone: z.string().min(1, "Phone is required").regex(/^\+?[\d\s-]{7,15}$/, "Invalid phone number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  agreeTerms: z.literal(true, { error: "You must agree to the terms" }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function BuyerRegisterPage() {
  const router = useRouter();
  const auth = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      agreeTerms: undefined,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    const result = await auth.registerBuyer({
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      password: data.password,
    });

    if (result.success) {
      router.push("/login?registered=true");
    } else {
      setError("root", {
        message: result.error || "Registration failed. Please try again.",
      });
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full bg-transparent border-0 border-b ${hasError ? "border-red-500" : "border-[#dcc1b4]"} focus:border-[#9a4601] focus:ring-0 transition-colors duration-300 py-3 px-0 placeholder-[#dcc1b4]/60 font-light text-[#1d1c17]`;

  return (
    <main className="min-h-screen flex items-center justify-center px-8 py-16" style={{ padding: "clamp(2rem, 8vw, 6rem)" }}>
      <div className="w-full max-w-6xl grid grid-cols-12 gap-6">
        {/* Left — Editorial */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="hidden md:flex col-span-12 md:col-span-5 items-center"
        >
          <div className="relative w-full aspect-[3/4] bg-[#f8f3eb] overflow-hidden">
            <img
              alt="Curated lifestyle"
              className="w-full h-full object-cover opacity-90"
              src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80"
            />
            <div className="absolute inset-0 bg-[#9a4601]/5 mix-blend-multiply" />
            <div className="absolute bottom-12 left-12 right-12">
              <div className="p-8 bg-white/10 backdrop-blur-xl border border-white/20">
                <p className="text-white text-lg font-light italic leading-relaxed">
                  &ldquo;Less, but better.&rdquo;
                </p>
                <span className="mt-4 block text-[10px] tracking-[0.2rem] uppercase text-white/60">
                  Dieter Rams
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right — Form */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="col-span-12 md:col-span-7 lg:col-span-6 lg:col-start-7 flex flex-col justify-center"
        >
          <div className="mb-12">
            <span className="text-[11px] font-medium tracking-[0.1rem] uppercase text-[#9a4601] mb-4 block">
              Join the Registry
            </span>
            <h1 className="text-5xl md:text-7xl font-light tracking-tighter leading-[1.1] text-[#1d1c17] mb-6">
              Create<br />Account.
            </h1>
            <div className="w-24 h-[1px] bg-[#9a4601]" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
            {errors.root && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-sm">
                {errors.root.message}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
              <div>
                <label className="text-[11px] font-medium tracking-[0.1rem] uppercase text-[#554339] block mb-2">Full Name</label>
                <input
                  type="text"
                  {...register("fullName")}
                  data-testid="register-fullname"
                  placeholder="John Doe"
                  className={inputClass(!!errors.fullName)}
                />
                {errors.fullName && (
                  <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>
                )}
              </div>
              <div>
                <label className="text-[11px] font-medium tracking-[0.1rem] uppercase text-[#554339] block mb-2">Email</label>
                <input
                  type="email"
                  {...register("email")}
                  data-testid="register-email"
                  placeholder="name@example.com"
                  className={inputClass(!!errors.email)}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>
              <div>
                <label className="text-[11px] font-medium tracking-[0.1rem] uppercase text-[#554339] block mb-2">Phone</label>
                <input
                  type="tel"
                  {...register("phone")}
                  data-testid="register-phone"
                  placeholder="+1 555 0123"
                  className={inputClass(!!errors.phone)}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
                )}
              </div>
              <div>
                <label className="text-[11px] font-medium tracking-[0.1rem] uppercase text-[#554339] block mb-2">Password</label>
                <input
                  type="password"
                  {...register("password")}
                  data-testid="register-password"
                  placeholder="••••••••"
                  className={inputClass(!!errors.password)}
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="text-[11px] font-medium tracking-[0.1rem] uppercase text-[#554339] block mb-2">Confirm Password</label>
                <input
                  type="password"
                  {...register("confirmPassword")}
                  data-testid="register-confirm-password"
                  placeholder="••••••••"
                  className={inputClass(!!errors.confirmPassword)}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            {/* Terms */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("agreeTerms")}
                  data-testid="register-agree-terms"
                  className="mt-1 w-4 h-4 rounded-sm border-[#dcc1b4] text-[#9a4601] focus:ring-[#9a4601] cursor-pointer"
                />
                <span className="text-xs text-[#554339] font-light leading-relaxed">
                  I agree to the{" "}
                  <Link href="#" className="text-[#9a4601] underline underline-offset-2">Terms of Service</Link>
                  {" "}and{" "}
                  <Link href="#" className="text-[#9a4601] underline underline-offset-2">Privacy Policy</Link>
                </span>
              </label>
              {errors.agreeTerms && (
                <p className="text-red-500 text-xs mt-1">{errors.agreeTerms.message}</p>
              )}
            </div>

            <div className="pt-4 space-y-4">
              <button
                type="submit"
                disabled={isSubmitting}
                data-testid="register-submit"
                className="w-full bg-gradient-to-br from-[#9a4601] to-[#e07b39] text-white py-4 rounded-sm text-[11px] font-medium tracking-[0.2rem] uppercase hover:opacity-90 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </button>

              <button
                type="button"
                className="w-full bg-[#e7e2da] text-[#1d1c17] py-4 rounded-sm text-[11px] font-medium tracking-[0.2rem] uppercase flex items-center justify-center gap-3 hover:bg-[#ece8e0] transition-all active:scale-[0.98] cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="currentColor" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor" />
                </svg>
                Sign up with Google
              </button>
            </div>

            <p className="text-center text-[#554339] text-sm font-light mt-6">
              Already have an account?{" "}
              <Link href="/login" className="text-[#9a4601] font-medium underline underline-offset-4">
                Sign in
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </main>
  );
}
