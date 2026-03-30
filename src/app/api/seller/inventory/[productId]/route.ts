import { type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { withRole, type AuthenticatedRequest } from "@/lib/withAuth";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { updateStock } from "@/services/seller.service";
import { z } from "zod/v4";

const updateStockSchema = z.object({
  stockQuantity: z.number().int().min(0, "Stock must be non-negative"),
});

export const PUT = withRole(["seller"], async (req: AuthenticatedRequest, context?: Record<string, unknown>) => {
  try {
    await connectDB();
    const params = (context as { params: Promise<{ productId: string }> })?.params;
    const { productId } = await params;

    const body = await req.json();
    const parsed = updateStockSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Stock quantity must be a non-negative integer", 422);
    }

    const product = await updateStock(req.user.id, productId, parsed.data.stockQuantity);
    return successResponse(product, "Stock updated");
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status) return errorResponse(err.message || "Error", err.status);
    return errorResponse("Internal server error", 500);
  }
}) as (req: NextRequest, context: { params: Promise<{ productId: string }> }) => Promise<Response>;
