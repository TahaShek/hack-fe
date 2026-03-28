"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { formatCurrency } from "@/lib/utils";

interface CheckoutForm {
  fullName: string; email: string; phone: string; street: string;
  city: string; state: string; zipCode: string; country: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, getTotal, couponDiscount } = useCartStore();
  const subtotal = getSubtotal();
  const shipping = subtotal > 0 ? 5.99 : 0;
  const tax = subtotal * 0.08;
  const total = getTotal();

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutForm>();
  const onSubmit = () => router.push("/payment");

  const inputClass = "w-full bg-transparent border-b border-[rgba(255,255,255,0.12)] text-sm text-[#F5F5F5] placeholder-[#6B7280] py-3 focus:outline-none focus:border-accent transition-colors";

  return (
    <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-8">
      {/* Progress dots */}
      <div className="flex items-center justify-center gap-0 mb-16">
        {["Shipping", "Payment", "Review"].map((step, i) => (
          <div key={step} className="flex items-center">
            <div className={`h-2.5 w-2.5 rounded-full ${i === 0 ? "bg-accent" : "bg-[rgba(255,255,255,0.12)]"}`} />
            {i < 2 && <div className="h-px w-16 bg-[rgba(255,255,255,0.06)]" />}
          </div>
        ))}
      </div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl md:text-5xl font-light text-[#F5F5F5] tracking-tight mb-12"
      >
        Checkout
      </motion.h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid lg:grid-cols-5 gap-16">
          <div className="lg:col-span-3 space-y-10">
            {/* Shipping */}
            <div>
              <h2 className="text-xs text-[#6B7280] tracking-[0.2em] uppercase mb-6">Shipping Address</h2>
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
                {[
                  { name: "fullName" as const, label: "Full Name", placeholder: "John Doe" },
                  { name: "email" as const, label: "Email", placeholder: "john@example.com" },
                  { name: "phone" as const, label: "Phone", placeholder: "+1 555-0123" },
                  { name: "street" as const, label: "Street", placeholder: "123 Main St" },
                  { name: "city" as const, label: "City", placeholder: "San Francisco" },
                  { name: "state" as const, label: "State", placeholder: "CA" },
                  { name: "zipCode" as const, label: "ZIP Code", placeholder: "94105" },
                  { name: "country" as const, label: "Country", placeholder: "United States" },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-[10px] text-[#6B7280] tracking-[0.15em] uppercase mb-2">{field.label}</label>
                    <input
                      {...register(field.name, { required: "Required" })}
                      placeholder={field.placeholder}
                      className={inputClass}
                    />
                    {errors[field.name] && <p className="text-[10px] text-red-400 mt-1">{errors[field.name]?.message}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Items preview */}
            <div>
              <h2 className="text-xs text-[#6B7280] tracking-[0.2em] uppercase mb-6">Order Items ({items.length})</h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 py-3 border-b border-[rgba(255,255,255,0.06)]">
                    <div className="h-12 w-12 rounded-lg overflow-hidden bg-[#111111] shrink-0">
                      <img src={item.product.images[0]} alt={item.product.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#F5F5F5] truncate">{item.product.name}</p>
                      <p className="text-[10px] text-[#6B7280]">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm text-[#F5F5F5]">{formatCurrency(item.product.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 rounded-2xl bg-[#111111] p-8 space-y-5">
              <h2 className="text-base font-medium text-[#F5F5F5]">Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-[#6B7280]"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                <div className="flex justify-between text-[#6B7280]"><span>Shipping</span><span>{formatCurrency(shipping)}</span></div>
                <div className="flex justify-between text-[#6B7280]"><span>Tax</span><span>{formatCurrency(tax)}</span></div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-400"><span>Discount</span><span>-{formatCurrency(couponDiscount)}</span></div>
                )}
                <div className="h-px bg-[rgba(255,255,255,0.06)]" />
                <div className="flex justify-between text-[#F5F5F5] text-lg"><span>Total</span><span>{formatCurrency(total)}</span></div>
              </div>

              <motion.button
                type="submit"
                whileTap={{ scale: 0.97 }}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-accent text-white text-sm font-medium hover:shadow-[0_0_30px_rgba(232,120,74,0.3)] transition-all cursor-pointer"
              >
                Continue to Payment <ArrowRight size={14} />
              </motion.button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-[#6B7280]">
                <ShieldCheck size={12} />
                <span>Your data is encrypted and secure</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
