import Seller from "@/models/Seller";
import Product from "@/models/Product";
import Order from "@/models/Order";
import Coupon from "@/models/Coupon";
import mongoose from "mongoose";

function mapProductId(p: Record<string, unknown>): Record<string, unknown> {
  return { ...p, id: String(p._id), stock: p.stockQuantity ?? 0 };
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .concat("-", Date.now().toString(36));
}

export async function getDashboard(sellerId: string) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const [totalProducts, orders, recentOrders, lowStockProducts, prevPeriodOrders] =
    await Promise.all([
      Product.countDocuments({ sellerId }),
      Order.find({ sellerId }).select("totalAmount orderStatus createdAt buyerName orderNumber").lean(),
      Order.find({ sellerId })
        .sort({ createdAt: -1 })
        .limit(10)
        .select("orderNumber buyerName totalAmount orderStatus createdAt")
        .lean(),
      Product.find({ sellerId, stockQuantity: { $lte: 10 } })
        .select("name stockQuantity images")
        .limit(10)
        .lean(),
      Order.find({
        sellerId,
        createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
      })
        .select("totalAmount")
        .lean(),
    ]);

  const totalSales = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.orderStatus === "pending").length;

  // Current period revenue (last 30 days)
  const currentPeriodOrders = orders.filter(
    (o) => new Date(o.createdAt) >= thirtyDaysAgo
  );
  const currentRevenue = currentPeriodOrders.reduce(
    (sum, o) => sum + (o.totalAmount || 0),
    0
  );
  const prevRevenue = prevPeriodOrders.reduce(
    (sum, o) => sum + (o.totalAmount || 0),
    0
  );
  const revenueChange =
    prevRevenue > 0
      ? (((currentRevenue - prevRevenue) / prevRevenue) * 100).toFixed(1)
      : currentRevenue > 0
        ? "+100"
        : "0";

  // Build weekly sales data (last 7 days)
  const weeklySales = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    const daySales = orders
      .filter((o) => {
        const d = new Date(o.createdAt);
        return d >= dayStart && d < dayEnd;
      })
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    weeklySales.push({
      date: dayStart.toLocaleDateString("en-US", { weekday: "short" }),
      sales: Math.round(daySales * 100) / 100,
    });
  }

  // Build monthly sales data (last 6 months)
  const monthlySales = [];
  for (let i = 5; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const monthSales = orders
      .filter((o) => {
        const d = new Date(o.createdAt);
        return d >= month && d < nextMonth;
      })
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    monthlySales.push({
      date: month.toLocaleDateString("en-US", { month: "short" }),
      sales: Math.round(monthSales * 100) / 100,
    });
  }

  // Average order value
  const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  return {
    totalProducts,
    totalOrders,
    totalSales: Math.round(totalSales * 100) / 100,
    pendingOrders,
    totalRevenue: `$${totalSales.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    totalRevenueChange: `${Number(revenueChange) >= 0 ? "+" : ""}${revenueChange}%`,
    activeOrders: String(totalOrders),
    activeOrdersChange: `${pendingOrders} pending`,
    customerLTV: `$${avgOrderValue.toFixed(0)}`,
    customerLTVChange: `${totalProducts} products`,
    conversionRate: totalOrders > 0 ? `${((totalOrders / Math.max(totalProducts, 1)) * 10).toFixed(1)}%` : "0%",
    conversionRateChange: `${totalOrders} total orders`,
    weeklySales,
    monthlySales,
    recentOrders: recentOrders.map((o) => ({
      id: o._id?.toString(),
      orderNumber: o.orderNumber,
      buyerName: o.buyerName,
      status: o.orderStatus,
      total: o.totalAmount,
      createdAt: o.createdAt,
    })),
    lowStockProducts: lowStockProducts.map((p) => ({
      id: p._id?.toString(),
      name: p.name,
      stock: p.stockQuantity,
      images: p.images,
    })),
  };
}

export async function getProducts(
  sellerId: string,
  page = 1,
  limit = 10,
  search?: string,
  status?: string,
  category?: string,
  sort?: string
) {
  const query: Record<string, unknown> = { sellerId };
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { skuCode: { $regex: search, $options: "i" } },
    ];
  }
  if (status) query.status = status;
  if (category) query.category = category;

  let sortObj: Record<string, 1 | -1> = { createdAt: -1 };
  if (sort === "price_asc") sortObj = { price: 1 };
  else if (sort === "price_desc") sortObj = { price: -1 };
  else if (sort === "name_asc") sortObj = { name: 1 };
  else if (sort === "stock_asc") sortObj = { stockQuantity: 1 };

  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find(query).sort(sortObj).skip(skip).limit(limit).lean(),
    Product.countDocuments(query),
  ]);

  return {
    products: products.map((p) => mapProductId(p as unknown as Record<string, unknown>)),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

interface CreateProductInput {
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  price: number;
  compareAtPrice?: number;
  variants?: Array<{
    id?: string;
    name: string;
    type?: string;
    options: Array<{ id?: string; value: string; price?: number; stock?: number }>;
  }>;
  skuCode?: string;
  stock?: number;
  stockQuantity?: number;
  images?: string[];
  tags?: string[];
}

export async function createProduct(sellerId: string, input: CreateProductInput) {
  const slug = generateSlug(input.name);
  const stockQuantity = input.stockQuantity ?? input.stock ?? 0;
  const skuCode = input.skuCode || `SKU-${Date.now().toString(36).toUpperCase()}`;

  const product = await Product.create({
    name: input.name,
    description: input.description,
    category: input.category,
    subcategory: input.subcategory,
    price: input.price,
    compareAtPrice: input.compareAtPrice,
    variants: input.variants,
    images: input.images || [],
    tags: input.tags || [],
    skuCode,
    stockQuantity,
    sellerId,
    slug,
    status: "pending",
    isApproved: false,
    isFlagged: false,
  });

  return product;
}

export async function updateProduct(
  sellerId: string,
  productId: string,
  input: Partial<CreateProductInput>
) {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw { status: 400, message: "Invalid product ID" };
  }

  const product = await Product.findOne({ _id: productId, sellerId });
  if (!product) {
    throw { status: 404, message: "Product not found" };
  }

  if (input.name && input.name !== product.name) {
    product.slug = generateSlug(input.name);
  }

  Object.assign(product, input);
  await product.save();

  return product;
}

export async function deleteProduct(sellerId: string, productId: string) {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw { status: 400, message: "Invalid product ID" };
  }

  const product = await Product.findOneAndDelete({ _id: productId, sellerId });
  if (!product) {
    throw { status: 404, message: "Product not found" };
  }

  return { message: "Product deleted successfully" };
}

export async function getInventory(
  sellerId: string,
  page = 1,
  limit = 20,
  search?: string,
  stockFilter?: string
) {
  const query: Record<string, unknown> = { sellerId };
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { skuCode: { $regex: search, $options: "i" } },
    ];
  }
  if (stockFilter === "low") query.stockQuantity = { $gt: 0, $lte: 10 };
  else if (stockFilter === "out") query.stockQuantity = 0;
  else if (stockFilter === "in") query.stockQuantity = { $gt: 10 };

  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find(query)
      .select("name skuCode stockQuantity price images category")
      .sort({ stockQuantity: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(query),
  ]);

  return {
    products: products.map((p) => mapProductId(p as unknown as Record<string, unknown>)),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

export async function updateStock(
  sellerId: string,
  productId: string,
  stockQuantity: number
) {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw { status: 400, message: "Invalid product ID" };
  }

  const product = await Product.findOneAndUpdate(
    { _id: productId, sellerId },
    { stockQuantity },
    { new: true, runValidators: true }
  );

  if (!product) {
    throw { status: 404, message: "Product not found" };
  }

  return product;
}

export async function getOrders(
  sellerId: string,
  page = 1,
  limit = 10,
  status?: string,
  search?: string
) {
  const query: Record<string, unknown> = {
    sellerId,
    // Only show orders where payment completed (exclude failed card attempts)
    paymentStatus: "completed",
  };
  if (status) query.orderStatus = status;
  if (search) {
    query.$or = [
      { orderNumber: { $regex: search, $options: "i" } },
      { buyerName: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;

  const [rawOrders, total] = await Promise.all([
    Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Order.countDocuments(query),
  ]);

  const orders = rawOrders.map((o) => ({
    ...o,
    id: o._id?.toString(),
    total: o.totalAmount,
    status: o.orderStatus,
  }));

  return {
    orders,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

export async function updateOrderStatus(
  sellerId: string,
  orderId: string,
  status: string,
  trackingId?: string
) {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw { status: 400, message: "Invalid order ID" };
  }

  const validTransitions: Record<string, string[]> = {
    pending: ["confirmed"],
    confirmed: ["packed"],
    packed: ["shipped"],
    shipped: ["delivered"],
  };

  const order = await Order.findOne({ _id: orderId, sellerId });
  if (!order) {
    throw { status: 404, message: "Order not found" };
  }

  const allowed = validTransitions[order.orderStatus] || [];
  if (!allowed.includes(status)) {
    throw {
      status: 400,
      message: `Cannot transition from "${order.orderStatus}" to "${status}"`,
    };
  }

  if (status === "shipped" && !trackingId) {
    throw { status: 400, message: "Tracking ID required when marking as shipped" };
  }

  order.orderStatus = status as "confirmed" | "packed" | "shipped" | "delivered";
  if (trackingId) order.trackingId = trackingId;
  await order.save();

  const obj = order.toObject();
  return {
    ...obj,
    id: obj._id?.toString(),
    total: obj.totalAmount,
    status: obj.orderStatus,
  };
}

export async function getAnalytics(sellerId: string, period = "30d") {
  let daysBack = 30;
  if (period === "7d") daysBack = 7;
  else if (period === "90d") daysBack = 90;
  else if (period === "1y") daysBack = 365;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);

  const [salesData, topProducts, orderStats] = await Promise.all([
    Order.aggregate([
      { $match: { sellerId: new mongoose.Types.ObjectId(sellerId), createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          sales: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Order.aggregate([
      { $match: { sellerId: new mongoose.Types.ObjectId(sellerId), createdAt: { $gte: startDate } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          name: { $first: "$items.productName" },
          totalSold: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
    ]),
    Order.aggregate([
      { $match: { sellerId: new mongoose.Types.ObjectId(sellerId), createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: "$orderStatus",
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  return {
    salesData: salesData.map((d) => ({
      date: d._id as string,
      sales: d.sales as number,
      orders: d.orders as number,
    })),
    topProducts,
    orderStats: orderStats.reduce(
      (acc, s) => {
        acc[s._id as string] = s.count as number;
        return acc;
      },
      {} as Record<string, number>
    ),
  };
}

export async function getCoupons(
  sellerId: string,
  page = 1,
  limit = 10
) {
  const skip = (page - 1) * limit;

  const [coupons, total] = await Promise.all([
    Coupon.find({ sellerId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Coupon.countDocuments({ sellerId }),
  ]);

  return {
    coupons,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

interface CreateCouponInput {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  usageLimit?: number;
  startDate: string;
  endDate: string;
}

export async function createCoupon(sellerId: string, input: CreateCouponInput) {
  const existing = await Coupon.findOne({
    code: input.code.toUpperCase(),
    sellerId,
  });
  if (existing) {
    throw { status: 409, message: "Coupon code already exists" };
  }

  const coupon = await Coupon.create({
    ...input,
    sellerId,
    code: input.code.toUpperCase(),
    startDate: new Date(input.startDate),
    endDate: new Date(input.endDate),
  });

  return coupon;
}

export async function updateCoupon(
  sellerId: string,
  couponId: string,
  input: Partial<CreateCouponInput> & { isActive?: boolean }
) {
  if (!mongoose.Types.ObjectId.isValid(couponId)) {
    throw { status: 400, message: "Invalid coupon ID" };
  }

  const coupon = await Coupon.findOne({ _id: couponId, sellerId });
  if (!coupon) {
    throw { status: 404, message: "Coupon not found" };
  }

  if (input.code) coupon.code = input.code.toUpperCase();
  if (input.discountType) coupon.discountType = input.discountType;
  if (input.discountValue !== undefined) coupon.discountValue = input.discountValue;
  if (input.minOrderAmount !== undefined) coupon.minOrderAmount = input.minOrderAmount;
  if (input.maxDiscount !== undefined) coupon.maxDiscount = input.maxDiscount;
  if (input.usageLimit !== undefined) coupon.usageLimit = input.usageLimit;
  if (input.startDate) coupon.startDate = new Date(input.startDate);
  if (input.endDate) coupon.endDate = new Date(input.endDate);
  if (input.isActive !== undefined) coupon.isActive = input.isActive;

  await coupon.save();
  return coupon;
}

export async function deleteCoupon(sellerId: string, couponId: string) {
  if (!mongoose.Types.ObjectId.isValid(couponId)) {
    throw { status: 400, message: "Invalid coupon ID" };
  }

  const coupon = await Coupon.findOneAndDelete({ _id: couponId, sellerId });
  if (!coupon) {
    throw { status: 404, message: "Coupon not found" };
  }

  return { message: "Coupon deleted successfully" };
}

export async function getSettings(sellerId: string) {
  const seller = await Seller.findById(sellerId).select("-passwordHash -bankDetails");
  if (!seller) {
    throw { status: 404, message: "Seller not found" };
  }
  return seller;
}

export async function updateSettings(
  sellerId: string,
  input: {
    storeName?: string;
    ownerName?: string;
    phone?: string;
    storeDescription?: string;
    storeLogoUrl?: string;
    businessAddress?: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  }
) {
  const seller = await Seller.findByIdAndUpdate(sellerId, input, {
    new: true,
    runValidators: true,
  }).select("-passwordHash -bankDetails");

  if (!seller) {
    throw { status: 404, message: "Seller not found" };
  }

  return seller;
}
