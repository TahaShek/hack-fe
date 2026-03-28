import type {
  Product,
  Order,
  Review,
  Conversation,
  ChatMessage,
  Notification,
  SalesData,
  Transaction,
  User,
  Coupon,
} from "@/types";

export const mockProducts: Product[] = Array.from({ length: 24 }, (_, i) => ({
  id: `prod-${i + 1}`,
  name: [
    "Wireless Noise-Cancelling Headphones",
    "Smart Fitness Watch Pro",
    "Organic Cotton T-Shirt",
    "Minimalist Leather Wallet",
    "Portable Bluetooth Speaker",
    "Ultra-Slim Laptop Stand",
    "Premium Yoga Mat",
    "Stainless Steel Water Bottle",
    "Mechanical Gaming Keyboard",
    "Ceramic Coffee Mug Set",
    "Running Shoes Elite",
    "Bamboo Desk Organizer",
    "Wireless Charging Pad",
    "Vintage Sunglasses",
    "Smart Home Hub",
    "Eco-Friendly Backpack",
    "Digital Drawing Tablet",
    "Aromatherapy Diffuser",
    "Compression Socks Pack",
    "LED Desk Lamp",
    "Noise Machine Sleep Aid",
    "Travel Packing Cubes",
    "Resistance Bands Set",
    "Insulated Lunch Box",
  ][i],
  slug: `product-${i + 1}`,
  description:
    "Premium quality product crafted with attention to detail. Features innovative design and sustainable materials for an exceptional user experience. Perfect for everyday use with durability built to last.",
  price: [79.99, 199.99, 29.99, 49.99, 59.99, 39.99, 45.99, 24.99, 129.99, 34.99, 119.99, 27.99, 34.99, 89.99, 149.99, 69.99, 249.99, 39.99, 19.99, 54.99, 44.99, 32.99, 22.99, 28.99][i],
  compareAtPrice: i % 3 === 0 ? [99.99, 249.99, 39.99, 69.99, 79.99, 59.99, 59.99, 34.99, 159.99, 49.99, 149.99, 39.99, 49.99, 119.99, 199.99, 89.99, 299.99, 54.99, 29.99, 74.99, 59.99, 44.99, 34.99, 39.99][i] : undefined,
  images: [
    `https://picsum.photos/seed/${i + 1}/600/600`,
    `https://picsum.photos/seed/${i + 100}/600/600`,
    `https://picsum.photos/seed/${i + 200}/600/600`,
    `https://picsum.photos/seed/${i + 300}/600/600`,
  ],
  category: ["Electronics", "Electronics", "Fashion", "Fashion", "Electronics", "Home & Garden", "Sports", "Home & Garden", "Electronics", "Home & Garden", "Sports", "Home & Garden", "Electronics", "Fashion", "Electronics", "Fashion", "Electronics", "Home & Garden", "Sports", "Home & Garden", "Electronics", "Fashion", "Sports", "Home & Garden"][i],
  variants: [
    {
      id: `var-${i}-1`,
      name: "Size",
      type: "size" as const,
      options: [
        { id: "s", value: "S", stock: 15 },
        { id: "m", value: "M", stock: 25 },
        { id: "l", value: "L", stock: 10 },
      ],
    },
    {
      id: `var-${i}-2`,
      name: "Color",
      type: "color" as const,
      options: [
        { id: "black", value: "Black", stock: 20 },
        { id: "white", value: "White", stock: 18 },
        { id: "navy", value: "Navy", stock: 12 },
      ],
    },
  ],
  stock: [50, 12, 0, 100, 8, 45, 30, 5, 75, 22, 60, 3, 40, 15, 90, 35, 10, 55, 200, 7, 25, 42, 80, 18][i],
  rating: [4.5, 4.8, 4.2, 4.6, 4.3, 4.7, 4.4, 4.9, 4.1, 4.5, 4.6, 4.3, 4.8, 4.2, 4.7, 4.4, 4.5, 4.6, 4.0, 4.8, 4.3, 4.5, 4.7, 4.1][i],
  reviewCount: [128, 256, 64, 89, 45, 312, 78, 190, 156, 34, 220, 12, 167, 93, 278, 56, 145, 201, 23, 334, 67, 112, 189, 41][i],
  sellerId: `seller-${(i % 5) + 1}`,
  sellerName: ["TechVault", "StyleHub", "HomeNest", "SportZone", "BookWorm"][(i % 5)],
  status: "approved",
  tags: ["trending", "new", "sale", "bestseller", "eco-friendly"].slice(0, (i % 3) + 1),
  createdAt: new Date(2026, 0, i + 1).toISOString(),
}));

export const mockOrders: Order[] = Array.from({ length: 10 }, (_, i) => ({
  id: `order-${i + 1}`,
  orderNumber: `NXM-${String(10001 + i)}`,
  buyerId: "buyer-1",
  buyerName: "John Doe",
  sellerId: `seller-${(i % 3) + 1}`,
  sellerName: ["TechVault", "StyleHub", "HomeNest"][(i % 3)],
  items: [
    {
      id: `item-${i}-1`,
      productId: mockProducts[i].id,
      productName: mockProducts[i].name,
      productImage: mockProducts[i].images[0],
      quantity: (i % 3) + 1,
      price: mockProducts[i].price,
      variants: { Size: "M", Color: "Black" },
    },
  ],
  status: (["pending", "confirmed", "packed", "shipped", "delivered", "cancelled"] as const)[i % 6],
  trackingId: i % 3 === 0 ? `TRK${100000 + i}` : undefined,
  subtotal: mockProducts[i].price * ((i % 3) + 1),
  discount: i % 2 === 0 ? 10 : 0,
  shipping: 5.99,
  tax: mockProducts[i].price * ((i % 3) + 1) * 0.08,
  total: mockProducts[i].price * ((i % 3) + 1) * 1.08 + 5.99 - (i % 2 === 0 ? 10 : 0),
  shippingAddress: {
    fullName: "John Doe",
    phone: "+1 555-0123",
    street: "123 Main St",
    city: "San Francisco",
    state: "CA",
    zipCode: "94105",
    country: "US",
  },
  paymentMethod: "Credit Card",
  createdAt: new Date(2026, 2, 28 - i).toISOString(),
  updatedAt: new Date(2026, 2, 28 - i + 1).toISOString(),
}));

export const mockReviews: Review[] = Array.from({ length: 6 }, (_, i) => ({
  id: `review-${i + 1}`,
  userId: `user-${i + 1}`,
  userName: ["Alice M.", "Bob K.", "Carol S.", "Dave R.", "Eve L.", "Frank W."][i],
  rating: [5, 4, 5, 3, 4, 5][i],
  comment: [
    "Absolutely love this product! The quality exceeded my expectations. Would definitely buy again.",
    "Great value for money. Shipping was fast and the product was well-packaged.",
    "Perfect for daily use. The design is sleek and modern. Highly recommend!",
    "Good product overall, but could improve on the packaging. Still satisfied.",
    "Very happy with this purchase. Works exactly as described.",
    "Outstanding quality! This is now my go-to brand for these products.",
  ][i],
  createdAt: new Date(2026, 2, 20 - i).toISOString(),
}));

export const mockConversations: Conversation[] = [
  {
    id: "conv-1",
    participants: [
      { id: "buyer-1", name: "John Doe" },
      { id: "seller-1", name: "TechVault" },
    ],
    lastMessage: {
      id: "msg-5",
      conversationId: "conv-1",
      senderId: "seller-1",
      senderName: "TechVault",
      content: "Yes, we have it in stock! Would you like to place an order?",
      type: "text",
      seen: false,
      createdAt: new Date(2026, 2, 28, 14, 30).toISOString(),
    },
    unreadCount: 1,
    updatedAt: new Date(2026, 2, 28, 14, 30).toISOString(),
  },
  {
    id: "conv-2",
    participants: [
      { id: "buyer-1", name: "John Doe" },
      { id: "seller-2", name: "StyleHub" },
    ],
    lastMessage: {
      id: "msg-10",
      conversationId: "conv-2",
      senderId: "buyer-1",
      senderName: "John Doe",
      content: "Thanks for the quick response!",
      type: "text",
      seen: true,
      createdAt: new Date(2026, 2, 27, 10, 15).toISOString(),
    },
    unreadCount: 0,
    updatedAt: new Date(2026, 2, 27, 10, 15).toISOString(),
  },
  {
    id: "conv-3",
    participants: [
      { id: "buyer-1", name: "John Doe" },
      { id: "seller-3", name: "HomeNest" },
    ],
    lastMessage: {
      id: "msg-15",
      conversationId: "conv-3",
      senderId: "seller-3",
      senderName: "HomeNest",
      content: "Your order has been shipped! Tracking ID: TRK100234",
      type: "text",
      seen: true,
      createdAt: new Date(2026, 2, 26, 16, 45).toISOString(),
    },
    unreadCount: 0,
    updatedAt: new Date(2026, 2, 26, 16, 45).toISOString(),
  },
];

export const mockChatMessages: ChatMessage[] = [
  {
    id: "msg-1",
    conversationId: "conv-1",
    senderId: "buyer-1",
    senderName: "John Doe",
    content: "Hi, I'm interested in the Wireless Headphones. Is it still available?",
    type: "text",
    seen: true,
    createdAt: new Date(2026, 2, 28, 14, 0).toISOString(),
  },
  {
    id: "msg-2",
    conversationId: "conv-1",
    senderId: "seller-1",
    senderName: "TechVault",
    content: "Hello! Thanks for reaching out. Let me check our inventory.",
    type: "text",
    seen: true,
    createdAt: new Date(2026, 2, 28, 14, 5).toISOString(),
  },
  {
    id: "msg-3",
    conversationId: "conv-1",
    senderId: "seller-1",
    senderName: "TechVault",
    content: "Here's the product image for reference:",
    type: "text",
    seen: true,
    createdAt: new Date(2026, 2, 28, 14, 10).toISOString(),
  },
  {
    id: "msg-4",
    conversationId: "conv-1",
    senderId: "seller-1",
    senderName: "TechVault",
    content: "",
    type: "image",
    imageUrl: "https://picsum.photos/seed/headphones/400/300",
    seen: true,
    createdAt: new Date(2026, 2, 28, 14, 11).toISOString(),
  },
  {
    id: "msg-5",
    conversationId: "conv-1",
    senderId: "seller-1",
    senderName: "TechVault",
    content: "Yes, we have it in stock! Would you like to place an order?",
    type: "text",
    seen: false,
    createdAt: new Date(2026, 2, 28, 14, 30).toISOString(),
  },
];

export const mockNotifications: Notification[] = [
  { id: "n-1", type: "order", title: "Order Shipped", message: "Your order NXM-10001 has been shipped!", read: false, createdAt: new Date(2026, 2, 28, 12, 0).toISOString() },
  { id: "n-2", type: "promo", title: "Flash Sale!", message: "Up to 50% off on Electronics this weekend!", read: false, createdAt: new Date(2026, 2, 28, 10, 0).toISOString() },
  { id: "n-3", type: "order", title: "Order Delivered", message: "Your order NXM-10003 has been delivered.", read: true, createdAt: new Date(2026, 2, 27, 15, 0).toISOString() },
  { id: "n-4", type: "system", title: "Welcome!", message: "Thanks for joining NexaMarket!", read: true, createdAt: new Date(2026, 2, 25, 9, 0).toISOString() },
];

export const mockSalesData: SalesData[] = [
  { date: "Mon", sales: 4200, orders: 32, revenue: 4200 },
  { date: "Tue", sales: 3800, orders: 28, revenue: 3800 },
  { date: "Wed", sales: 5100, orders: 41, revenue: 5100 },
  { date: "Thu", sales: 4600, orders: 35, revenue: 4600 },
  { date: "Fri", sales: 6200, orders: 48, revenue: 6200 },
  { date: "Sat", sales: 7800, orders: 62, revenue: 7800 },
  { date: "Sun", sales: 5400, orders: 43, revenue: 5400 },
];

export const mockMonthlySalesData: SalesData[] = [
  { date: "Jan", sales: 42000, orders: 320, revenue: 42000 },
  { date: "Feb", sales: 38000, orders: 280, revenue: 38000 },
  { date: "Mar", sales: 51000, orders: 410, revenue: 51000 },
  { date: "Apr", sales: 46000, orders: 350, revenue: 46000 },
  { date: "May", sales: 62000, orders: 480, revenue: 62000 },
  { date: "Jun", sales: 58000, orders: 440, revenue: 58000 },
];

export const mockTransactions: Transaction[] = Array.from({ length: 10 }, (_, i) => ({
  id: `txn-${i + 1}`,
  orderId: `NXM-${10001 + i}`,
  buyerName: ["John Doe", "Jane Smith", "Bob Wilson", "Alice Chen", "Mike Brown"][i % 5],
  sellerName: ["TechVault", "StyleHub", "HomeNest"][i % 3],
  amount: [86.38, 215.98, 32.38, 107.98, 64.78, 43.18, 49.56, 26.98, 140.38, 37.78][i],
  platformFee: [8.64, 21.60, 3.24, 10.80, 6.48, 4.32, 4.96, 2.70, 14.04, 3.78][i],
  status: (["completed", "completed", "pending", "completed", "refunded", "completed", "completed", "pending", "completed", "completed"] as const)[i],
  createdAt: new Date(2026, 2, 28 - i).toISOString(),
}));

export const mockUsers: User[] = [
  { id: "buyer-1", name: "John Doe", email: "john@example.com", role: "buyer", status: "active", createdAt: "2026-01-15T00:00:00Z" },
  { id: "buyer-2", name: "Jane Smith", email: "jane@example.com", role: "buyer", status: "active", createdAt: "2026-02-01T00:00:00Z" },
  { id: "buyer-3", name: "Bob Wilson", email: "bob@example.com", role: "buyer", status: "suspended", createdAt: "2026-02-10T00:00:00Z" },
  { id: "seller-1", name: "TechVault", email: "tech@vault.com", role: "seller", status: "active", createdAt: "2026-01-01T00:00:00Z" },
  { id: "seller-2", name: "StyleHub", email: "style@hub.com", role: "seller", status: "active", createdAt: "2026-01-05T00:00:00Z" },
  { id: "seller-3", name: "HomeNest", email: "home@nest.com", role: "seller", status: "blocked", createdAt: "2026-01-20T00:00:00Z" },
  { id: "admin-1", name: "Admin User", email: "admin@nexamarket.com", role: "admin", status: "active", createdAt: "2025-12-01T00:00:00Z" },
];

export const mockCoupons: Coupon[] = [
  { id: "c-1", code: "SAVE20", type: "percentage", value: 20, minOrder: 50, maxDiscount: 30, usageLimit: 100, usedCount: 45, startDate: "2026-03-01T00:00:00Z", endDate: "2026-04-01T00:00:00Z", isActive: true },
  { id: "c-2", code: "FLAT10", type: "fixed", value: 10, minOrder: 30, usageLimit: 200, usedCount: 120, startDate: "2026-03-15T00:00:00Z", endDate: "2026-03-31T00:00:00Z", isActive: true },
  { id: "c-3", code: "WELCOME15", type: "percentage", value: 15, minOrder: 0, maxDiscount: 20, usageLimit: 500, usedCount: 340, startDate: "2026-01-01T00:00:00Z", endDate: "2026-12-31T00:00:00Z", isActive: true },
];
