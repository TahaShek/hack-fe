"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { CreditCard, Lock, CheckCircle2 } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useSocket } from "@/providers/SocketProvider";
import { formatCurrency } from "@/lib/utils";
import api from "@/services/api";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

/* ────────────────────────────────────────────
   Inner form — rendered inside <Elements>
   ──────────────────────────────────────────── */
function CheckoutForm({
  orderId,
  paymentIntentId,
  amount,
}: {
  orderId: string;
  paymentIntentId: string;
  amount: number;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { clearCart } = useCartStore();
  const { socket } = useSocket();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError("");

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (stripeError) {
      setError(stripeError.message || "Payment failed. Please try again.");
      setProcessing(false);
      return;
    }

    // Verify on our backend
    try {
      const res = await api.post("/payment/confirm", { paymentIntentId });
      const confirmedOrderId = res.data.data?.orderId || orderId;

      // Notify via socket
      if (socket?.connected) {
        socket.emit("payment:confirmed", { orderId: confirmedOrderId });
      }

      clearCart();
      router.push(`/order-confirmation?orderId=${confirmedOrderId}`);
    } catch {
      setError("Payment succeeded but confirmation failed. Please contact support.");
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} data-testid="payment-form" className="space-y-8">
      <div>
        <span className="text-[11px] font-medium tracking-[0.1rem] uppercase text-[#554339] block mb-6">
          Payment Details
        </span>
        <div className="bg-white border border-[#dcc1b4]/30 p-6 rounded-sm">
          <PaymentElement
            options={{
              layout: "tabs",
              defaultValues: {
                billingDetails: { address: { country: "US" } },
              },
            }}
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-sm">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        data-testid="pay-button"
        className="w-full bg-gradient-to-br from-[#9a4601] to-[#e07b39] text-white py-5 px-8 font-medium tracking-[0.15rem] uppercase text-sm active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50 rounded-sm flex items-center justify-center gap-3"
      >
        {processing ? (
          <svg
            className="animate-spin h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : (
          <>
            <Lock size={14} />
            PAY {formatCurrency(amount)}
          </>
        )}
      </button>

      <div className="flex items-start gap-4 pt-2 opacity-60">
        <Lock size={16} className="mt-0.5 text-[#554339]" />
        <p className="text-[11px] leading-relaxed text-[#554339] max-w-xs">
          Powered by Stripe. Your payment is secured with bank-grade encryption.
          We never see or store your full card details.
        </p>
      </div>
    </form>
  );
}

/* ────────────────────────────────────────────
   Main payment page
   ──────────────────────────────────────────── */
function PaymentContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "";
  const { getTotal } = useCartStore();
  const total = getTotal();

  const [clientSecret, setClientSecret] = useState("");
  const [paymentIntentId, setPaymentIntentId] = useState("");
  const [serverAmount, setServerAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState("");

  useEffect(() => {
    if (!orderId) {
      setInitError("No order ID found");
      setLoading(false);
      return;
    }

    let cancelled = false;

    const initPayment = async () => {
      // Prevent double-init (React Strict Mode calls useEffect twice)
      if (clientSecret) return;

      try {
        const res = await api.post("/payment/initiate", {
          orderId,
          paymentMethod: "card",
        });
        if (cancelled) return;
        const data = res.data.data;
        setClientSecret(data.clientSecret);
        setPaymentIntentId(data.paymentIntentId);
        setServerAmount(data.amount);
      } catch (err: unknown) {
        if (cancelled) return;
        const message =
          err && typeof err === "object" && "response" in err
            ? (err as { response?: { data?: { message?: string } } }).response
                ?.data?.message
            : undefined;
        setInitError(message || "Failed to initialize payment");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    initPayment();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const amount = serverAmount || total;

  if (loading) {
    return (
      <div className="max-w-screen-xl mx-auto px-6 py-24 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-[#9a4601] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[#554339]">Preparing secure checkout...</p>
        </div>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="max-w-screen-xl mx-auto px-6 py-24 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto">
            <CreditCard size={20} className="text-red-500" />
          </div>
          <p className="text-sm text-red-600">{initError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-12 md:py-24">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
        {/* Left — Summary */}
        <div className="md:col-span-4 space-y-12">
          <section>
            <span className="text-[11px] font-medium tracking-[0.1rem] uppercase text-[#554339] block mb-4">
              Secure Checkout
            </span>
            <h1 className="text-5xl font-light tracking-tighter mb-8 leading-none text-[#1d1c17]">
              Payment
            </h1>
            <div className="space-y-6">
              <div className="flex justify-between items-end pb-4 border-b border-[#dcc1b4]/15">
                <span className="text-sm text-[#554339]">Total Amount</span>
                <span className="text-2xl font-light text-[#1d1c17]">
                  {formatCurrency(amount)}
                </span>
              </div>
            </div>
          </section>

          {/* Card visual */}
          <div className="relative w-full aspect-[1.586/1] bg-[#0D0D0D] p-8 flex flex-col justify-between overflow-hidden rounded-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#9a4601]/20 -translate-y-16 translate-x-16 rounded-full blur-3xl" />
            <div className="flex justify-between items-start z-10">
              <div className="w-12 h-8 bg-[#e7e2da]/20 rounded-sm" />
              <CreditCard size={20} className="text-white/50" />
            </div>
            <div className="z-10">
              <div className="text-xl font-light tracking-[0.2em] text-white mb-6">
                ---- ---- ---- 4242
              </div>
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase tracking-widest text-white/40 block">
                    Stripe Test Mode
                  </span>
                  <span className="text-xs font-medium text-white tracking-widest uppercase">
                    Secure Payment
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 size={12} className="text-emerald-400" />
                  <span className="text-[10px] text-emerald-400 font-medium">
                    Encrypted
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden md:block">
            <p className="text-[10px] uppercase tracking-widest text-[#554339] mb-2">
              Test Cards
            </p>
            <div className="space-y-1 text-xs text-[#897367]">
              <p>
                <span className="font-mono">4242 4242 4242 4242</span> —
                Success
              </p>
              <p>
                <span className="font-mono">4000 0000 0000 0002</span> —
                Declined
              </p>
              <p>Any future exp. date &amp; any 3-digit CVC</p>
            </div>
          </div>
        </div>

        {/* Right — Stripe form */}
        <div className="md:col-start-6 md:col-span-7 lg:col-start-7 lg:col-span-5">
          {clientSecret && (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: "stripe",
                  variables: {
                    colorPrimary: "#9a4601",
                    colorText: "#1d1c17",
                    colorDanger: "#dc2626",
                    fontFamily: "Inter, system-ui, sans-serif",
                    borderRadius: "2px",
                  },
                  rules: {
                    ".Input": {
                      border: "1px solid #dcc1b480",
                      boxShadow: "none",
                      padding: "12px",
                    },
                    ".Input:focus": {
                      border: "1px solid #9a4601",
                      boxShadow: "0 0 0 1px #9a4601",
                    },
                    ".Label": {
                      fontSize: "10px",
                      fontWeight: "500",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: "#554339",
                    },
                    ".Tab": {
                      border: "1px solid #dcc1b480",
                      boxShadow: "none",
                    },
                    ".Tab--selected": {
                      borderColor: "#9a4601",
                      backgroundColor: "rgba(154,70,1,0.05)",
                    },
                  },
                },
              }}
            >
              <CheckoutForm
                orderId={orderId}
                paymentIntentId={paymentIntentId}
                amount={amount}
              />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-2 border-[#9a4601] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
