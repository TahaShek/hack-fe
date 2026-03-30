"use client";

const ITEMS = [
  "New Arrivals Daily",
  "Complimentary Global Shipping",
  "Curated In Stockholm",
  "Limited Release Editions",
  "Sustainable Sourcing Only",
  "Quality Engineering First",
];

export default function MarqueeTicker() {
  const renderItems = () =>
    ITEMS.map((text, i) => (
      <span key={i} className="flex items-center gap-12 shrink-0 mx-6">
        <span className="text-[11px] font-medium text-white uppercase tracking-[0.1rem] whitespace-nowrap">{text}</span>
      </span>
    ));

  return (
    <div className="w-full bg-[#0D0D0D] py-4 overflow-hidden border-y border-white/5">
      <div className="animate-marquee flex whitespace-nowrap gap-12 items-center">
        {renderItems()}
        {renderItems()}
        {renderItems()}
        {renderItems()}
      </div>
    </div>
  );
}
