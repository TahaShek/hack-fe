import Product from "@/models/Product";
import Order from "@/models/Order";
import User from "@/models/User";
import SearchLog from "@/models/SearchLog";
import mongoose from "mongoose";

function mapProduct(p: Record<string, unknown>): Record<string, unknown> {
  return {
    ...p,
    id: String(p._id),
    stock: p.stockQuantity ?? 0,
  };
}

export async function getRecommendations(
  userId?: string,
  productId?: string,
  limit = 10
) {
  if (productId) {
    // "Customers Also Bought" — find products frequently bought together
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw { status: 400, message: "Invalid product ID" };
    }

    const product = await Product.findById(productId);
    if (!product) {
      throw { status: 404, message: "Product not found" };
    }

    // Find orders containing this product, get other products from those orders
    const relatedOrders = await Order.find({
      "items.productId": productId,
    })
      .select("items")
      .limit(50)
      .lean();

    const relatedProductIds = new Set<string>();
    for (const order of relatedOrders) {
      for (const item of order.items) {
        const id = item.productId.toString();
        if (id !== productId) {
          relatedProductIds.add(id);
        }
      }
    }

    if (relatedProductIds.size > 0) {
      const related = await Product.find({
        _id: { $in: Array.from(relatedProductIds) },
        status: "approved",
      })
        .select("name slug price compareAtPrice images category rating reviewCount")
        .limit(limit)
        .lean();

      if (related.length > 0) return related.map((p) => mapProduct(p as unknown as Record<string, unknown>));
    }

    // Fallback: same category products
    const fallback = await Product.find({
      category: product.category,
      _id: { $ne: productId },
      status: "approved",
    })
      .select("name slug price compareAtPrice images category rating reviewCount stockQuantity")
      .sort({ purchases: -1 })
      .limit(limit)
      .lean();
    return fallback.map((p) => mapProduct(p as unknown as Record<string, unknown>));
  }

  if (userId) {
    // Personalized recommendations based on purchase history and wishlist
    const user = await User.findById(userId).select("wishlist");
    const recentOrders = await Order.find({ buyerId: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("items")
      .lean();

    const purchasedCategories = new Set<string>();
    const purchasedProductIds = new Set<string>();

    for (const order of recentOrders) {
      for (const item of order.items) {
        purchasedProductIds.add(item.productId.toString());
      }
    }

    // Get categories from purchased products
    if (purchasedProductIds.size > 0) {
      const purchasedProducts = await Product.find({
        _id: { $in: Array.from(purchasedProductIds) },
      })
        .select("category")
        .lean();

      for (const p of purchasedProducts) {
        purchasedCategories.add(p.category);
      }
    }

    // Add categories from wishlist
    if (user?.wishlist?.length) {
      const wishlistProducts = await Product.find({
        _id: { $in: user.wishlist },
      })
        .select("category")
        .lean();

      for (const p of wishlistProducts) {
        purchasedCategories.add(p.category);
      }
    }

    if (purchasedCategories.size > 0) {
      const recs = await Product.find({
        category: { $in: Array.from(purchasedCategories) },
        _id: { $nin: Array.from(purchasedProductIds) },
        status: "approved",
      })
        .select("name slug price compareAtPrice images category rating reviewCount stockQuantity")
        .sort({ purchases: -1, rating: -1 })
        .limit(limit)
        .lean();
      return recs.map((p) => mapProduct(p as unknown as Record<string, unknown>));
    }
  }

  // Default: trending/popular products
  const trending = await Product.find({ status: "approved" })
    .select("name slug price compareAtPrice images category rating reviewCount stockQuantity")
    .sort({ purchases: -1, rating: -1 })
    .limit(limit)
    .lean();
  return trending.map((p) => mapProduct(p as unknown as Record<string, unknown>));
}

/**
 * Build a fuzzy regex that tolerates typos by making each character optional
 * or allowing one-character substitution. This handles cases like:
 *   "iphon" → matches "iPhone"
 *   "headphon" → matches "Headphones"
 *   "wireles" → matches "Wireless"
 */
function buildFuzzyRegex(query: string): RegExp {
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Insert optional wildcard between each character to tolerate missing/extra chars
  const fuzzy = escaped.split("").join(".?");
  return new RegExp(fuzzy, "i");
}

export async function getAutocomplete(query: string, limit = 8) {
  if (!query || query.trim().length === 0) {
    // Return popular searches
    const popular = await SearchLog.find()
      .sort({ resultCount: -1 })
      .limit(limit)
      .select("query")
      .lean();
    return {
      suggestions: popular.map((p) => p.query),
      popularSearches: popular.map((p) => p.query),
      categories: [],
      products: [],
    };
  }

  const exactRegex = new RegExp(query, "i");
  const fuzzyRegex = buildFuzzyRegex(query);

  // Try exact match first, then fuzzy fallback
  const [exactProducts, fuzzyProducts, categories, popularSearches] = await Promise.all([
    Product.find({
      status: "approved",
      $or: [{ name: exactRegex }, { tags: exactRegex }, { category: exactRegex }],
    })
      .select("name slug price images category rating")
      .limit(5)
      .lean(),
    Product.find({
      status: "approved",
      $or: [{ name: fuzzyRegex }, { tags: fuzzyRegex }],
    })
      .select("name slug price images category rating")
      .limit(5)
      .lean(),
    Product.distinct("category", {
      status: "approved",
      $or: [{ category: exactRegex }, { category: fuzzyRegex }],
    }),
    SearchLog.find({ query: exactRegex })
      .sort({ resultCount: -1 })
      .limit(5)
      .select("query")
      .lean(),
  ]);

  // Merge exact + fuzzy, deduplicate by _id
  const seenIds = new Set<string>();
  const mergedProducts = [];
  for (const p of [...exactProducts, ...fuzzyProducts]) {
    const id = String(p._id);
    if (!seenIds.has(id)) {
      seenIds.add(id);
      mergedProducts.push(p);
    }
  }

  const suggestions = [
    ...popularSearches.map((s) => s.query),
    ...mergedProducts.map((p) => p.name),
  ];
  const uniqueSuggestions = [...new Set(suggestions)].slice(0, limit);

  // Log the search query to SearchLog collection
  SearchLog.findOneAndUpdate(
    { query: query.toLowerCase().trim() },
    { $inc: { resultCount: 1 }, $setOnInsert: { query: query.toLowerCase().trim() } },
    { upsert: true }
  ).catch(() => {
    // Non-blocking: silently ignore logging errors
  });

  return {
    suggestions: uniqueSuggestions,
    popularSearches: popularSearches.map((s) => s.query),
    categories: (categories as string[]).slice(0, 5),
    products: mergedProducts.slice(0, 5).map((p) => mapProduct(p as unknown as Record<string, unknown>)),
  };
}

function percentile(sortedArr: number[], p: number): number {
  if (sortedArr.length === 0) return 0;
  const idx = (p / 100) * (sortedArr.length - 1);
  const lower = Math.floor(idx);
  const upper = Math.ceil(idx);
  if (lower === upper) return sortedArr[lower];
  return sortedArr[lower] + (sortedArr[upper] - sortedArr[lower]) * (idx - lower);
}

export async function getSuggestedPricing(
  category: string,
  currentPrice?: number,
  stockQuantity?: number
) {
  const categoryProducts = await Product.find({
    category,
    status: "approved",
  })
    .select("price")
    .lean();

  if (categoryProducts.length === 0) {
    return {
      suggestedMin: null,
      suggestedMax: null,
      averagePrice: null,
      medianPrice: null,
      demandLevel: null,
      demandOrderCount: 0,
      competitorPrices: [],
      productCount: 0,
      message: "No comparable products found in this category. You are the first!",
    };
  }

  const prices = categoryProducts.map((p) => p.price).sort((a, b) => a - b);
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  const medianPrice = percentile(prices, 50);

  // --- Demand analysis: orders in this category over the last 30 days ---
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const productIdsInCategory = categoryProducts.map((p) => p._id);
  const demandOrders = await Order.countDocuments({
    "items.productId": { $in: productIdsInCategory },
    createdAt: { $gte: thirtyDaysAgo },
  });

  let demandLevel: "High" | "Medium" | "Low";
  let pMin: number;
  let pMax: number;

  if (demandOrders > 50) {
    demandLevel = "High";
    pMin = 60;
    pMax = 90;
  } else if (demandOrders < 10) {
    demandLevel = "Low";
    pMin = 20;
    pMax = 60;
  } else {
    demandLevel = "Medium";
    pMin = 25;
    pMax = 75;
  }

  let suggestedMin = Math.round(percentile(prices, pMin));
  let suggestedMax = Math.round(percentile(prices, pMax));

  // --- Stock quantity adjustment ---
  let stockAdjustment = "";
  if (stockQuantity !== undefined) {
    if (stockQuantity > 100) {
      // High stock: nudge prices down 5% to move inventory
      suggestedMin = Math.round(suggestedMin * 0.95);
      suggestedMax = Math.round(suggestedMax * 0.95);
      stockAdjustment = "Prices adjusted down ~5% to help move high inventory (>100 units).";
    } else if (stockQuantity < 10) {
      // Low stock / scarcity: nudge prices up 8%
      suggestedMin = Math.round(suggestedMin * 1.08);
      suggestedMax = Math.round(suggestedMax * 1.08);
      stockAdjustment = "Prices adjusted up ~8% due to limited stock scarcity (<10 units).";
    }
  }

  // Ensure min < max
  if (suggestedMin > suggestedMax) {
    [suggestedMin, suggestedMax] = [suggestedMax, suggestedMin];
  }

  // --- Competitor prices: 5 closest prices to the current price ---
  let competitorPrices: number[];
  if (currentPrice !== undefined) {
    competitorPrices = [...prices]
      .sort((a, b) => Math.abs(a - currentPrice) - Math.abs(b - currentPrice))
      .slice(0, 5);
  } else {
    // If no current price, take 5 evenly spaced prices across the range
    competitorPrices = prices.filter(
      (_v, i) => i % Math.max(1, Math.floor(prices.length / 5)) === 0
    ).slice(0, 5);
  }

  // --- Build detailed message ---
  const parts: string[] = [];
  parts.push(
    `Analyzed ${categoryProducts.length} competing products in "${category}".`
  );

  if (demandLevel === "High") {
    parts.push(
      `Demand is HIGH (${demandOrders} orders in 30 days) — pricing at the 60th-90th percentile to capture premium value.`
    );
  } else if (demandLevel === "Low") {
    parts.push(
      `Demand is LOW (${demandOrders} orders in 30 days) — pricing at the 20th-60th percentile to stay competitive.`
    );
  } else {
    parts.push(
      `Demand is MODERATE (${demandOrders} orders in 30 days) — pricing at the 25th-75th percentile for balanced positioning.`
    );
  }

  if (stockAdjustment) {
    parts.push(stockAdjustment);
  }

  if (currentPrice !== undefined) {
    if (currentPrice < suggestedMin) {
      parts.push(
        `Your price ($${currentPrice.toFixed(2)}) is below the suggested range. Consider raising it to maximize revenue.`
      );
    } else if (currentPrice > suggestedMax) {
      parts.push(
        `Your price ($${currentPrice.toFixed(2)}) is above the suggested range. Consider lowering it to stay competitive.`
      );
    } else {
      parts.push(
        `Your price ($${currentPrice.toFixed(2)}) is well-positioned within the suggested range.`
      );
    }
  }

  return {
    suggestedMin,
    suggestedMax,
    averagePrice: Math.round(avgPrice),
    medianPrice: Math.round(medianPrice),
    currentPrice: currentPrice ?? null,
    productCount: categoryProducts.length,
    demandLevel,
    demandOrderCount: demandOrders,
    competitorPrices: competitorPrices.sort((a, b) => a - b),
    message: parts.join(" "),
  };
}

interface ChatbotMessage {
  message: string;
  userId: string;
  context?: {
    orderId?: string;
  };
}

export async function handleChatbot(input: ChatbotMessage) {
  const { message, userId, context } = input;
  const lowerMessage = message.toLowerCase();

  // Intent: order_status
  if (
    lowerMessage.includes("order status") ||
    lowerMessage.includes("track") ||
    lowerMessage.includes("where is my order")
  ) {
    const orderId = context?.orderId || extractOrderId(message);
    if (orderId) {
      const order = await Order.findOne({
        $or: [
          { orderNumber: orderId },
          ...(mongoose.Types.ObjectId.isValid(orderId)
            ? [{ _id: orderId }]
            : []),
        ],
        buyerId: userId,
      }).lean();

      if (order) {
        return {
          intent: "order_status",
          response: `Your order ${order.orderNumber} is currently "${order.orderStatus}".${order.trackingId ? ` Tracking ID: ${order.trackingId}` : ""} Total: ${order.totalAmount}.`,
          data: {
            orderNumber: order.orderNumber,
            status: order.orderStatus,
            trackingId: order.trackingId,
          },
        };
      }
      return {
        intent: "order_status",
        response: "I couldn't find that order. Please double-check your order number.",
      };
    }

    // Show recent orders
    const recentOrders = await Order.find({ buyerId: userId })
      .sort({ createdAt: -1 })
      .limit(3)
      .select("orderNumber orderStatus totalAmount")
      .lean();

    if (recentOrders.length > 0) {
      const orderList = recentOrders
        .map((o) => `${o.orderNumber}: ${o.orderStatus}`)
        .join("\n");
      return {
        intent: "order_status",
        response: `Here are your recent orders:\n${orderList}\n\nWhich order would you like details about?`,
        data: { orders: recentOrders },
      };
    }

    return {
      intent: "order_status",
      response: "You don't have any orders yet. Start shopping to place your first order!",
    };
  }

  // Intent: return_request
  if (
    lowerMessage.includes("return") ||
    lowerMessage.includes("refund") ||
    lowerMessage.includes("exchange")
  ) {
    return {
      intent: "return_request",
      response:
        "To request a return, go to your Orders page, find the delivered order, and click 'Request Return'. Returns are accepted within 7 days of delivery. Would you like me to help with anything else?",
    };
  }

  // Intent: delivery_charges
  if (
    lowerMessage.includes("delivery") ||
    lowerMessage.includes("shipping") ||
    lowerMessage.includes("charge")
  ) {
    return {
      intent: "delivery_charges",
      response:
        "Standard delivery costs PKR 5 and takes 3-5 business days. Express delivery costs PKR 15 and takes 1-2 business days. Free shipping on orders above PKR 2,000!",
    };
  }

  // Intent: escalate
  if (
    lowerMessage.includes("human") ||
    lowerMessage.includes("agent") ||
    lowerMessage.includes("talk to") ||
    lowerMessage.includes("support")
  ) {
    return {
      intent: "escalate",
      response:
        "I'll connect you with a support agent. You can start a chat with the seller directly from the product or order page. Is there anything else I can help with?",
    };
  }

  // Default response
  return {
    intent: "general",
    response:
      "I can help you with:\n- Order status tracking\n- Return & refund requests\n- Delivery charges info\n- Connect to human support\n\nWhat would you like to know?",
  };
}

function extractOrderId(message: string): string | null {
  // Match NXM-XXXXX pattern
  const nxmMatch = message.match(/NXM-\d{5}/i);
  if (nxmMatch) return nxmMatch[0].toUpperCase();

  // Match MongoDB ObjectId pattern
  const objectIdMatch = message.match(/[a-f0-9]{24}/i);
  if (objectIdMatch) return objectIdMatch[0];

  return null;
}
