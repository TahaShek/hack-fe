import { connectDB } from "@/lib/db";
import { withRole, type AuthenticatedRequest } from "@/lib/withAuth";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { getProducts, createProduct } from "@/services/seller.service";
import { z } from "zod/v4";

const createProductSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().optional(),
  price: z.number().min(0, "Price must be positive"),
  compareAtPrice: z.number().min(0).optional(),
  variants: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string().min(1),
        type: z.string().optional().default("custom"),
        options: z.array(
          z.object({
            id: z.string().optional(),
            value: z.string().min(1),
            price: z.number().optional(),
            stock: z.number().min(0).optional().default(0),
          })
        ),
      })
    )
    .optional(),
  skuCode: z.string().optional(),
  stock: z.number().int().min(0).optional(),
  stockQuantity: z.number().int().min(0).optional(),
  images: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

export const GET = withRole(["seller"], async (req: AuthenticatedRequest) => {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;
    const category = searchParams.get("category") || undefined;
    const sort = searchParams.get("sort") || undefined;

    const data = await getProducts(req.user.id, page, limit, search, status, category, sort);
    return successResponse(data);
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status) return errorResponse(err.message || "Error", err.status);
    return errorResponse("Internal server error", 500);
  }
});

export const POST = withRole(["seller"], async (req: AuthenticatedRequest) => {
  try {
    await connectDB();
    const body = await req.json();

    const parsed = createProductSchema.safeParse(body);
    if (!parsed.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "general");
        if (!errors[key]) errors[key] = [];
        errors[key].push(issue.message);
      }
      return errorResponse("Validation failed", 422, errors);
    }

    const product = await createProduct(req.user.id, parsed.data);
    return successResponse(product, "Product created", 201);
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status) return errorResponse(err.message || "Error", err.status);
    return errorResponse("Internal server error", 500);
  }
});
