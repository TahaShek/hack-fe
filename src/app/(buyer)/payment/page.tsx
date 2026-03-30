"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CreditCard, Lock, CheckCircle2 } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useSocket } from "@/providers/SocketProvider";
import { formatCurrency } from "@/lib/utils";
import api from "@/services/api";

function PaymentContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "";
  const router = useRouter();
  const { getTotal, clearCart } = useCartStore();
  const { socket } = useSocket();
  const total = getTotal();

  const [paymentId, setPaymentId] = useState("");
  const [serverAmount, setServerAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [initError, setInitError] = useState("");
  const [error, setError] = useState("");

  // Card form state
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [cardName, setCardName] = useState("");

  useEffect(() => {
    if (!orderId) {
      setInitError("No order ID found");
      setLoading(false);
      return;
    }

    let cancelled = false;

    const initPayment = async () => {
      if (paymentId) return;

      try {
        const res = await api.post("/payment/initiate", {
          orderId,
          paymentMethod: "card",
        });
        if (cancelled) return;
        const data = res.data.data;
        setPaymentId(data.paymentId);
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

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError("");

    const digits = cardNumber.replace(/\s/g, "");
    if (digits.length < 16) {
      setError("Please enter a valid card number");
      setProcessing(false);
      return;
    }
    if (!expiry || expiry.length < 5) {
      setError("Please enter a valid expiry date");
      setProcessing(false);
      return;
    }
    if (cvc.length < 3) {
      setError("Please enter a valid CVC");
      setProcessing(false);
      return;
    }

    // Simulate payment processing delay
    await new Promise((r) => setTimeout(r, 1500));

    // Test card 4000 0000 0000 0002 = declined
    if (digits === "4000000000000002") {
      setError("Your card was declined. Please try a different card.");
      setProcessing(false);
      return;
    }

    // Confirm payment on backend
    try {
      const res = await api.post("/payment/confirm", { paymentId });
      const confirmedOrderId = res.data.data?.orderId || orderId;

      if (socket?.connected) {
        socket.emit("payment:confirmed", { orderId: confirmedOrderId });
      }

      clearCart();
      router.push(`/order-confirmation?orderId=${confirmedOrderId}`);
    } catch {
      setError("Payment confirmation failed. Please contact support.");
      setProcessing(false);
    }
  };

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
                {cardNumber || "---- ---- ---- ----"}
              </div>
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase tracking-widest text-white/40 block">
                    Sandbox Mode
                  </span>
                  <span className="text-xs font-medium text-white tracking-widest uppercase">
                    {cardName || "Your Name"}
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
                <span className="font-mono">4242 4242 4242 4242</span> — Success
              </p>
              <p>
                <span className="font-mono">4000 0000 0000 0002</span> — Declined
              </p>
              <p>Any future exp. date &amp; any 3-digit CVC</p>
            </div>
          </div>
        </div>

        {/* Right — Card form */}
        <div className="md:col-start-6 md:col-span-7 lg:col-start-7 lg:col-span-5">
          <form onSubmit={handleSubmit} data-testid="payment-form" className="space-y-8">
            <div>
              <span className="text-[11px] font-medium tracking-[0.1rem] uppercase text-[#554339] block mb-6">
                Payment Details
              </span>
              <div className="space-y-5">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#554339] font-medium block mb-2">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full border border-[#dcc1b4]/50 px-4 py-3 text-sm text-[#1d1c17] rounded-sm outline-none focus:border-[#9a4601] transition-colors placeholder:text-[#897367]/50"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#554339] font-medium block mb-2">
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    placeholder="4242 4242 4242 4242"
                    maxLength={19}
                    className="w-full border border-[#dcc1b4]/50 px-4 py-3 text-sm text-[#1d1c17] font-mono rounded-sm outline-none focus:border-[#9a4601] transition-colors placeholder:text-[#897367]/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-[#554339] font-medium block mb-2">
                      Expiry
                    </label>
                    <input
                      type="text"
                      value={expiry}
                      onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                      placeholder="MM/YY"
                      maxLength={5}
                      className="w-full border border-[#dcc1b4]/50 px-4 py-3 text-sm text-[#1d1c17] font-mono rounded-sm outline-none focus:border-[#9a4601] transition-colors placeholder:text-[#897367]/50"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-[#554339] font-medium block mb-2">
                      CVC
                    </label>
                    <input
                      type="text"
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      placeholder="123"
                      maxLength={4}
                      className="w-full border border-[#dcc1b4]/50 px-4 py-3 text-sm text-[#1d1c17] font-mono rounded-sm outline-none focus:border-[#9a4601] transition-colors placeholder:text-[#897367]/50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-sm">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={processing}
              data-testid="pay-button"
              className="w-full bg-gradient-to-br from-[#9a4601] to-[#e07b39] text-white py-5 px-8 font-medium tracking-[0.15rem] uppercase text-sm active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50 rounded-sm flex items-center justify-center gap-3"
            >
              {processing ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
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
                Sandbox payment mode. Enter any test card details to simulate a payment.
              </p>
            </div>
          </form>
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
