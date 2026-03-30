import { type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { withRole, type AuthenticatedRequest } from "@/lib/withAuth";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { updateProduct, deleteProduct } from "@/services/seller.service";
import { z } from "zod/v4";

const updateProductSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().min(10).optional(),
  category: z.string().min(1).optional(),
  subcategory: z.string().optional(),
  price: z.number().min(0).optional(),
  compareAtPrice: z.number().min(0).optional(),
  variants: z
    .array(
      z.object({
        name: z.string().min(1),
        type: z.enum(["size", "color", "material", "custom"]),
        options: z.array(
          z.object({
            value: z.string().min(1),
            price: z.number().optional(),
            stock: z.number().min(0),
          })
        ),
      })
    )
    .optional(),
  skuCode: z.string().min(1).optional(),
  stockQuantity: z.number().int().min(0).optional(),
  images: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

export const PUT = withRole(["seller"], async (req: AuthenticatedRequest, context?: Record<string, unknown>) => {
  try {
    await connectDB();
    const params = (context as { params: Promise<{ id: string }> })?.params;
    const { id } = await params;

    const body = await req.json();
    const parsed = updateProductSchema.safeParse(body);
    if (!parsed.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "general");
        if (!errors[key]) errors[key] = [];
        errors[key].push(issue.message);
      }
      return errorResponse("Validation failed", 422, errors);
    }

    const product = await updateProduct(req.user.id, id, parsed.data);
    return successResponse(product, "Product updated");
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status) return errorResponse(err.message || "Error", err.status);
    return errorResponse("Internal server error", 500);
  }
}) as (req: NextRequest, context: { params: Promise<{ id: string }> }) => Promise<Response>;

export const DELETE = withRole(["seller"], async (req: AuthenticatedRequest, context?: Record<string, unknown>) => {
  try {
    await connectDB();
    const params = (context as { params: Promise<{ id: string }> })?.params;
    const { id } = await params;

    const result = await deleteProduct(req.user.id, id);
    return successResponse(result);
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status) return errorResponse(err.message || "Error", err.status);
    return errorResponse("Internal server error", 500);
  }
}) as (req: NextRequest, context: { params: Promise<{ id: string }> }) => Promise<Response>;
