import { connectDB } from "@/lib/db";
import { withRole, type AuthenticatedRequest } from "@/lib/withAuth";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { getSuggestedPricing } from "@/services/ai.service";
import { z } from "zod/v4";

const pricingSchema = z.object({
  category: z.string().min(1, "Category is required"),
  currentPrice: z.number().min(0).optional(),
  stockQuantity: z.number().int().min(0).optional(),
});

export const POST = withRole(["seller"], async (req: AuthenticatedRequest) => {
  try {
    await connectDB();
    const body = await req.json();

    const parsed = pricingSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Category is required", 422);
    }

    const result = await getSuggestedPricing(
      parsed.data.category,
      parsed.data.currentPrice,
      parsed.data.stockQuantity
    );
    return successResponse(result);
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status) return errorResponse(err.message || "Error", err.status);
    return errorResponse("Internal server error", 500);
  }
});
