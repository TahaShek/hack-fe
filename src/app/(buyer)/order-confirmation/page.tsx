"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Truck } from "lucide-react";
import api from "@/services/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Order } from "@/types";

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get(`/buyer/orders/${orderId}`);
        setOrder(res.data.data || res.data);
      } catch {
        setOrder(null);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center py-24 px-8">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-16">
            <div className="inline-block w-28 h-6 bg-[#e7e2da] rounded-sm animate-pulse mb-6" />
            <div className="w-80 h-16 bg-[#e7e2da] rounded-sm animate-pulse mx-auto mb-8" />
            <div className="w-24 h-[1px] bg-[#dcc1b4] mx-auto mb-12" />
            <div className="w-64 h-4 bg-[#e7e2da] rounded-sm animate-pulse mx-auto" />
          </div>
          <div className="grid grid-cols-12 gap-7">
            <div className="col-span-12 md:col-span-7">
              <div className="bg-[#f8f3eb] p-8 rounded-sm">
                <div className="w-32 h-4 bg-[#e7e2da] rounded-sm animate-pulse mb-8" />
                <div className="space-y-6">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex gap-6">
                      <div className="w-20 h-24 bg-[#e7e2da] rounded-sm animate-pulse shrink-0" />
                      <div className="flex-grow space-y-3">
                        <div className="w-40 h-4 bg-[#e7e2da] rounded-sm animate-pulse" />
                        <div className="w-24 h-3 bg-[#e7e2da] rounded-sm animate-pulse" />
                        <div className="w-16 h-4 bg-[#e7e2da] rounded-sm animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="col-span-12 md:col-span-5 space-y-6">
              <div className="bg-[#e7e2da] p-8 rounded-sm">
                <div className="w-32 h-4 bg-[#d5cfc6] rounded-sm animate-pulse mb-6" />
                <div className="space-y-4">
                  <div className="w-48 h-6 bg-[#d5cfc6] rounded-sm animate-pulse" />
                  <div className="w-40 h-4 bg-[#d5cfc6] rounded-sm animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex-grow flex items-center justify-center py-24 px-8">
        <p className="text-[#554339]">Order not found.</p>
      </div>
    );
  }

  const addr = order.shippingAddress;

  return (
    <div className="flex-grow flex items-center justify-center py-24 px-8">
      <div className="max-w-4xl w-full">
        {/* Bauhaus Header Section */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 150, damping: 15 }}
            className="inline-block px-4 py-1 border border-[#9a4601] text-[#9a4601] text-[11px] font-medium tracking-[0.1rem] mb-6 rounded-sm"
          >
            ORDER #{order.orderNumber}
          </motion.span>
          <span data-testid="order-id" className="sr-only">{order.orderNumber}</span>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-[3.5rem] md:text-[5rem] font-light leading-none tracking-tighter text-[#1d1c17] mb-8">
              Order Confirmed.
            </h1>
            <div className="w-24 h-[1px] bg-[#9a4601] mx-auto mb-12" />
            <p className="text-[#554339] max-w-md mx-auto font-light leading-relaxed">
              Thank you for your curation. Your order has been verified and is being prepared by our studio partners.
            </p>
          </motion.div>
        </div>

        {/* Content Grid: Asymmetrical Bauhaus Layout */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-12 gap-7"
        >
          {/* Order Details Card */}
          <div className="col-span-12 md:col-span-7 space-y-8">
            <div className="bg-[#f8f3eb] p-8 rounded-sm border border-[#dcc1b4]/15">
              <h2 className="text-[11px] font-medium tracking-[0.1rem] uppercase mb-8 border-b border-[#dcc1b4]/10 pb-4">
                Selected Items
              </h2>
              <div data-testid="order-items" className="space-y-6">
                {order.items.map((item, i) => (
                  <div key={item.id || item._id || i} className="flex gap-6 items-start">
                    <div className="w-20 h-24 bg-[#e7e2da] overflow-hidden rounded-sm shrink-0">
                      {item.productImage && (
                        <Image
                          src={item.productImage}
                          alt={item.productName}
                          width={80}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-medium text-sm text-[#1d1c17]">{item.productName}</h3>
                      {item.variants && Object.keys(item.variants).length > 0 && (
                        <p className="text-xs text-[#554339] mt-1">
                          {Object.entries(item.variants).map(([k, v]) => `${k}: ${v}`).join(" / ")}
                        </p>
                      )}
                      <div className="flex justify-between items-end mt-4">
                        <span className="text-xs font-light text-[#554339]">
                          Qty: {String(item.quantity).padStart(2, "0")}
                        </span>
                        <span className="text-sm font-medium">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-[#dcc1b4]/20 flex justify-between items-baseline">
                <span className="text-[11px] font-medium tracking-[0.1rem] uppercase">Total Amount</span>
                <span className="text-xl font-light text-[#9a4601]">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Shipping & Actions Column */}
          <div className="col-span-12 md:col-span-5 space-y-6">
            {/* Delivery Info */}
            <div className="bg-[#e7e2da] p-8 rounded-sm">
              <h2 className="text-[11px] font-medium tracking-[0.1rem] uppercase mb-6">Delivery Schedule</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-[#554339] mb-1">Estimated Arrival</p>
                  <p data-testid="delivery-date" className="text-xl font-light text-[#1d1c17]">
                    {order.estimatedDeliveryDate
                      ? formatDate(order.estimatedDeliveryDate)
                      : "3-5 business days"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#554339] mb-1">Order Date</p>
                  <p className="text-sm font-light text-[#1d1c17]">{formatDate(order.createdAt)}</p>
                </div>
                <div className="pt-4 border-t border-[#dcc1b4]/30">
                  <p className="text-xs text-[#554339] mb-1">Shipping Address</p>
                  <p className="text-sm leading-relaxed font-light text-[#1d1c17]">
                    {addr.fullName}<br />
                    {addr.street}<br />
                    {addr.city}, {addr.state} {addr.zipCode}<br />
                    {addr.country}
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Actions */}
            <div className="flex flex-col gap-3">
              <Link href="/dashboard">
                <button className="w-full bg-gradient-to-br from-[#9a4601] to-[#e07b39] text-white py-4 px-6 rounded-sm text-sm font-medium tracking-wide flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-[0.98] cursor-pointer">
                  <Truck size={16} />
                  Track Order
                </button>
              </Link>
              <Link href="/products">
                <button data-testid="continue-shopping" className="w-full border border-[#dcc1b4] text-[#1d1c17] py-4 px-6 rounded-sm text-sm font-medium tracking-wide hover:bg-[#f8f3eb] transition-all active:scale-[0.98] cursor-pointer">
                  Continue Shopping
                </button>
              </Link>
            </div>

            {/* Help Link */}
            <div className="text-center pt-4">
              <Link
                href="/chat"
                className="text-[11px] font-medium tracking-[0.1rem] uppercase text-[#554339] hover:text-[#9a4601] transition-colors underline underline-offset-8 decoration-[#9a4601]/30"
              >
                Need Assistance?
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-grow flex items-center justify-center py-24 px-8">
          <div className="w-8 h-8 border-2 border-[#9a4601] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <OrderConfirmationContent />
    </Suspense>
  );
}
