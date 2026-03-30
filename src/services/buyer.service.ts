import User from "@/models/User";
import Product from "@/models/Product";
import Order from "@/models/Order";
import mongoose from "mongoose";

// Map DB order fields to frontend-expected shape
function mapOrder(order: Record<string, unknown>) {
  return {
    ...order,
    id: String(order._id),
    total: order.totalAmount ?? order.total,
    status: order.orderStatus ?? order.status,
  };
}

interface UpdateProfileInput {
  fullName?: string;
  phone?: string;
  avatar?: string;
  addresses?: Array<{
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
  }>;
}

export async function getProfile(userId: string) {
  const user = await User.findById(userId).select("-passwordHash");
  if (!user) {
    throw { status: 404, message: "User not found" };
  }
  return user;
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const updateData: Record<string, unknown> = {};
  if (input.fullName) updateData.fullName = input.fullName;
  if (input.phone) updateData.phone = input.phone;
  if (input.avatar) updateData.avatar = input.avatar;
  if (input.addresses) updateData.addresses = input.addresses;

  const user = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  }).select("-passwordHash");

  if (!user) {
    throw { status: 404, message: "User not found" };
  }
  return user;
}

export async function getWishlist(userId: string) {
  const user = await User.findById(userId).populate({
    path: "wishlist",
    select: "name slug price compareAtPrice images category rating reviewCount stockQuantity sellerId",
    populate: { path: "sellerId", select: "storeName" },
  });
  if (!user) {
    throw { status: 404, message: "User not found" };
  }
  // Map to frontend-expected format
  return (user.wishlist || []).map((item: unknown) => {
    const p = (typeof (item as Record<string, unknown>).toObject === "function"
      ? (item as { toObject: () => Record<string, unknown> }).toObject()
      : item) as Record<string, unknown>;
    const seller = p.sellerId as Record<string, unknown> | undefined;
    return {
      ...p,
      id: String(p._id),
      stock: p.stockQuantity ?? 0,
      sellerName: seller?.storeName ?? "",
      sellerId: seller?._id ? String(seller._id) : String(p.sellerId ?? ""),
    };
  });
}

export async function addToWishlist(userId: string, productId: string) {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw { status: 400, message: "Invalid product ID" };
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw { status: 404, message: "Product not found" };
  }

  const user = await User.findById(userId);
  if (!user) {
    throw { status: 404, message: "User not found" };
  }

  const alreadyInWishlist = user.wishlist.some(
    (id) => id.toString() === productId
  );
  if (alreadyInWishlist) {
    throw { status: 409, message: "Product already in wishlist" };
  }

  user.wishlist.push(new mongoose.Types.ObjectId(productId));
  await user.save();

  return { message: "Product added to wishlist" };
}

export async function removeFromWishlist(userId: string, productId: string) {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw { status: 400, message: "Invalid product ID" };
  }

  const user = await User.findById(userId);
  if (!user) {
    throw { status: 404, message: "User not found" };
  }

  const index = user.wishlist.findIndex((id) => id.toString() === productId);
  if (index === -1) {
    throw { status: 404, message: "Product not in wishlist" };
  }

  user.wishlist.splice(index, 1);
  await user.save();

  return { message: "Product removed from wishlist" };
}

export async function getOrders(
  userId: string,
  page = 1,
  limit = 10,
  status?: string
) {
  const query: Record<string, unknown> = { buyerId: userId };
  if (status) {
    query.orderStatus = status;
  }

  const skip = (page - 1) * limit;

  const [rawOrders, total] = await Promise.all([
    Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments(query),
  ]);

  const orders = rawOrders.map((o) => mapOrder(o as unknown as Record<string, unknown>));

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

export async function getOrderById(userId: string, orderId: string) {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw { status: 400, message: "Invalid order ID" };
  }

  const order = await Order.findOne({ _id: orderId, buyerId: userId }).lean();
  if (!order) {
    throw { status: 404, message: "Order not found" };
  }
  return mapOrder(order as unknown as Record<string, unknown>);
}

export async function requestReturn(
  userId: string,
  orderId: string,
  reason: string
) {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw { status: 400, message: "Invalid order ID" };
  }

  const order = await Order.findOne({ _id: orderId, buyerId: userId });
  if (!order) {
    throw { status: 404, message: "Order not found" };
  }

  if (order.orderStatus !== "delivered") {
    throw { status: 400, message: "Only delivered orders can be returned" };
  }

  order.orderStatus = "cancelled";
  order.set("returnReason", reason);
  order.set("returnRequestedAt", new Date());
  await order.save();

  return order;
}
