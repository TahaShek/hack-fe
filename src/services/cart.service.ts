import Cart from "@/models/Cart";
import Product from "@/models/Product";
import Coupon from "@/models/Coupon";
import mongoose from "mongoose";

function mapCartForFrontend(cart: Record<string, unknown>) {
  const items = (cart.items as Array<Record<string, unknown>>) || [];
  return {
    items: items.map((item) => {
      const prod = item.productId as Record<string, unknown> | null;
      return {
        id: String(item._id || item.productId),
        product: prod && typeof prod === "object" && prod._id ? {
          id: String(prod._id),
          name: prod.name,
          slug: prod.slug,
          price: prod.price,
          compareAtPrice: prod.compareAtPrice,
          images: prod.images || [],
          stock: prod.stockQuantity ?? 0,
          category: prod.category,
          rating: prod.rating ?? 0,
          reviewCount: prod.reviewCount ?? 0,
          variants: prod.variants || [],
          tags: prod.tags || [],
          sellerName: "",
          sellerId: "",
          status: prod.status || "approved",
          description: prod.description || "",
          createdAt: prod.createdAt || "",
        } : { id: String(item.productId), name: "Unknown", price: 0, images: [], stock: 0 },
        quantity: item.quantity,
        selectedVariants: item.selectedVariants || {},
      };
    }),
    couponCode: cart.couponCode || "",
    couponDiscount: cart.couponDiscount || 0,
  };
}

export async function getCart(userId: string) {
  let cart = await Cart.findOne({ userId }).populate({
    path: "items.productId",
    select: "name slug price compareAtPrice images stockQuantity category rating reviewCount variants tags description",
  });

  if (!cart) {
    cart = await Cart.create({ userId, items: [], couponDiscount: 0 });
  }

  return mapCartForFrontend(cart.toObject() as unknown as Record<string, unknown>);
}

export async function addItem(
  userId: string,
  productId: string,
  quantity: number,
  selectedVariants?: Record<string, string>
) {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw { status: 400, message: "Invalid product ID" };
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw { status: 404, message: "Product not found" };
  }
  if (product.stockQuantity < quantity) {
    throw { status: 400, message: "Insufficient stock" };
  }

  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = await Cart.create({ userId, items: [], couponDiscount: 0 });
  }

  const existingIndex = cart.items.findIndex(
    (item) => item.productId.toString() === productId
  );

  if (existingIndex >= 0) {
    const newQty = cart.items[existingIndex].quantity + quantity;
    if (newQty > product.stockQuantity) {
      throw { status: 400, message: "Insufficient stock for requested quantity" };
    }
    cart.items[existingIndex].quantity = newQty;
    if (selectedVariants) {
      cart.items[existingIndex].selectedVariants = selectedVariants as unknown as Map<string, string>;
    }
  } else {
    cart.items.push({
      productId: new mongoose.Types.ObjectId(productId),
      quantity,
      selectedVariants: (selectedVariants || {}) as unknown as Map<string, string>,
    });
  }

  await cart.save();
  return getCart(userId);
}

export async function updateQuantity(
  userId: string,
  productId: string,
  quantity: number
) {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw { status: 400, message: "Invalid product ID" };
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw { status: 404, message: "Product not found" };
  }
  if (quantity > product.stockQuantity) {
    throw { status: 400, message: "Insufficient stock" };
  }

  const cart = await Cart.findOne({ userId });
  if (!cart) {
    throw { status: 404, message: "Cart not found" };
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.productId.toString() === productId
  );

  if (itemIndex === -1) {
    throw { status: 404, message: "Item not in cart" };
  }

  if (quantity <= 0) {
    cart.items.splice(itemIndex, 1);
  } else {
    cart.items[itemIndex].quantity = quantity;
  }

  await cart.save();
  return getCart(userId);
}

export async function removeItem(userId: string, productId: string) {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw { status: 400, message: "Invalid product ID" };
  }

  const cart = await Cart.findOne({ userId });
  if (!cart) {
    throw { status: 404, message: "Cart not found" };
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.productId.toString() === productId
  );

  if (itemIndex === -1) {
    throw { status: 404, message: "Item not in cart" };
  }

  cart.items.splice(itemIndex, 1);
  await cart.save();

  return getCart(userId);
}

export async function applyCoupon(userId: string, couponCode: string) {
  const coupon = await Coupon.findOne({
    code: couponCode.toUpperCase(),
    isActive: true,
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() },
  });

  if (!coupon) {
    throw { status: 404, message: "Invalid or expired coupon code" };
  }

  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
    throw { status: 400, message: "Coupon usage limit reached" };
  }

  const cart = await Cart.findOne({ userId }).populate({
    path: "items.productId",
    select: "price",
  });
  if (!cart || cart.items.length === 0) {
    throw { status: 400, message: "Cart is empty" };
  }

  // Calculate cart total
  let cartTotal = 0;
  for (const item of cart.items) {
    const product = item.productId as unknown as { price: number };
    cartTotal += product.price * item.quantity;
  }

  if (cartTotal < coupon.minOrderAmount) {
    throw {
      status: 400,
      message: `Minimum order amount of ${coupon.minOrderAmount} required`,
    };
  }

  let discount: number;
  if (coupon.discountType === "percentage") {
    discount = (cartTotal * coupon.discountValue) / 100;
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else {
    discount = coupon.discountValue;
  }

  cart.couponCode = coupon.code;
  cart.couponDiscount = Math.min(discount, cartTotal);
  await cart.save();

  return {
    couponCode: coupon.code,
    discount: cart.couponDiscount,
    cartTotal,
    newTotal: cartTotal - cart.couponDiscount,
  };
}

export async function removeCoupon(userId: string) {
  const cart = await Cart.findOne({ userId });
  if (!cart) {
    throw { status: 404, message: "Cart not found" };
  }

  cart.couponCode = undefined;
  cart.couponDiscount = 0;
  await cart.save();

  return getCart(userId);
}

export async function clearCart(userId: string) {
  await Cart.findOneAndUpdate(
    { userId },
    { items: [], couponCode: undefined, couponDiscount: 0 }
  );
  return { message: "Cart cleared" };
}
