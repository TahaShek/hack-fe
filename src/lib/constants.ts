export const APP_NAME = "MARKIT";

export const NAV_LINKS = [
  { label: "Shop", href: "/products" },
  { label: "Categories", href: "/products?view=categories" },
  { label: "Deals", href: "/products?sort=deals" },
  { label: "About", href: "#" },
];

export const CATEGORIES = [
  { id: "1", name: "Electronics", slug: "electronics", icon: "Smartphone", productCount: 1240 },
  { id: "2", name: "Fashion", slug: "fashion", icon: "Shirt", productCount: 3560 },
  { id: "3", name: "Home & Kitchen", slug: "home-kitchen", icon: "Home", productCount: 890 },
  { id: "4", name: "Sports", slug: "sports", icon: "Dumbbell", productCount: 720 },
  { id: "5", name: "Books", slug: "books", icon: "BookOpen", productCount: 2100 },
  { id: "6", name: "Beauty", slug: "beauty", icon: "Sparkles", productCount: 1560 },
  { id: "7", name: "Toys", slug: "toys", icon: "Gamepad2", productCount: 430 },
  { id: "8", name: "Automotive", slug: "automotive", icon: "Car", productCount: 310 },
];

export const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Most Popular", value: "popular" },
  { label: "Top Rated", value: "rating" },
  { label: "Best Deals", value: "deals" },
];

export const ORDER_STATUS_PIPELINE: Array<{ status: string; label: string }> = [
  { status: "pending", label: "Pending" },
  { status: "confirmed", label: "Confirmed" },
  { status: "packed", label: "Packed" },
  { status: "shipped", label: "Shipped" },
  { status: "delivered", label: "Delivered" },
];
