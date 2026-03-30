import { connectDB } from "@/lib/db";
import { withAuth, type AuthenticatedRequest } from "@/lib/withAuth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";
import { applyCoupon, removeCoupon } from "@/services/cart.service";
import { z } from "zod/v4";

const couponSchema = z.object({
  couponCode: z.string().min(1, "Coupon code is required"),
});

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    await connectDB();
    const body = await req.json();

    const parsed = couponSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Coupon code is required", 422);
    }

    const result = await applyCoupon(req.user.id, parsed.data.couponCode);
    return successResponse(result, "Coupon applied");
  } catch (error: unknown) {
    return handleApiError(error, "POST /cart/apply-coupon");
  }
});

export const DELETE = withAuth(async (req: AuthenticatedRequest) => {
  try {
    await connectDB();
    const cart = await removeCoupon(req.user.id);
    return successResponse(cart, "Coupon removed");
  } catch (error: unknown) {
    return handleApiError(error, "DELETE /cart/apply-coupon");
  }
});
