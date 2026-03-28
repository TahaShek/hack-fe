export function cn(...classes: (string | boolean | number | undefined | null)[]): string {
  return classes.filter((c): c is string => typeof c === "string" && c.length > 0).join(" ");
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function formatRelativeTime(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const diff = now.getTime() - then.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function getStockColor(stock: number): string {
  if (stock === 0) return "text-red-500";
  if (stock <= 10) return "text-orange-500";
  if (stock <= 50) return "text-yellow-500";
  return "text-emerald-500";
}

export function getStockBgColor(stock: number): string {
  if (stock === 0) return "bg-red-500/10 text-red-500";
  if (stock <= 10) return "bg-orange-500/10 text-orange-500";
  if (stock <= 50) return "bg-yellow-500/10 text-yellow-500";
  return "bg-emerald-500/10 text-emerald-500";
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-500",
    confirmed: "bg-blue-500/10 text-blue-500",
    packed: "bg-indigo-500/10 text-indigo-500",
    shipped: "bg-purple-500/10 text-purple-500",
    delivered: "bg-emerald-500/10 text-emerald-500",
    cancelled: "bg-red-500/10 text-red-500",
    approved: "bg-emerald-500/10 text-emerald-500",
    rejected: "bg-red-500/10 text-red-500",
    active: "bg-emerald-500/10 text-emerald-500",
    blocked: "bg-red-500/10 text-red-500",
    suspended: "bg-orange-500/10 text-orange-500",
    completed: "bg-emerald-500/10 text-emerald-500",
    refunded: "bg-red-500/10 text-red-500",
  };
  return map[status] || "bg-zinc-500/10 text-zinc-500";
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}
