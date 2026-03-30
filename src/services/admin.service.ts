import User from "@/models/User";
import Seller from "@/models/Seller";
import Product from "@/models/Product";
import Order from "@/models/Order";
import Transaction from "@/models/Transaction";
import mongoose from "mongoose";

export async function getDashboard() {
  const [totalBuyers, totalSellers, totalOrders, revenueResult, recentOrders] =
    await Promise.all([
      User.countDocuments(),
      Seller.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: "completed" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("orderNumber buyerName totalAmount orderStatus createdAt")
        .lean(),
    ]);

  const totalRevenue =
    revenueResult.length > 0 ? (revenueResult[0].total as number) : 0;

  // Growth calculations (last 30 days vs previous 30)
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const [currentBuyers, previousBuyers, currentSellers, previousSellers] =
    await Promise.all([
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      User.countDocuments({
        createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
      }),
      Seller.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Seller.countDocuments({
        createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
      }),
    ]);

  const calcGrowth = (current: number, previous: number) =>
    previous === 0 ? (current > 0 ? 100 : 0) : Math.round(((current - previous) / previous) * 100);

  return {
    totalBuyers,
    totalSellers,
    totalOrders,
    totalRevenue,
    buyerGrowth: calcGrowth(currentBuyers, previousBuyers),
    sellerGrowth: calcGrowth(currentSellers, previousSellers),
    recentOrders,
  };
}

export async function getUsers(
  page = 1,
  limit = 20,
  role?: string,
  search?: string,
  status?: string
) {
  const skip = (page - 1) * limit;
  const results: {
    users: Array<Record<string, unknown>>;
    pagination: { page: number; limit: number; total: number; pages: number };
  } = { users: [], pagination: { page, limit, total: 0, pages: 0 } };

  if (!role || role === "buyer") {
    const buyerQuery: Record<string, unknown> = {};
    if (search) {
      buyerQuery.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (status) buyerQuery.status = status;

    const [buyers, buyerCount] = await Promise.all([
      User.find(buyerQuery)
        .select("-passwordHash")
        .sort({ createdAt: -1 })
        .skip(role === "buyer" ? skip : 0)
        .limit(role === "buyer" ? limit : 10)
        .lean(),
      User.countDocuments(buyerQuery),
    ]);

    const mappedBuyers = buyers.map((b) => ({
      ...b,
      role: "buyer" as const,
      name: b.fullName,
    }));

    if (role === "buyer") {
      return {
        users: mappedBuyers,
        pagination: { page, limit, total: buyerCount, pages: Math.ceil(buyerCount / limit) },
      };
    }
    results.users.push(...mappedBuyers);
    results.pagination.total += buyerCount;
  }

  if (!role || role === "seller") {
    const sellerQuery: Record<string, unknown> = {};
    if (search) {
      sellerQuery.$or = [
        { storeName: { $regex: search, $options: "i" } },
        { ownerName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (status) sellerQuery.status = status;

    const [sellers, sellerCount] = await Promise.all([
      Seller.find(sellerQuery)
        .select("-passwordHash -bankDetails")
        .sort({ createdAt: -1 })
        .skip(role === "seller" ? skip : 0)
        .limit(role === "seller" ? limit : 10)
        .lean(),
      Seller.countDocuments(sellerQuery),
    ]);

    const mappedSellers = sellers.map((s) => ({
      ...s,
      role: "seller" as const,
      name: s.storeName,
    }));

    if (role === "seller") {
      return {
        users: mappedSellers,
        pagination: { page, limit, total: sellerCount, pages: Math.ceil(sellerCount / limit) },
      };
    }
    results.users.push(...mappedSellers);
    results.pagination.total += sellerCount;
  }

  results.users.sort(
    (a, b) =>
      new Date(b.createdAt as string).getTime() -
      new Date(a.createdAt as string).getTime()
  );
  results.users = results.users.slice(skip, skip + limit);
  results.pagination.pages = Math.ceil(results.pagination.total / limit);

  return results;
}

export async function blockUser(userId: string, role: string) {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw { status: 400, message: "Invalid user ID" };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Model = (role === "seller" ? Seller : User) as any;
  const user = await Model.findByIdAndUpdate(
    userId,
    { status: "blocked" },
    { new: true }
  ).select("-passwordHash -bankDetails");

  if (!user) {
    throw { status: 404, message: "User not found" };
  }

  return user;
}

export async function suspendUser(userId: string, role: string) {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw { status: 400, message: "Invalid user ID" };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Model = (role === "seller" ? Seller : User) as any;
  const user = await Model.findByIdAndUpdate(
    userId,
    { status: "suspended" },
    { new: true }
  ).select("-passwordHash -bankDetails");

  if (!user) {
    throw { status: 404, message: "User not found" };
  }

  return user;
}

export async function activateUser(userId: string, role: string) {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw { status: 400, message: "Invalid user ID" };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Model = (role === "seller" ? Seller : User) as any;
  const user = await Model.findByIdAndUpdate(
    userId,
    { status: "active" },
    { new: true }
  ).select("-passwordHash -bankDetails");

  if (!user) {
    throw { status: 404, message: "User not found" };
  }

  return user;
}

export async function getPendingProducts(page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find({ status: "pending" })
      .populate("sellerId", "storeName ownerName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments({ status: "pending" }),
  ]);

  return {
    products,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

export async function approveProduct(productId: string) {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw { status: 400, message: "Invalid product ID" };
  }

  const product = await Product.findByIdAndUpdate(
    productId,
    { status: "approved", isApproved: true },
    { new: true }
  );

  if (!product) {
    throw { status: 404, message: "Product not found" };
  }

  return product;
}

export async function rejectProduct(productId: string, reason?: string) {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw { status: 400, message: "Invalid product ID" };
  }

  const update: Record<string, unknown> = {
    status: "rejected",
    isApproved: false,
  };
  if (reason) update.isFlagged = true;

  const product = await Product.findByIdAndUpdate(productId, update, {
    new: true,
  });

  if (!product) {
    throw { status: 404, message: "Product not found" };
  }

  return product;
}

export async function getOrders(
  page = 1,
  limit = 20,
  status?: string,
  search?: string
) {
  const query: Record<string, unknown> = {};
  if (status) query.orderStatus = status;
  if (search) {
    query.$or = [
      { orderNumber: { $regex: search, $options: "i" } },
      { buyerName: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Order.countDocuments(query),
  ]);

  return {
    orders,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

export async function getTransactions(
  page = 1,
  limit = 20,
  status?: string
) {
  const query: Record<string, unknown> = {};
  if (status) query.status = status;

  const skip = (page - 1) * limit;

  const [transactions, total] = await Promise.all([
    Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Transaction.countDocuments(query),
  ]);

  return {
    transactions,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

export async function getAnalytics(period = "30d") {
  let daysBack = 30;
  if (period === "7d") daysBack = 7;
  else if (period === "90d") daysBack = 90;
  else if (period === "1y") daysBack = 365;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);

  const [salesData, categoryData, userGrowth] = await Promise.all([
    Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Product.aggregate([
      { $match: { status: "approved" } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
    User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  return {
    salesData: salesData.map((d) => ({
      date: d._id as string,
      revenue: d.revenue as number,
      orders: d.orders as number,
    })),
    categoryData: categoryData.map((c) => ({
      category: c._id as string,
      count: c.count as number,
    })),
    userGrowth: userGrowth.map((u) => ({
      date: u._id as string,
      count: u.count as number,
    })),
  };
}
