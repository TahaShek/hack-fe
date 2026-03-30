import Product from "@/models/Product";
import SearchLog from "@/models/SearchLog";

/** Map DB product to frontend-expected shape */
function mapProduct(p: Record<string, unknown>): Record<string, unknown> {
  const seller = p.sellerId as Record<string, unknown> | undefined;
  return {
    ...p,
    id: String(p._id),
    stock: p.stockQuantity ?? 0,
    sellerName: seller?.storeName ?? p.sellerName ?? "",
    sellerId: seller?._id ? String(seller._id) : String(p.sellerId ?? ""),
  };
}

interface ListProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  tags?: string;
}

export async function listProducts(params: ListProductsParams) {
  const {
    page = 1,
    limit = 20,
    search,
    category,
    minPrice,
    maxPrice,
    sort,
    tags,
  } = params;

  const query: Record<string, unknown> = {
    status: "approved",
    isApproved: true,
  };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { tags: { $regex: search, $options: "i" } },
    ];
  }

  if (category) query.category = category;

  if (minPrice !== undefined || maxPrice !== undefined) {
    const priceFilter: Record<string, number> = {};
    if (minPrice !== undefined) priceFilter.$gte = minPrice;
    if (maxPrice !== undefined) priceFilter.$lte = maxPrice;
    query.price = priceFilter;
  }

  if (tags) {
    query.tags = { $in: tags.split(",").map((t) => t.trim()) };
  }

  let sortObj: Record<string, 1 | -1> = { createdAt: -1 };
  switch (sort) {
    case "price_asc":
      sortObj = { price: 1 };
      break;
    case "price_desc":
      sortObj = { price: -1 };
      break;
    case "popular":
      sortObj = { purchases: -1 };
      break;
    case "rating":
      sortObj = { rating: -1 };
      break;
    case "deals":
      sortObj = { compareAtPrice: -1 };
      break;
    case "newest":
    default:
      sortObj = { createdAt: -1 };
  }

  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate("sellerId", "storeName storeLogoUrl")
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(query),
  ]);

  return {
    products: products.map((p) => mapProduct(p as unknown as Record<string, unknown>)),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

export async function getProduct(idOrSlug: string) {
  let product;

  // Try finding by slug first, then by ID
  product = await Product.findOne({ slug: idOrSlug, status: "approved" })
    .populate("sellerId", "storeName storeLogoUrl ownerName")
    .lean();

  if (!product) {
    product = await Product.findOne({ _id: idOrSlug, status: "approved" })
      .populate("sellerId", "storeName storeLogoUrl ownerName")
      .lean();
  }

  if (!product) {
    throw { status: 404, message: "Product not found" };
  }

  // Increment views
  await Product.updateOne({ _id: product._id }, { $inc: { views: 1 } });

  return mapProduct(product as unknown as Record<string, unknown>);
}

export async function searchProducts(query: string, limit = 10) {
  if (!query || query.trim().length === 0) {
    // Return popular searches when no query
    const popular = await SearchLog.find()
      .sort({ resultCount: -1 })
      .limit(limit)
      .select("query")
      .lean();
    return { suggestions: popular.map((p) => p.query), products: [] };
  }

  const products = await Product.find({
    status: "approved",
    $or: [
      { name: { $regex: query, $options: "i" } },
      { tags: { $regex: query, $options: "i" } },
      { category: { $regex: query, $options: "i" } },
    ],
  })
    .select("name slug price images category")
    .limit(limit)
    .lean();

  // Log the search
  await SearchLog.findOneAndUpdate(
    { query: query.toLowerCase().trim() },
    { $inc: { resultCount: 1 }, $setOnInsert: { query: query.toLowerCase().trim() } },
    { upsert: true }
  );

  // Extract unique suggestions from product names
  const suggestions = [...new Set(products.map((p) => p.name))].slice(0, 5);

  return { suggestions, products: products.map((p) => mapProduct(p as unknown as Record<string, unknown>)) };
}

export async function getCategories() {
  const categories = await Product.aggregate([
    { $match: { status: "approved" } },
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
        slug: { $first: { $toLower: "$category" } },
      },
    },
    { $sort: { count: -1 } },
  ]);

  return categories.map((c) => ({
    name: c._id as string,
    slug: (c.slug as string).replace(/\s+/g, "-"),
    productCount: c.count as number,
  }));
}
