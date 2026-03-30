import Cart from "@/models/Cart";
import Product from "@/models/Product";
import Order from "@/models/Order";
import User from "@/models/User";
import Seller from "@/models/Seller";
import Coupon from "@/models/Coupon";
import Counter from "@/models/Counter";
import mongoose from "mongoose";

function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const dayOfWeek = result.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      added++;
    }
  }
  return result;
}

interface CreateOrderInput {
  shippingAddress: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  deliveryMethod?: string;
}

async function generateOrderNumber(): Promise<string> {
  const counter = await Counter.findOneAndUpdate(
    { name: "order" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  const num = String(counter.seq).padStart(5, "0");
  return `NXM-${num}`;
}

export async function createOrder(userId: string, input: CreateOrderInput) {
  const cart = await Cart.findOne({ userId }).populate({
    path: "items.productId",
    select: "name price compareAtPrice images stockQuantity sellerId category",
  });

  if (!cart || cart.items.length === 0) {
    throw { status: 400, message: "Cart is empty" };
  }

  const buyer = await User.findById(userId).select("fullName");
  if (!buyer) {
    throw { status: 404, message: "Buyer not found" };
  }

  // Group items by seller
  const sellerGroups: Record<
    string,
    Array<{
      productId: mongoose.Types.ObjectId;
      productName: string;
      productImage: string;
      quantity: number;
      price: number;
      variants: Record<string, string>;
      sellerId: string;
    }>
  > = {};

  for (const item of cart.items) {
    const product = item.productId as unknown as {
      _id: mongoose.Types.ObjectId;
      name: string;
      price: number;
      images: string[];
      stockQuantity: number;
      sellerId: mongoose.Types.ObjectId;
    };

    // Validate stock
    if (product.stockQuantity < item.quantity) {
      throw {
        status: 400,
        message: `Insufficient stock for "${product.name}". Available: ${product.stockQuantity}`,
      };
    }

    const sellerId = product.sellerId.toString();
    if (!sellerGroups[sellerId]) {
      sellerGroups[sellerId] = [];
    }

    sellerGroups[sellerId].push({
      productId: product._id,
      productName: product.name,
      productImage: product.images[0] || "",
      quantity: item.quantity,
      price: product.price,
      variants: (item.selectedVariants as unknown as Record<string, string>) || {},
      sellerId,
    });
  }

  const orders = [];

  // Pre-fetch seller names
  const sellerIds = Object.keys(sellerGroups);
  const sellers = await Seller.find({ _id: { $in: sellerIds } }).select("storeName").lean();
  const sellerNameMap: Record<string, string> = {};
  for (const s of sellers) {
    sellerNameMap[String(s._id)] = s.storeName;
  }

  for (const [sellerId, items] of Object.entries(sellerGroups)) {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = input.deliveryMethod === "express" ? 15 : 5;
    const tax = Math.round(subtotal * 0.05 * 100) / 100; // 5% tax

    // Calculate proportional coupon discount
    const cartTotal = cart.items.reduce((sum, item) => {
      const prod = item.productId as unknown as { price: number };
      return sum + prod.price * item.quantity;
    }, 0);
    const proportion = cartTotal > 0 ? subtotal / cartTotal : 0;
    const discount = Math.round(cart.couponDiscount * proportion * 100) / 100;

    const totalAmount = Math.max(0, subtotal + shipping + tax - discount);

    const orderNumber = await generateOrderNumber();

    const deliveryMethod = input.deliveryMethod || "standard";
    const businessDays = deliveryMethod === "express" ? 2 : 5;
    const estimatedDeliveryDate = addBusinessDays(new Date(), businessDays);

    const order = await Order.create({
      orderNumber,
      buyerId: userId,
      buyerName: buyer.fullName,
      sellerId,
      sellerName: sellerNameMap[sellerId] || "",
      items: items.map(({ sellerId: _s, ...rest }) => rest),
      shippingAddress: input.shippingAddress,
      deliveryMethod,
      paymentMethod: input.paymentMethod,
      paymentStatus: "pending",
      orderStatus: "pending",
      estimatedDeliveryDate,
      subtotal,
      discount,
      shipping,
      tax,
      totalAmount,
      couponApplied: cart.couponCode,
    });

    orders.push(order);
  }

  // Deduct stock
  for (const item of cart.items) {
    const product = item.productId as unknown as { _id: mongoose.Types.ObjectId };
    await Product.updateOne(
      { _id: product._id },
      { $inc: { stockQuantity: -item.quantity, purchases: item.quantity } }
    );
  }

  // Increment coupon usage
  if (cart.couponCode) {
    await Coupon.updateOne(
      { code: cart.couponCode },
      { $inc: { usedCount: 1 } }
    );
  }

  // Clear cart
  cart.items = [];
  cart.couponCode = undefined;
  cart.couponDiscount = 0;
  await cart.save();

  return orders;
}
