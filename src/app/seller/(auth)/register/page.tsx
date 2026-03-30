"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/stores/auth-store";

const sellerRegisterSchema = z.object({
  storeName: z.string().min(1, "Store name is required"),
  ownerName: z.string().min(1, "Owner name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email"),
  phone: z.string().min(1, "Phone is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm password"),
  category: z.string().min(1, "Category is required"),
  storeDescription: z.string().optional(),
  businessAddress: z.object({
    street: z.string().min(1, "Street is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zip: z.string().min(1, "Postal code is required"),
    country: z.string().min(1, "Country is required"),
  }),
  bankDetails: z.object({
    bankName: z.string().min(1, "Bank name is required"),
    accountNumber: z.string().min(1, "Account number is required"),
    routingNumber: z.string().min(1, "Routing number is required"),
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SellerRegisterFormData = z.infer<typeof sellerRegisterSchema>;

export default function SellerRegisterPage() {
  const router = useRouter();
  const auth = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    setValue,
    watch,
  } = useForm<SellerRegisterFormData>({
    resolver: zodResolver(sellerRegisterSchema),
    defaultValues: {
      category: "",
    },
  });

  const selectedCategory = watch("category");

  const categories = [
    { label: "Objects", icon: "cube" },
    { label: "Textiles", icon: "layers" },
    { label: "Editorial", icon: "book" },
    { label: "Digital", icon: "sparkles" },
  ];

  const onSubmit = async (data: SellerRegisterFormData) => {
    const result = await auth.registerSeller({
      storeName: data.storeName,
      ownerName: data.ownerName,
      email: data.email,
      phone: data.phone,
      password: data.password,
      storeDescription: data.storeDescription || "",
      businessAddress: data.businessAddress,
      bankDetails: data.bankDetails,
    });
    if (result.success) {
      router.push("/seller/login");
    } else {
      setError("root", {
        message: result.error || "Registration failed. Please try again.",
      });
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full bg-transparent border-t-0 border-x-0 border-b ${hasError ? "border-red-500" : "border-zinc-700"} py-4 px-0 text-white placeholder:text-zinc-800 focus:border-[#e07b39] transition-colors duration-300 outline-none focus:ring-0`;

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-zinc-100">
      <main className="max-w-7xl mx-auto px-8 py-24 md:py-32 grid grid-cols-12 gap-8">
        {/* Left Column: Editorial Header */}
        <div className="col-span-12 md:col-span-5 mb-16 md:mb-0">
          <div className="sticky top-24">
            <span className="block text-[11px] font-medium tracking-[0.1rem] text-[#e07b39] mb-6 uppercase">
              Merchant Gateway
            </span>
            <h1 className="text-5xl md:text-7xl font-light tracking-tighter text-[#f5f0e8] leading-tight mb-8">
              Start <br />Selling.
            </h1>
            <div className="w-24 h-[1px] bg-[#e07b39] mb-8" />
            <p className="text-zinc-400 font-light leading-relaxed max-w-sm">
              Join a curated ecosystem of independent creators. Our Bauhaus-inspired interface ensures your craftsmanship takes center stage without the noise of traditional marketplaces.
            </p>
            <div className="mt-16 hidden md:block">
              <div className="flex items-center gap-4 group cursor-pointer">
                <span className="text-[11px] font-medium tracking-[0.1rem] uppercase text-zinc-500 group-hover:text-[#e07b39] transition-colors">
                  Documentation
                </span>
                <ArrowRight size={14} className="text-zinc-600 group-hover:text-[#e07b39] transition-colors" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Registration Form */}
        <div className="col-span-12 md:col-span-6 md:col-start-7">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
            {errors.root && (
              <div className="bg-red-900/30 border border-red-800 text-red-300 text-sm px-4 py-3 rounded-sm">
                {errors.root.message}
              </div>
            )}

            {/* Section 1: Identity */}
            <section>
              <label className="block text-[11px] font-medium tracking-[0.1rem] text-zinc-500 mb-2 uppercase">
                Brand Identity
              </label>
              <div className="grid grid-cols-1 gap-10">
                <div className="relative group">
                  <label className="absolute -top-6 left-0 text-[10px] font-medium tracking-[0.05rem] text-zinc-600 uppercase">
                    Store Name
                  </label>
                  <input
                    className={inputClass(!!errors.storeName)}
                    placeholder="THE CURATOR STUDIO"
                    type="text"
                    {...register("storeName")}
                  />
                  {errors.storeName && (
                    <p className="text-red-400 text-xs mt-1">{errors.storeName.message}</p>
                  )}
                </div>
                <div className="relative group">
                  <label className="absolute -top-6 left-0 text-[10px] font-medium tracking-[0.05rem] text-zinc-600 uppercase">
                    Owner Name
                  </label>
                  <input
                    className={inputClass(!!errors.ownerName)}
                    placeholder="JOHN DOE"
                    type="text"
                    {...register("ownerName")}
                  />
                  {errors.ownerName && (
                    <p className="text-red-400 text-xs mt-1">{errors.ownerName.message}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Section 2: Contact */}
            <section>
              <label className="block text-[11px] font-medium tracking-[0.1rem] text-zinc-500 mb-2 uppercase">
                Contact Protocol
              </label>
              <div className="grid grid-cols-1 gap-10">
                <div className="relative group">
                  <label className="absolute -top-6 left-0 text-[10px] font-medium tracking-[0.05rem] text-zinc-600 uppercase">
                    Primary Email Address
                  </label>
                  <input
                    className={inputClass(!!errors.email)}
                    placeholder="CONTACT@MARKIT.CO"
                    type="email"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
                  )}
                </div>
                <div className="relative group">
                  <label className="absolute -top-6 left-0 text-[10px] font-medium tracking-[0.05rem] text-zinc-600 uppercase">
                    Phone Number
                  </label>
                  <input
                    className={inputClass(!!errors.phone)}
                    placeholder="+1 555-0123"
                    type="tel"
                    {...register("phone")}
                  />
                  {errors.phone && (
                    <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>
                  )}
                </div>
                <div className="relative group">
                  <label className="absolute -top-6 left-0 text-[10px] font-medium tracking-[0.05rem] text-zinc-600 uppercase">
                    Access Password
                  </label>
                  <input
                    className={inputClass(!!errors.password)}
                    placeholder="••••••••••••"
                    type="password"
                    {...register("password")}
                  />
                  {errors.password && (
                    <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
                  )}
                </div>
                <div className="relative group">
                  <label className="absolute -top-6 left-0 text-[10px] font-medium tracking-[0.05rem] text-zinc-600 uppercase">
                    Confirm Password
                  </label>
                  <input
                    className={inputClass(!!errors.confirmPassword)}
                    placeholder="••••••••••••"
                    type="password"
                    {...register("confirmPassword")}
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>
                  )}
                </div>
                <div className="relative group">
                  <label className="absolute -top-6 left-0 text-[10px] font-medium tracking-[0.05rem] text-zinc-600 uppercase">
                    Store Description
                  </label>
                  <input
                    className={inputClass(false)}
                    placeholder="Tell buyers about your store..."
                    type="text"
                    {...register("storeDescription")}
                  />
                </div>
              </div>
            </section>

            {/* Section 3: Business Address */}
            <section>
              <label className="block text-[11px] font-medium tracking-[0.1rem] text-zinc-500 mb-2 uppercase">
                Business Address
              </label>
              <div className="grid grid-cols-1 gap-10">
                <div className="relative group">
                  <label className="absolute -top-6 left-0 text-[10px] font-medium tracking-[0.05rem] text-zinc-600 uppercase">
                    Street Address
                  </label>
                  <input
                    className={inputClass(!!errors.businessAddress?.street)}
                    placeholder="123 BAUHAUS AVENUE"
                    type="text"
                    {...register("businessAddress.street")}
                  />
                  {errors.businessAddress?.street && (
                    <p className="text-red-400 text-xs mt-1">{errors.businessAddress.street.message}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-10">
                  <div className="relative group">
                    <label className="absolute -top-6 left-0 text-[10px] font-medium tracking-[0.05rem] text-zinc-600 uppercase">
                      City
                    </label>
                    <input
                      className={inputClass(!!errors.businessAddress?.city)}
                      placeholder="NEW YORK"
                      type="text"
                      {...register("businessAddress.city")}
                    />
                    {errors.businessAddress?.city && (
                      <p className="text-red-400 text-xs mt-1">{errors.businessAddress.city.message}</p>
                    )}
                  </div>
                  <div className="relative group">
                    <label className="absolute -top-6 left-0 text-[10px] font-medium tracking-[0.05rem] text-zinc-600 uppercase">
                      State
                    </label>
                    <input
                      className={inputClass(!!errors.businessAddress?.state)}
                      placeholder="NY"
                      type="text"
                      {...register("businessAddress.state")}
                    />
                    {errors.businessAddress?.state && (
                      <p className="text-red-400 text-xs mt-1">{errors.businessAddress.state.message}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-10">
                  <div className="relative group">
                    <label className="absolute -top-6 left-0 text-[10px] font-medium tracking-[0.05rem] text-zinc-600 uppercase">
                      ZIP Code
                    </label>
                    <input
                      className={inputClass(!!errors.businessAddress?.zip)}
                      placeholder="10001"
                      type="text"
                      {...register("businessAddress.zip")}
                    />
                    {errors.businessAddress?.zip && (
                      <p className="text-red-400 text-xs mt-1">{errors.businessAddress.zip.message}</p>
                    )}
                  </div>
                  <div className="relative group">
                    <label className="absolute -top-6 left-0 text-[10px] font-medium tracking-[0.05rem] text-zinc-600 uppercase">
                      Country
                    </label>
                    <input
                      className={inputClass(!!errors.businessAddress?.country)}
                      placeholder="UNITED STATES"
                      type="text"
                      {...register("businessAddress.country")}
                    />
                    {errors.businessAddress?.country && (
                      <p className="text-red-400 text-xs mt-1">{errors.businessAddress.country.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4: Bank / Payout Details */}
            <section>
              <label className="block text-[11px] font-medium tracking-[0.1rem] text-zinc-500 mb-2 uppercase">
                Bank / Payout Details
              </label>
              <div className="grid grid-cols-1 gap-10">
                <div className="relative group">
                  <label className="absolute -top-6 left-0 text-[10px] font-medium tracking-[0.05rem] text-zinc-600 uppercase">
                    Bank Name
                  </label>
                  <input
                    className={inputClass(!!errors.bankDetails?.bankName)}
                    placeholder="FIRST NATIONAL BANK"
                    type="text"
                    {...register("bankDetails.bankName")}
                  />
                  {errors.bankDetails?.bankName && (
                    <p className="text-red-400 text-xs mt-1">{errors.bankDetails.bankName.message}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-10">
                  <div className="relative group">
                    <label className="absolute -top-6 left-0 text-[10px] font-medium tracking-[0.05rem] text-zinc-600 uppercase">
                      Account Number
                    </label>
                    <input
                      className={inputClass(!!errors.bankDetails?.accountNumber)}
                      placeholder="••••••••••••"
                      type="text"
                      {...register("bankDetails.accountNumber")}
                    />
                    {errors.bankDetails?.accountNumber && (
                      <p className="text-red-400 text-xs mt-1">{errors.bankDetails.accountNumber.message}</p>
                    )}
                  </div>
                  <div className="relative group">
                    <label className="absolute -top-6 left-0 text-[10px] font-medium tracking-[0.05rem] text-zinc-600 uppercase">
                      Routing Number
                    </label>
                    <input
                      className={inputClass(!!errors.bankDetails?.routingNumber)}
                      placeholder="••••••••••••"
                      type="text"
                      {...register("bankDetails.routingNumber")}
                    />
                    {errors.bankDetails?.routingNumber && (
                      <p className="text-red-400 text-xs mt-1">{errors.bankDetails.routingNumber.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Section 5: Category Selection */}
            <section>
              <label className="block text-[11px] font-medium tracking-[0.1rem] text-zinc-500 mb-6 uppercase">
                Primary Curation Category
              </label>
              <div className="grid grid-cols-2 gap-4">
                {categories.map((cat) => (
                  <button
                    key={cat.label}
                    type="button"
                    onClick={() => setValue("category", cat.label, { shouldValidate: true })}
                    className={`border py-4 px-6 text-left hover:border-[#e07b39] hover:bg-zinc-900/50 transition-all flex justify-between items-center group rounded-sm ${
                      selectedCategory === cat.label
                        ? "border-[#e07b39] bg-zinc-900/50"
                        : "border-zinc-800"
                    }`}
                  >
                    <span className={`text-xs tracking-widest uppercase ${
                      selectedCategory === cat.label ? "text-white" : "text-zinc-400 group-hover:text-white"
                    }`}>
                      {cat.label}
                    </span>
                  </button>
                ))}
              </div>
              {errors.category && (
                <p className="text-red-400 text-xs mt-2">{errors.category.message}</p>
              )}
            </section>

            {/* Action Section */}
            <div className="pt-12 flex flex-col items-start gap-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full md:w-auto px-12 py-5 bg-gradient-to-br from-[#9a4601] to-[#e07b39] text-white font-medium tracking-[0.1rem] uppercase text-xs rounded-sm hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-[#9a4601]/10 disabled:opacity-60"
              >
                {isSubmitting ? "Creating..." : "Register Account"}
              </button>
              <p className="text-[10px] text-zinc-600 tracking-wide leading-relaxed">
                By registering, you agree to our{" "}
                <Link className="text-zinc-400 underline underline-offset-4 hover:text-[#e07b39]" href="#">
                  Merchant Terms of Service
                </Link>{" "}
                and{" "}
                <Link className="text-zinc-400 underline underline-offset-4 hover:text-[#e07b39]" href="#">
                  Privacy Protocol
                </Link>.
              </p>
            </div>
          </form>

          {/* Status Indicator */}
          <div className="mt-24 pt-12 border-t border-zinc-900 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-1 w-12 bg-[#2563EB]" />
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Network Secure</span>
            </div>
            <span className="text-[10px] text-zinc-700 uppercase tracking-widest">v.04.24 / ALPHA</span>
          </div>

          {/* Login link */}
          <div className="mt-8 text-center">
            <p className="text-[11px] text-zinc-600">
              Already have an account?{" "}
              <Link href="/seller/login" className="text-[#e07b39] hover:text-white transition-colors uppercase tracking-wider">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Bauhaus Decorative Element */}
      <div className="fixed bottom-0 right-0 p-12 opacity-5 pointer-events-none">
        <div className="w-64 h-64 border border-zinc-100 rotate-45 flex items-center justify-center">
          <div className="w-32 h-32 bg-[#9a4601]" />
        </div>
      </div>
    </div>
  );
}
