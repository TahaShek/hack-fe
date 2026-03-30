"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Truck, Zap } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useSocket } from "@/providers/SocketProvider";
import { formatCurrency } from "@/lib/utils";
import api from "@/services/api";

interface CheckoutForm {
  fullName: string; email: string; phone: string; street: string;
  city: string; state: string; zipCode: string; country: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, couponDiscount, clearCart } = useCartStore();
  const { socket } = useSocket();
  const subtotal = getSubtotal();
  const [deliveryMethod, setDeliveryMethod] = useState<"standard" | "express">("standard");
  const shipping = subtotal > 0 ? (deliveryMethod === "express" ? 15.99 : 5.99) : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax - couponDiscount;
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutForm>();

  const onSubmit = async (data: CheckoutForm) => {
    if (submitting) return; // Prevent double submission
    if (items.length === 0) {
      setError("Your cart is empty");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const orderPayload = {
        shippingAddress: {
          fullName: data.fullName,
          phone: data.phone,
          street: data.street,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          country: data.country,
        },
        email: data.email,
        paymentMethod: "pending",
        deliveryMethod,
      };
      const res = await api.post("/orders", orderPayload);
      if (res.data.success) {
        const orders = res.data.data;
        const orderList = Array.isArray(orders) ? orders : [orders];
        // Collect all order IDs for multi-seller payment
        const orderIds = orderList.map((o: Record<string, unknown>) => o._id || o.id).filter(Boolean);
        const primaryOrderId = orderIds[0];

        // Notify each seller via socket about their new order
        if (socket?.connected) {
          for (const order of orderList) {
            const sellerId = order?.sellerId?.toString?.() || order?.sellerId;
            if (sellerId) {
              socket.emit("order:new", {
                sellerId,
                orderNumber: order.orderNumber || String(order._id).slice(-6),
                totalAmount: order.totalAmount || 0,
                buyerName: data.fullName,
              });
            }
          }
        }

        // Clear the local cart since backend already cleared server cart
        clearCart();
        // Pass all order IDs so payment page can handle multi-seller orders
        const orderIdParam = orderIds.length > 1 ? orderIds.join(",") : primaryOrderId;
        router.push(`/payment?orderId=${orderIdParam || ""}`);
        return;
      }
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setError(message || "Failed to create order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full bg-transparent border-0 border-b border-[#dcc1b4]/30 text-sm text-[#1d1c17] placeholder-[#897367] py-3 px-0 focus:outline-none focus:ring-0 focus:border-[#9a4601] transition-colors";

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      {/* Progress dots */}
      <div className="flex items-center justify-center gap-0 mb-16">
        {["Shipping", "Payment", "Review"].map((step, i) => (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`h-3 w-3 rounded-full ${i === 0 ? "bg-[#9a4601]" : "bg-[#dcc1b4]/30"}`} />
              <span className={`text-[10px] mt-2 uppercase tracking-wider font-medium ${i === 0 ? "text-[#9a4601]" : "text-[#897367]"}`}>
                {step}
              </span>
            </div>
            {i < 2 && <div className={`h-px w-16 mx-4 ${i === 0 ? "bg-[#9a4601]/30" : "bg-[#dcc1b4]/15"}`} />}
          </div>
        ))}
      </div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-[3.5rem] font-light text-[#1d1c17] tracking-tighter mb-12 leading-none"
      >
        Checkout
      </motion.h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid lg:grid-cols-12 gap-16">
          <div className="lg:col-span-7 space-y-10">
            {/* Shipping */}
            <div>
              <h2 className="text-[11px] text-[#897367] tracking-[0.1rem] uppercase font-medium mb-8">Shipping Address</h2>
              <div className="grid sm:grid-cols-2 gap-x-12 gap-y-8">
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
                  <div key={field.name} className="relative">
                    <label className="text-[10px] uppercase tracking-widest text-[#554339] block mb-2">{field.label}</label>
                    <input
                      {...register(field.name, { required: "Required" })}
                      data-testid={`checkout-${field.name}`}
                      placeholder={field.placeholder}
                      className={inputClass}
                    />
                    {errors[field.name] && <p className="text-[10px] text-[#ba1a1a] mt-1">{errors[field.name]?.message}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Method */}
            <div>
              <h2 className="text-[11px] text-[#897367] tracking-[0.1rem] uppercase font-medium mb-8">Delivery Method</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setDeliveryMethod("standard")}
                  data-testid="delivery-standard"
                  className={`text-left p-5 rounded-sm transition-all cursor-pointer ${
                    deliveryMethod === "standard"
                      ? "bg-[#9a4601]/5 ring-1 ring-[#9a4601]"
                      : "bg-[#f8f3eb] hover:bg-[#ece8e0]/60"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Truck size={18} className={deliveryMethod === "standard" ? "text-[#9a4601]" : "text-[#897367]"} />
                    <span className="text-sm font-medium text-[#1d1c17]">Standard</span>
                  </div>
                  <p className="text-xs text-[#554339] font-light">3-5 business days</p>
                  <p className="text-sm font-medium text-[#1d1c17] mt-2">{formatCurrency(5.99)}</p>
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryMethod("express")}
                  data-testid="delivery-express"
                  className={`text-left p-5 rounded-sm transition-all cursor-pointer ${
                    deliveryMethod === "express"
                      ? "bg-[#9a4601]/5 ring-1 ring-[#9a4601]"
                      : "bg-[#f8f3eb] hover:bg-[#ece8e0]/60"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Zap size={18} className={deliveryMethod === "express" ? "text-[#9a4601]" : "text-[#897367]"} />
                    <span className="text-sm font-medium text-[#1d1c17]">Express</span>
                  </div>
                  <p className="text-xs text-[#554339] font-light">1-2 business days</p>
                  <p className="text-sm font-medium text-[#1d1c17] mt-2">{formatCurrency(15.99)}</p>
                </button>
              </div>
            </div>

            {/* Items preview */}
            <div>
              <h2 className="text-[11px] text-[#897367] tracking-[0.1rem] uppercase font-medium mb-6">Order Items ({items.length})</h2>
              <div className="space-y-0">
                {items.map((item, i) => (
                  <div key={item.id || item._id || i} className="flex items-center gap-6 py-4 border-b border-[#dcc1b4]/15">
                    <div className="h-16 w-16 overflow-hidden bg-[#f8f3eb] border border-[#dcc1b4]/20 shrink-0">
                      <img src={item.product?.images?.[0] || '/placeholder.svg'} alt={item.product?.name ?? ''} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#1d1c17] truncate">{item.product.name}</p>
                      <p className="text-[10px] text-[#897367] mt-1">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm text-[#1d1c17] font-medium">{formatCurrency(item.product.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-5">
            <div data-testid="order-summary" className="sticky top-24 bg-[#f8f3eb] p-10">
              <h2 className="text-[11px] font-medium tracking-[0.1rem] uppercase text-[#1d1c17] mb-8">Summary</h2>
              <div className="space-y-6">
                <div className="flex justify-between text-sm font-light text-[#554339]"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                <div className="flex justify-between text-sm font-light text-[#554339]"><span>Shipping</span><span>{formatCurrency(shipping)}</span></div>
                <div className="flex justify-between text-sm font-light text-[#554339]"><span>Tax</span><span>{formatCurrency(tax)}</span></div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-sm text-[#9a4601]"><span>Discount</span><span>-{formatCurrency(couponDiscount)}</span></div>
                )}
                <div className="pt-6 border-t border-[#dcc1b4]/30 flex justify-between items-baseline">
                  <span className="text-lg font-light">Total</span>
                  <span className="text-2xl font-normal text-[#1d1c17]">{formatCurrency(total)}</span>
                </div>
              </div>

              <div className="mt-10">
                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.98 }}
                  disabled={submitting}
                  data-testid="checkout-submit"
                  className="w-full bg-gradient-to-br from-[#9a4601] to-[#e07b39] text-white py-5 px-6 font-medium text-sm tracking-wider uppercase hover:opacity-95 transition-all cursor-pointer rounded-sm flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {submitting ? "Processing..." : "Continue to Payment"} {!submitting && <ArrowRight size={14} />}
                </motion.button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[10px] text-[#897367] mt-6">
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
