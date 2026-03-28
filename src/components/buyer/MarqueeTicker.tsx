"use client";

const ITEMS = ["Free shipping above PKR 2000", "10,000+ happy buyers", "New arrivals weekly", "Trusted sellers", "AI-powered search"];

export default function MarqueeTicker() {
  const renderItems = () =>
    ITEMS.map((text, i) => (
      <span key={i} className="flex items-center gap-8 shrink-0 mx-8">
        <span className="text-xs text-[#6B7280] tracking-[0.2em] uppercase font-medium whitespace-nowrap">{text}</span>
        <span className="text-accent text-xs">&bull;</span>
      </span>
    ));

  return (
    <div className="relative bg-[#111111] border-y border-[rgba(255,255,255,0.06)] py-4 overflow-hidden">
      <div className="animate-marquee flex">
        {renderItems()}
        {renderItems()}
        {renderItems()}
        {renderItems()}
      </div>
    </div>
  );
}
