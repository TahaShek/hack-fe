import { connectDB } from "@/lib/db";
import { withRole, type AuthenticatedRequest } from "@/lib/withAuth";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import Product from "@/models/Product";
import { z } from "zod/v4";

const bulkProductSchema = z.object({
  products: z.array(
    z.object({
      name: z.string().min(1),
      description: z.string().optional().default(""),
      category: z.string().optional().default("General"),
      price: z.union([z.number(), z.string()]).transform(Number),
      stock: z.union([z.number(), z.string()]).transform(Number).optional().default(0),
      compareAtPrice: z.union([z.number(), z.string()]).transform(Number).optional(),
    })
  ),
});

export const POST = withRole(["seller"], async (req: AuthenticatedRequest) => {
  try {
    await connectDB();
    const body = await req.json();

    const parsed = bulkProductSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Invalid product data. Each product needs at least a name and price.", 422);
    }

    const products = parsed.data.products.map((p) => {
      const slug = p.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .concat("-", Date.now().toString(36), Math.random().toString(36).slice(2, 5));
      return {
        name: p.name,
        description: p.description,
        category: p.category,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        stockQuantity: p.stock,
        sellerId: req.user.id,
        slug,
        skuCode: `SKU-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`,
        images: [],
        isApproved: false,
        isFlagged: false,
        variants: [],
        tags: [],
        rating: 0,
        reviewCount: 0,
        purchases: 0,
        status: "pending",
      };
    });

    const created = await Product.insertMany(products);
    return successResponse(
      { count: created.length, products: created },
      `${created.length} product(s) uploaded successfully`,
      201
    );
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status) return errorResponse(err.message || "Error", err.status);
    return errorResponse("Internal server error", 500);
  }
});
