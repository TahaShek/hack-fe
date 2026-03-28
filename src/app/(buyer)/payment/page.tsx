"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Building2, Smartphone, Lock, ArrowRight } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { formatCurrency } from "@/lib/utils";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const paymentMethods = [
  { id: "card", label: "Credit / Debit Card", icon: CreditCard },
  { id: "bank", label: "Bank Transfer", icon: Building2 },
  { id: "mobile", label: "Mobile Payment", icon: Smartphone },
];

export default function PaymentPage() {
  const router = useRouter();
  const [selected, setSelected] = useState("card");
  const [processing, setProcessing] = useState(false);
  const { getTotal, clearCart } = useCartStore();
  const total = getTotal();

  const handlePayment = () => {
    setProcessing(true);
    setTimeout(() => {
      clearCart();
      router.push("/order-confirmation");
    }, 2000);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-zinc-100 mb-8">Payment</h1>

      {/* Payment Methods */}
      <div className="space-y-3 mb-8">
        {paymentMethods.map((method) => {
          const Icon = method.icon;
          return (
            <button
              key={method.id}
              onClick={() => setSelected(method.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                selected === method.id
                  ? "border-violet-500 bg-violet-500/5"
                  : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
              }`}
            >
              <div className={`p-2 rounded-lg ${selected === method.id ? "bg-violet-500/10" : "bg-zinc-800"}`}>
                <Icon size={20} className={selected === method.id ? "text-violet-400" : "text-zinc-400"} />
              </div>
              <span className="text-sm font-medium text-zinc-100">{method.label}</span>
              <div className={`ml-auto h-5 w-5 rounded-full border-2 ${
                selected === method.id ? "border-violet-500 bg-violet-500" : "border-zinc-600"
              }`}>
                {selected === method.id && (
                  <div className="h-full w-full rounded-full flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-white" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Card Form */}
      {selected === "card" && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4 mb-8">
          <Input label="Card Number" placeholder="4242 4242 4242 4242" id="cardNumber" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Expiry Date" placeholder="MM/YY" id="expiry" />
            <Input label="CVV" placeholder="123" id="cvv" type="password" />
          </div>
          <Input label="Cardholder Name" placeholder="John Doe" id="cardName" />
        </div>
      )}

      {/* Summary & Pay */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="flex justify-between items-center mb-6">
          <span className="text-zinc-400">Total Amount</span>
          <span className="text-2xl font-bold text-zinc-100">{formatCurrency(total)}</span>
        </div>

        <Button size="lg" className="w-full gap-2" onClick={handlePayment} isLoading={processing}>
          <Lock size={16} /> Pay {formatCurrency(total)}
        </Button>

        <p className="text-xs text-zinc-500 text-center mt-4 flex items-center justify-center gap-1">
          <Lock size={12} /> Secured by 256-bit SSL encryption
        </p>
      </div>
    </div>
  );
}
