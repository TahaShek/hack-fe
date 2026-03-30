export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  avatar?: string;
  role: "buyer" | "seller" | "admin";
  status: "active" | "blocked" | "suspended";
  createdAt: string;
}

export interface Product {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  category: string;
  subcategory?: string;
  variants: ProductVariant[];
  stock: number;
  rating: number;
  reviewCount: number;
  sellerId: string;
  sellerName: string;
  status: "pending" | "approved" | "rejected";
  tags: string[];
  createdAt: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  type: "size" | "color" | "material" | "custom";
  options: VariantOption[];
}

export interface VariantOption {
  id: string;
  value: string;
  price?: number;
  stock: number;
}

export interface CartItem {
  id: string;
  _id?: string;
  product: Product;
  quantity: number;
  selectedVariants: Record<string, string>;
}

export interface Order {
  id: string;
  _id?: string;
  orderNumber: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  items: OrderItem[];
  status: OrderStatus;
  trackingId?: string;
  estimatedDeliveryDate?: string;
  deliveryMethod?: string;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: Address;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  id: string;
  _id?: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  variants: Record<string, string>;
}

export interface Address {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  images?: string[];
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  productCount: number;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface ChatMessage {
  id: string;
  _id?: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: "text" | "image";
  imageUrl?: string;
  seen: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  _id?: string;
  participants: { id: string; name: string; avatar?: string }[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  updatedAt: string;
}

export interface Notification {
  id: string;
  _id?: string;
  type: "order" | "promo" | "system" | "chat";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface PlatformMetrics {
  totalBuyers: number;
  totalSellers: number;
  totalOrders: number;
  totalRevenue: number;
  buyerGrowth: number;
  sellerGrowth: number;
  orderGrowth: number;
  revenueGrowth: number;
}

export interface SalesData {
  date: string;
  sales: number;
  orders: number;
  revenue: number;
}

export interface Transaction {
  id: string;
  orderId: string;
  buyerName: string;
  sellerName: string;
  amount: number;
  platformFee: number;
  status: "completed" | "pending" | "refunded";
  createdAt: string;
}
