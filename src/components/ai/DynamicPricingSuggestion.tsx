"use client";

import { TrendingUp, TrendingDown, Minus, Sparkles, X } from "lucide-react";
import { useState } from "react";

interface Props {
  currentPrice: number;
  category: string;
}

export default function DynamicPricingSuggestion({ currentPrice, category }: Props) {
  const [dismissed, setDismissed] = useState(false);

  // Simulated AI pricing suggestions
  const avgMarketPrice = currentPrice * (0.9 + Math.random() * 0.3);
  const suggestedPrice = Math.round(avgMarketPrice * 100) / 100;
  const diff = ((suggestedPrice - currentPrice) / currentPrice) * 100;

  if (dismissed || !currentPrice || currentPrice <= 0) return null;

  const isHigher = diff > 5;
  const isLower = diff < -5;

  return (
    <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={16} className="text-violet-400" />
          <span className="text-sm font-medium text-violet-400">AI Pricing Insight</span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-zinc-500 hover:text-zinc-300 cursor-pointer"
        >
          <X size={14} />
        </button>
      </div>
      <p className="text-sm text-zinc-300 mb-2">
        Average market price for <span className="text-zinc-100 font-medium">{category}</span> products:
        <span className="text-violet-400 font-semibold ml-1">${suggestedPrice.toFixed(2)}</span>
      </p>
      <div className="flex items-center gap-2">
        {isHigher ? (
          <>
            <TrendingUp size={14} className="text-emerald-400" />
            <span className="text-xs text-emerald-400">
              Your price is {Math.abs(diff).toFixed(1)}% below market — room to increase
            </span>
          </>
        ) : isLower ? (
          <>
            <TrendingDown size={14} className="text-orange-400" />
            <span className="text-xs text-orange-400">
              Your price is {Math.abs(diff).toFixed(1)}% above market — consider lowering
            </span>
          </>
        ) : (
          <>
            <Minus size={14} className="text-zinc-400" />
            <span className="text-xs text-zinc-400">Your price is competitive with the market</span>
          </>
        )}
      </div>
    </div>
  );
}
